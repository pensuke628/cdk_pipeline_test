import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class CdkPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    // define resources here...
  }
}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new CdkPipelineStack(app, 'cdk-pipeline-test-dev', { env: devEnv });
// new MyStack(app, 'cdk_pipeline_test-prod', { env: prodEnv });

app.synth();