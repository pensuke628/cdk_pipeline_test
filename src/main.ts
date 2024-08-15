import { App, Stack, StackProps } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { InfraStage } from './stage/infra-stage';

interface CdkPipelineStackProps extends StackProps {
  env: {
    account: string;
    region: string;
  };
  branch: string;
  connectionArn: string;
}

export class CdkPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: CdkPipelineStackProps) {
    super(scope, id, props);

    const cdkDeployRole = iam.Role.fromRoleName(this, 'CdkDeployRole',
      `cdk-hnb659fds-deploy-role-${props.env.account}-${props.env.region}`,
    );
    const PipelineDeployRole = new iam.Role(this, 'CodeDeployRole', {
      assumedBy: new iam.ServicePrincipal('codepipeline.amazonaws.com'),
    });
    cdkDeployRole.grantAssumeRole(PipelineDeployRole);

    // connectionは手動で作成する
    const source = CodePipelineSource.connection('pensuke628/cdk_pipeline_test', props.branch, {
      connectionArn: props.connectionArn,
      // connectionArn: ,
    });

    const pipeline = new CodePipeline(this, 'Pipeline', {
      synth: new ShellStep('Synth', {
        input: source,
        commands: [
          'npm install',
          'npm run build',
          'npx cdk synth',
        ],
      }),
      selfMutation: false,
      role: PipelineDeployRole,
    });
    pipeline.addStage(new InfraStage(this, id));
  }
}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT || '123456789012',
  region: process.env.CDK_DEFAULT_REGION || 'ap-northeast-1',
};

const stgEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT || '123456789012',
  region: 'us-east-1',
};

const app = new App();

new CdkPipelineStack(app, 'cdk-pipeline-test-dev', {
  env: devEnv,
  branch: 'development',
  connectionArn: 'arn:aws:codeconnections:ap-northeast-1:560388883230:connection/8b85ff8c-2ddc-4ed1-adc6-f4fde0550b5c',
});

new CdkPipelineStack(app, 'cdk-pipeline-test-stg', {
  env: stgEnv,
  branch: 'staging',
  connectionArn: 'arn:aws:codeconnections:ap-northeast-1:560388883230:connection/8b85ff8c-2ddc-4ed1-adc6-f4fde0550b5c',
});
// new MyStack(app, 'cdk_pipeline_test-prod', { env: prodEnv });

app.synth();