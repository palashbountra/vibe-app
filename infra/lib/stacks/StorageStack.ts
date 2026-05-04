import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs';

export class StorageStack extends cdk.Stack {
  public readonly mediaBucket: s3.Bucket;
  public readonly cdn: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ── S3 Media Bucket ───────────────────────────────────────────────────────
    // Stores: profile photos, audio snippets (future)
    // Layout:  s3://vibe-media-{env}/
    //            profile-photos/{userId}/{filename}
    //            audio-clips/{userId}/{filename}
    this.mediaBucket = new s3.Bucket(this, 'VibeMedisBucket', {
      bucketName: `vibe-media-${this.account}-${this.region}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // served via CloudFront only
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: false,
      lifecycleRules: [
        {
          // Expire multipart upload fragments after 1 day
          abortIncompleteMultipartUploadAfter: cdk.Duration.days(1),
        },
      ],
      cors: [
        {
          allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.GET],
          allowedOrigins: ['*'], // tighten to your domain in prod
          allowedHeaders: ['*'],
          maxAge: 3000,
        },
      ],
      removalPolicy: cdk.RemovalPolicy.DESTROY, // set RETAIN for prod
      autoDeleteObjects: true,                   // only works with DESTROY
    });

    // ── CloudFront Distribution ───────────────────────────────────────────────
    // OAC (Origin Access Control) — S3 bucket is private; CF is the only reader
    const oac = new cloudfront.S3OriginAccessControl(this, 'VibeOAC', {
      description: 'Vibe media CDN origin access control',
    });

    this.cdn = new cloudfront.Distribution(this, 'VibeCdn', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(this.mediaBucket, {
          originAccessControl: oac,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
      },
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // US + Europe only (cheapest)
      comment: 'Vibe app media CDN',
    });

    // Grant CF OAC read access to the bucket
    this.mediaBucket.addToResourcePolicy(
      new cdk.aws_iam.PolicyStatement({
        sid: 'AllowCloudFrontOAC',
        effect: cdk.aws_iam.Effect.ALLOW,
        principals: [new cdk.aws_iam.ServicePrincipal('cloudfront.amazonaws.com')],
        actions: ['s3:GetObject'],
        resources: [this.mediaBucket.arnForObjects('*')],
        conditions: {
          StringEquals: {
            'AWS:SourceArn': `arn:aws:cloudfront::${this.account}:distribution/${this.cdn.distributionId}`,
          },
        },
      }),
    );

    // ── Outputs ───────────────────────────────────────────────────────────────
    new cdk.CfnOutput(this, 'MediaBucketName', { value: this.mediaBucket.bucketName });
    new cdk.CfnOutput(this, 'CdnDomain', { value: this.cdn.distributionDomainName });
  }
}
