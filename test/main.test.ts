import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { CdkPipelineStack } from '../src/main';

test('Snapshot', () => {
  const devEnv = {
    account: process.env.CDK_DEFAULT_ACCOUNT || '123456789012',
    region: process.env.CDK_DEFAULT_REGION || 'ap-northeast-1',
  };

  const app = new App();
  const stack = new CdkPipelineStack(app, 'test', {
    env: devEnv,
    branch: 'main',
    connectionArn: 'arn:aws:codeconnections:ap-northeast-1:560388883230:connection/8b85ff8c-2ddc-4ed1-adc6-f4fde0550b5c',
  });
  const template = Template.fromStack(stack);
  expect(template.toJSON()).toMatchSnapshot();
});