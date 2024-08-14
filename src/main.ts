import { App, Stack, StackProps } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { InfraStage } from './stage/infra-stage';

export class CdkPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const cdkDeployRole = iam.Role.fromRoleName(this, 'CdkDeployRole',
      'cdk-hnb659fds-deploy-role-560388883230-ap-northeast-1',
    );
    const PipelineDeployRole = new iam.Role(this, 'CodeDeployRole', {
      assumedBy: new iam.ServicePrincipal('codepipeline.amazonaws.com'),
    });
    cdkDeployRole.grantAssumeRole(PipelineDeployRole);
    // TODO: 権限修正
    // PipelineDeployRole.addToPrincipalPolicy(
    //   new iam.PolicyStatement({
    //     actions: ['sts:AssumeRole'],
    //     effect: iam.Effect.ALLOW,
    //     principals: [new iam.ArnPrincipal(cdkDeployRole.roleArn)],
    //   }),
    // );

    // connectionは手動で作成する
    const source = CodePipelineSource.connection('pensuke628/cdk_pipeline_test', 'main', {
      connectionArn: 'arn:aws:codeconnections:ap-northeast-1:560388883230:connection/8b85ff8c-2ddc-4ed1-adc6-f4fde0550b5c',
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
    pipeline.addStage(new InfraStage(this, 'Dev'));
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