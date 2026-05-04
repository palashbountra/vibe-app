import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export class DatabaseStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly dbCluster: rds.DatabaseCluster;
  public readonly dbSecret: secretsmanager.Secret;
  public readonly dbSecurityGroup: ec2.SecurityGroup;
  public readonly lambdaSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ── VPC ──────────────────────────────────────────────────────────────────
    // 2 AZs, public + private + isolated subnets
    // Lambdas go in private subnets; Aurora goes in isolated (no NAT egress)
    this.vpc = new ec2.Vpc(this, 'VibeVpc', {
      maxAzs: 2,
      natGateways: 1, // 1 NAT for Lambda → internet (Spotify API calls)
      subnetConfiguration: [
        { name: 'public',   subnetType: ec2.SubnetType.PUBLIC,            cidrMask: 24 },
        { name: 'private',  subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS, cidrMask: 24 },
        { name: 'isolated', subnetType: ec2.SubnetType.PRIVATE_ISOLATED,  cidrMask: 24 },
      ],
    });

    // ── Security Groups ───────────────────────────────────────────────────────
    this.lambdaSecurityGroup = new ec2.SecurityGroup(this, 'LambdaSG', {
      vpc: this.vpc,
      description: 'Lambda functions security group',
      allowAllOutbound: true,
    });

    this.dbSecurityGroup = new ec2.SecurityGroup(this, 'DatabaseSG', {
      vpc: this.vpc,
      description: 'Aurora PostgreSQL security group',
      allowAllOutbound: false,
    });

    // Only allow Lambda SG to reach the DB on port 5432
    this.dbSecurityGroup.addIngressRule(
      this.lambdaSecurityGroup,
      ec2.Port.tcp(5432),
      'Allow Lambda to connect to Aurora',
    );

    // ── DB Credentials Secret ─────────────────────────────────────────────────
    this.dbSecret = new secretsmanager.Secret(this, 'VibeDbSecret', {
      secretName: '/vibe/db/credentials',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'vibeadmin' }),
        generateStringKey: 'password',
        excludeCharacters: '/@" ',
      },
    });

    // ── Aurora PostgreSQL Serverless v2 ───────────────────────────────────────
    this.dbCluster = new rds.DatabaseCluster(this, 'VibeDb', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_15_4,
      }),
      credentials: rds.Credentials.fromSecret(this.dbSecret),
      serverlessV2MinCapacity: 0.5,  // ~$0.06/hr when idle
      serverlessV2MaxCapacity: 16,   // scales up for match queries
      writer: rds.ClusterInstance.serverlessV2('writer'),
      readers: [
        // Add a reader in prod; comment out in dev to save cost
        // rds.ClusterInstance.serverlessV2('reader', { scaleWithWriter: true }),
      ],
      vpc: this.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [this.dbSecurityGroup],
      defaultDatabaseName: 'vibe',
      deletionProtection: false, // set true for prod
      removalPolicy: cdk.RemovalPolicy.DESTROY, // set RETAIN for prod
      backup: { retention: cdk.Duration.days(7) },
      cloudwatchLogsExports: ['postgresql'],
    });

    // ── DynamoDB — Chat Messages ──────────────────────────────────────────────
    // PK: matchId, SK: timestamp#messageId — allows querying all messages in a match
    const chatTable = new cdk.aws_dynamodb.Table(this, 'ChatTable', {
      tableName: 'vibe-chat-messages',
      partitionKey: { name: 'matchId', type: cdk.aws_dynamodb.AttributeType.STRING },
      sortKey:      { name: 'sk',      type: cdk.aws_dynamodb.AttributeType.STRING },
      billingMode: cdk.aws_dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'ttl', // expire old messages if desired
      removalPolicy: cdk.RemovalPolicy.DESTROY, // set RETAIN for prod
    });

    // ── Outputs ───────────────────────────────────────────────────────────────
    new cdk.CfnOutput(this, 'VpcId', { value: this.vpc.vpcId });
    new cdk.CfnOutput(this, 'DbClusterEndpoint', {
      value: this.dbCluster.clusterEndpoint.hostname,
    });
    new cdk.CfnOutput(this, 'DbSecretArn', { value: this.dbSecret.secretArn });
    new cdk.CfnOutput(this, 'ChatTableName', { value: chatTable.tableName });
  }
}
