import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

interface AuthStackProps extends cdk.StackProps { appEnv: string; }

export class AuthStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props);
    const { appEnv } = props;
    const isProd = appEnv === 'prod';

    this.userPool = new cognito.UserPool(this, 'VibeUserPool', {
      userPoolName: `vibe-users-${appEnv}`,
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      standardAttributes: {
        email: { required: true, mutable: false },
        givenName: { required: true, mutable: true },
        birthdate: { required: true, mutable: false },
      },
      passwordPolicy: { minLength: 8, requireLowercase: true, requireDigits: true },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    this.userPoolClient = this.userPool.addClient('VibeAppClient', {
      userPoolClientName: `vibe-app-${appEnv}`,
      authFlows: { userSrp: true },
      oAuth: {
        flows: { authorizationCodeGrant: true },
        scopes: [cognito.OAuthScope.EMAIL, cognito.OAuthScope.OPENID, cognito.OAuthScope.PROFILE],
        callbackUrls: ['vibeapp://auth/callback', ...(appEnv !== 'prod' ? ['exp://localhost:8081/--/auth/callback'] : [])],
        logoutUrls: ['vibeapp://auth/logout'],
      },
      accessTokenValidity: cdk.Duration.minutes(60),
      refreshTokenValidity: cdk.Duration.days(30),
      preventUserExistenceErrors: true,
    });

    new cdk.CfnOutput(this, 'UserPoolId', { value: this.userPool.userPoolId, exportName: `Vibe-UserPoolId-${appEnv}` });
    new cdk.CfnOutput(this, 'UserPoolClientId', { value: this.userPoolClient.userPoolClientId, exportName: `Vibe-UserPoolClientId-${appEnv}` });
  }
}
