import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as authorizers from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

interface ApiStackProps extends cdk.StackProps {
  userPool: cognito.UserPool;
  userPoolClient: cognito.UserPoolClient;
  functions: Record<string, nodejs.NodejsFunction>;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const { userPool, functions } = props;

    // ── REST API (API Gateway v1) ─────────────────────────────────────────────
    // Handles: auth, users, music, matching
    const restApi = new apigateway.RestApi(this, 'VibeRestApi', {
      restApiName: 'vibe-api',
      description: 'Vibe REST API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Authorization', 'Content-Type'],
      },
      deployOptions: {
        stageName: 'v1',
        throttlingRateLimit: 1000,
        throttlingBurstLimit: 500,
      },
    });

    // Cognito Authorizer — protects all routes except /auth/register + /auth/login
    const cognitoAuthorizer = new apigateway.CognitoUserPoolsAuthorizer(
      this,
      'CognitoAuth',
      { cognitoUserPools: [userPool] },
    );

    const authOpts: apigateway.MethodOptions = {
      authorizer: cognitoAuthorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    };

    // Helper to create a Lambda integration
    const fn = (name: string) =>
      new apigateway.LambdaIntegration(functions[name], { proxy: true });

    // ── Routes ────────────────────────────────────────────────────────────────
    // POST /auth/register  (public)
    // POST /auth/login     (public)
    const authRes = restApi.root.addResource('auth');
    authRes.addResource('register').addMethod('POST', fn('authRegister'));
    authRes.addResource('login').addMethod('POST', fn('authLogin'));

    // GET  /users/me              (protected)
    // PUT  /users/me              (protected)
    // POST /users/me/photo        (protected)
    const usersRes = restApi.root.addResource('users');
    const meRes = usersRes.addResource('me');
    meRes.addMethod('GET', fn('usersGetProfile'), authOpts);
    meRes.addMethod('PUT', fn('usersUpdateProfile'), authOpts);
    meRes.addResource('photo').addMethod('POST', fn('usersUploadPhoto'), authOpts);

    // POST /music/sync            (protected) — pull from Spotify/Apple Music
    // GET  /music/now-playing     (protected)
    const musicRes = restApi.root.addResource('music');
    musicRes.addResource('sync').addMethod('POST', fn('musicSync'), authOpts);
    musicRes.addResource('now-playing').addMethod('GET', fn('musicNowPlaying'), authOpts);

    // GET  /matching/feed         (protected) — paginated swipe deck
    // POST /matching/swipe        (protected) — record like/pass
    // GET  /matching/matches      (protected) — list of matched users
    const matchingRes = restApi.root.addResource('matching');
    matchingRes.addResource('feed').addMethod('GET', fn('matchingFeed'), authOpts);
    matchingRes.addResource('swipe').addMethod('POST', fn('matchingSwipe'), authOpts);
    matchingRes.addResource('matches').addMethod('GET', fn('matchingList'), authOpts);

    // GET  /chat/{matchId}/messages  (protected)
    const chatRes = restApi.root.addResource('chat');
    const matchChatRes = chatRes.addResource('{matchId}');
    matchChatRes.addResource('messages').addMethod('GET', fn('chatMessages'), authOpts);

    // ── WebSocket API (API Gateway v2) ────────────────────────────────────────
    // Used for: real-time chat message delivery + "now playing" updates
    const wsApi = new apigatewayv2.WebSocketApi(this, 'VibeWsApi', {
      apiName: 'vibe-ws',
      connectRouteOptions: {
        integration: new integrations.WebSocketLambdaIntegration(
          'WsConnectInt',
          functions['wsConnect'],
        ),
      },
      disconnectRouteOptions: {
        integration: new integrations.WebSocketLambdaIntegration(
          'WsDisconnectInt',
          functions['wsDisconnect'],
        ),
      },
      defaultRouteOptions: {
        integration: new integrations.WebSocketLambdaIntegration(
          'WsSendInt',
          functions['wsSendMessage'],
        ),
      },
    });

    const wsStage = new apigatewayv2.WebSocketStage(this, 'VibeWsStage', {
      webSocketApi: wsApi,
      stageName: 'v1',
      autoDeploy: true,
    });

    // ── Outputs ───────────────────────────────────────────────────────────────
    new cdk.CfnOutput(this, 'RestApiUrl', { value: restApi.url });
    new cdk.CfnOutput(this, 'WsApiUrl', { value: wsStage.url });
  }
}
