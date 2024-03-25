// const AWS = require('aws-sdk');

AWS.config.update({ region: 'ap-northeast-3' });

const ec2 = new AWS.EC2();
const lambda = new AWS.Lambda();
const iam = new AWS.IAM();
const events = new AWS.CloudWatchEvents();

async function getAWSAccountId() {
  return new Promise((resolve, reject) => {
    const sts = new AWS.STS();
    sts.getCallerIdentity({}, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.Account);
      }
    });
  });
}

let testCases = [
  { weightage: 0, name: 'EC2 instance named "cloudwatchEC2" exists and is stopped', status: false },
  { weightage: 0, name: 'IAM role named "ec2lambda" is attached to the "cloudwatchtrigger" Lambda function',status: false },
  { weightage: 0, name: 'Lambda function name should be "cloudwatchtrigger" and runtime should be "Python 3.7"',status: false },
  { weightage: 0, name: 'CloudWatch event rule name should be "ec2state" and "Cron based schedule pattern" should be selected',status: false },
  { weightage: 0, name: '"cloudwatchtrigger" Lambda function should be selected in the "Targets" of the CloudWatch rule',status: false },
];

async function checkEC2Instance() {
  try {
    const ec2Instances = await ec2.describeInstances().promise();
    const instance = ec2Instances.Reservations[0].Instances[0];
    if (instance.InstanceId && instance.State.Name === 'stopped' && instance.Tags.find(tag => tag.Key === 'Name' && tag.Value === 'cloudwatchEC2')) {
      testCases[0].weightage = 0.2,
      testCases[0].status = true;
    }
  } catch (error) {
    // Handle errors here
  }
}

async function checkLambdaFunction() {
  try {
    const lambdaFunctions = await lambda.listFunctions().promise();
    const lambdaFunction = await lambda.getFunctionConfiguration({ FunctionName: 'cloudwatchtrigger' }).promise();
    if (lambdaFunctions.Functions.find(func => func.FunctionName === 'cloudwatchtrigger')) {
      if (lambdaFunction.Runtime === 'python3.7') {
        testCases[2].weightage = 0.2;
        testCases[2].status = true;
      }
    }
  } catch (error) {
    // Handle errors here
  }
}

async function checkIAMRole() {
  try {
    const iamRoles = await iam.listRoles().promise();
    if (iamRoles.Roles.find(role => role.RoleName === 'ec2lambda')) {
      const attachedPolicies = await iam.listAttachedRolePolicies({ RoleName: 'ec2lambda' }).promise();
      if (attachedPolicies.AttachedPolicies.length > 0) {
        testCases[1].weightage = 0.2;
        testCases[1].status = true;
      }
    }
  } catch (error) {
    // Handle errors here
  }
}

async function checkCloudWatchSchedule() {
  try {
    const rules = await events.listRules().promise();
    const ec2StateRule = rules.Rules.find(rule => rule.Name === 'ec2state');
    if (ec2StateRule) {
      if (ec2StateRule.ScheduleExpression && ec2StateRule.ScheduleExpression.startsWith('cron')) {
        testCases[3].weightage = 0.2;
        testCases[3].status = true;
    
      }
    }
  } catch (error) {
    // Handle errors here
  }
}

async function checkLambdaTarget() {
  try {
    const accountId = await getAWSAccountId();
    const rules = await events.listTargetsByRule({ Rule: 'ec2state' }).promise();
    if (rules.Targets.some(target => target.Arn === `arn:aws:lambda:ap-northeast-3:${accountId}:function:cloudwatchtrigger`)) {
      testCases[4].weightage = 0.2;
      testCases[4].status = true;
    }
  } catch (error) {
    // Handle errors here
  }
}

async function runTestCases() {
  await checkEC2Instance();
  await checkLambdaFunction();
  await checkIAMRole();
  await checkCloudWatchSchedule();
  await checkLambdaTarget();

  console.log('Result:', testCases);
}

runTestCases();
