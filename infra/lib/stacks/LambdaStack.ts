import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as path from 'path';

interface LambdaStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  lambdaSecurityGroup: ec2.SecurityGroup;
  dbSecret: secretsmanager.Secret;
  mediaBucket: s3.Bucket;
}

export class LambdaStack extends cdk.Stack {
  // Expose function ARNs so ApiStack can create routes
  public readonly functions: Record<string, nodejs.NodejsFunction>;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    const { vpc, lambdaSecurityGroup, dbSecret, mediaBucket } = props;

    // ── Shared Lambda config ──────────────────────────────────────────────────
    const sharedEnv: Record<string, string> = {
      NODE_ENV: process.env.DEPLOY_ENV ?? 'dev',
      DB_SECRET_ARN: dbSecret.secretArn,
      MEDIA_BUCKET: mediaBucket.bucketName,
    };

    const sharedLambdaProps: Partial<nodejs.NodejsFunctionProps> = {
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64, // Graviton2 — cheaper + faster
      timeout: cdk.Duration.seconds(29),        // API Gateway max is 29s
      memorySize: 512,
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [lambdaSecurityGroup],
      environment: sharedEnv,
      bundling: {
        minify: true,
        sourceMap: true,
        target: 'node20',
        externalModules: ['@aws-sdk/*'], // SDK v3 is available in Lambda runtime
      },
    };

    const fnDir = path.join(__dirname, '../../../backend/functions');

    // ── Auth functions ────────────────────────────────────────────────────────
    const authRegister = new nodejs.NodejsFunction(this, 'AuthRegister', {
      ...sharedLambdaProps,
      entry: `${fnDir}/auth/register.ts`,
      handler: 'handler',
      functionName: 'vibe-auth-register',
    });

    const authLogin = new nodejs.NodejsFunction(this, 'AuthLogin', {
      ...sharedLambdaProps,
      entry: `${fnDir}/auth/login.ts`,
      handler: 'handler',
      functionName: 'vibe-auth-login',
    });

    // ── User functions ────────────────────────────────────────────────────────
    const usersGetProfile = new nodejs.NodejsFunction(this, 'UsersGetProfile', {
      ...sharedLambdaProps,
      entry: `${fnDir}/users/getProfile.ts`,
      handler: 'handler',
      functionName: 'vibe-users-get-profile',
    });

    const usersUpdateProfile = new nodejs.NodejsFunction(this, 'UsersUpdateProfile', {
      ...sharedLambdaProps,
      entry: `${fnDir}/users/updateProfile.ts`,
      handler: 'handler',
      functionName: 'vibe-users-update-profile',
    });

    const usersUploadPhoto = new nodejs.NodejsFunction(this, 'UsersUploadPhoto', {
      ...sharedLambdaProps,
      entry: `${fnDir}/users/uploadPhoto.ts`,
      handler: 'handler',
      functionName: 'vibe-users-upload-photo',
      memorySize: 1024, // photo processing needs more RAM
    });

    // ── Music functions ───────────────────────────────────────────────────────
    const musicSync = new nodejs.NodejsFunction(this, 'MusicSync', {
      ...sharedLambdaProps,
      entry: `${fnDir}/music/syncProfile.ts`,
      handler: 'handler',
      functionName: 'vibe-music-sync',
      timeout: cdk.Duration.seconds(29),
    });

    const musicNowPlaying = new nodejs.NodejsFunction(this, 'MusicNowPlaying', {
      ...sharedLambdaProps,
      entry: `${fnDir}/music/nowPlaying.ts`,
      handler: 'handler',
      functionName: 'vibe-music-now-playing',
      memorySize: 256, // lightweight polling
    });

    // ── Matching functions ────────────────────────────────────────────────────
    const matchingFeed = new nodejs.NodejsFunction(this, 'MatchingFeed', {
      ...sharedLambdaProps,
      entry: `${fnDir}/matching/getFeed.ts`,
      handler: 'handler',
      functionName: 'vibe-matching-feed',
      memorySize: 1024, // vector math
    });

    const matchingSwipe = new nodejs.NodejsFunction(this, 'MatchingSwipe', {
      ...sharedLambdaProps,
      entry: `${fnDir}/matching/swipe.ts`,
      handler: 'handler',
      functionName: 'vibe-matching-swipe',
    });

    const matchingList = new nodejs.NodejsFunction(this, 'MatchingList', {
      ...sharedLambdaProps,
      entry: `${fnDir}/matching/getMatches.ts`,
      handler: 'handler',
      functionName: 'vibe-matching-list',
    });

    // ── Chat functions ────────────────────────────────────────────────────────
    const chatMessages = new nodejs.NodejsFunction(this, 'ChatMessages', {
      ...sharedLambdaProps,
      entry: `${fnDir}/chat/getMessages.ts`,
      handler: 'handler',
      functionName: 'vibe-chat-messages',
    });

    // WebSocket connect/disconnect/send handlers
    const wsConnect = new nodejs.NodejsFunction(this, 'WsConnect', {
      ...sharedLambdaProps,
      entry: `${fnDir}/chat/wsConnect.ts`,
      handler: 'handler',
      functionName: 'vibe-ws-connect',
    });

    const wsDisconnect = new nodejs.NodejsFunction(this, 'WsDisconnect', {
      ...sharedLambdaProps,
      entry: `${fnDir}/chat/wsDisconnect.ts`,
      handler: 'handler',
      functionName: 'vibe-ws-disconnect',
    });

    const wsSendMessage = new nodejs.NodejsFunction(this, 'WsSendMessage', {
      ...sharedLambdaProps,
      entry: `${fnDir}/chat/wsSendMessage.ts`,
      handler: 'handler',
      functionName: 'vibe-ws-send-message',
    });

    // ── Permissions ───────────────────────────────────────────────────────────
    // All functions can read the DB secret
    const allFunctions = [
      authRegister, authLogin,
      usersGetProfile, usersUpdateProfile, usersUploadPhoto,
      musicSync, musicNowPlaying,
      matchingFeed, matchingSwipe, matchingList,
      chatMessages, wsConnect, wsDisconnect, wsSendMessage,
    ];

    allFunctions.forEach(fn => dbSecret.grantRead(fn));

    // Photo upload lambda can write to S3
    mediaBucket.grantPut(usersUploadPhoto);
    mediaBucket.grantRead(usersGetProfile);

    // WebSocket send needs to call API Gateway Management API
    // (ARN added in ApiStack after APIGW is created)
    const wsMgmtPolicy = new iam.Policy(this, 'WsMgmtPolicy', {
      statements: [
        new iam.PolicyStatement({
          actions: ['execute-api:ManageConnections'],
          resources: ['arn:aws:execute-api:*:*:*/@connections/*'],
        }),
      ],
    });
    wsSendMessage.role?.attachInlinePolicy(wsMgmtPolicy);

    // ── Expose for ApiStack ───────────────────────────────────────────────────
    this.functions = {
      authRegister,
      authLogin,
      usersGetProfile,
      usersUpdateProfile,
      usersUploadPhoto,
      musicSync,
      musicNowPlaying,
      matchingFeed,
      matchingSwipe,
      matchingList,
      chatMessages,
      wsConnect,
      wsDisconnect,
      wsSendMessage,
    };
  }
}
