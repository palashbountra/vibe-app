#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AuthStack } from '../lib/stacks/AuthStack';
import { DatabaseStack } from '../lib/stacks/DatabaseStack';
import { StorageStack } from '../lib/stacks/StorageStack';
import { LambdaStack } from '../lib/stacks/LambdaStack';
import { ApiStack } from '../lib/stacks/ApiStack';
import { NotificationsStack } from '../lib/stacks/NotificationsStack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region:  process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
};

// ── Stack instantiation order matters — respect cross-stack dependencies ──────

const authStack = new AuthStack(app, 'VibeAuthStack', { env });

const dbStack = new DatabaseStack(app, 'VibeDatabaseStack', { env });

const storageStack = new StorageStack(app, 'VibeStorageStack', { env });

const lambdaStack = new LambdaStack(app, 'VibeLambdaStack', {
  env,
  vpc:                dbStack.vpc,
  lambdaSecurityGroup: dbStack.lambdaSecurityGroup,
  dbSecret:           dbStack.dbSecret,
  mediaBucket:        storageStack.mediaBucket,
});
lambdaStack.addDependency(dbStack);
lambdaStack.addDependency(storageStack);

const apiStack = new ApiStack(app, 'VibeApiStack', {
  env,
  userPool:       authStack.userPool,
  userPoolClient: authStack.userPoolClient,
  functions:      lambdaStack.functions,
});
apiStack.addDependency(authStack);
apiStack.addDependency(lambdaStack);

new NotificationsStack(app, 'VibeNotificationsStack', { env });

// ── Resource tags applied to everything ──────────────────────────────────────
cdk.Tags.of(app).add('Project', 'Vibe');
cdk.Tags.of(app).add('ManagedBy', 'CDK');
