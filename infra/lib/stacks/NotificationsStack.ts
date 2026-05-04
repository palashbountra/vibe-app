import * as cdk from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';

interface NotificationsStackProps extends cdk.StackProps { appEnv: string; }

export class NotificationsStack extends cdk.Stack {
  public readonly notificationsTopic: sns.Topic;
  constructor(scope: Construct, id: string, props: NotificationsStackProps) {
    super(scope, id, props);
    this.notificationsTopic = new sns.Topic(this, 'NotificationsTopic', {
      topicName: `vibe-notifications-${props.appEnv}`,
    });
    new cdk.CfnOutput(this, 'NotificationsTopicArn', { value: this.notificationsTopic.topicArn });
  }
}
