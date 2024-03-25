// const AWS = require('aws-sdk');
const s3 = new AWS.S3({ region: 'us-west-2' });
const ecs = new AWS.ECS({ region: 'us-west-2' });
const cloudwatchlogs = new AWS.CloudWatchLogs({ region: 'us-west-2' });
const lambda = new AWS.Lambda({ region: 'us-west-2' });
const ecr = new AWS.ECRPUBLIC({ region: 'us-west-2' }); // Replace with the appropriate region


async function main() {
  const result = [
    { weightage: 0, name: 'S3 bucket named "ecslogcheck"', status: false },
    { weightage: 0, name: 'Enable "server access logging" and the target bucket path should be "s3://ecslogcheck" for the "ecslogcheck" bucket', status: false },
    { weightage: 0, name: 'Cluster named "s3cluster" exists', status: false },
    { weightage: 0, name: 'Capacity provider named "logcp" exists in the "s3cluster" cluster', status: false },
    { weightage: 0, name: 'ECR repository named "ecslogsrepo" exists', status: false },
    { weightage: 0, name: 'Task definition named "ecslogs" exists', status: false },
    { weightage: 0, name: 'Container named "logtest" and image URL includes "ecslogsrepo:latest"', status: false },
    { weightage: 0, name: 'Log group named "/ecs/ecslogs" exists', status: false },
    { weightage: 0, name: 'Service named "logmonitor" exists', status: false },
    { weightage: 0, name: 'Lambda function named "test" exists', status: false },
  ];

  try {
    // Check if the S3 bucket named "ecslogcheck" exists
    const s3BucketName = 'ecslogcheck';
    const headBucketParams = { Bucket: s3BucketName };
    const s3BucketExists = await s3.headBucket(headBucketParams).promise();
    result[0].status = true;
    result[0].weightage = 0.1;
  } catch (error) {
  }

  try {
    // Check if server access logging is enabled with the target bucket path "s3://ecslogcheck" for the "ecslogcheck" bucket
    const s3BucketName = 'ecslogcheck';
    const loggingParams = { Bucket: s3BucketName };
    const loggingConfig = await s3.getBucketLogging(loggingParams).promise();
    if (loggingConfig.LoggingEnabled && loggingConfig.LoggingEnabled.TargetBucket === s3BucketName && loggingConfig.LoggingEnabled.TargetPrefix === '') {
      result[1].status = true;
      result[1].weightage = 0.1;
    }
  } catch (error) {
  }

  try {
    // Check if the ECS cluster named "s3cluster" exists
    const ecsClusterName = 's3cluster';
    const listClustersParams = {};
    const clusters = await ecs.listClusters(listClustersParams).promise();
    if (clusters.clusterArns.some(clusterArn => clusterArn.includes(ecsClusterName))) {
      result[2].status = true;
      result[2].weightage = 0.1;
    }
  } catch (error) {
  }

  try {
    // Check if the capacity provider named "logcp" exists in the "s3cluster" cluster
    const describeCapacityProvidersParams = { capacityProviders: ['logcp'] };
    const capacityProviders = await ecs.describeCapacityProviders(describeCapacityProvidersParams).promise();
    if (capacityProviders.capacityProviders.length > 0) {
      result[3].status = true;
      result[3].weightage = 0.1;
    }
  } catch (error) {
  }

  try {
    // Check if the ECR repository named "ecslogsrepo" exists
    const ecrRepoName = 'ecslogsrepo';
    const describeRepositoriesParams = {
      repositoryNames: [ecrRepoName],
    };
    const repositories = await ecr.describeRepositories(describeRepositoriesParams).promise();
    if (repositories.repositories.length > 0){
      result[4].status = true;
      result[4].weightage = 0.1;
    }
  } catch (error) {
  }
  
  try {
    // Check if the ECS task definition named "ecslogs" exists
    const ecsTaskDefinitionName = 'ecslogs';
    const listTaskDefinitionsParams = {};
    const taskDefinitions = await ecs.listTaskDefinitions(listTaskDefinitionsParams).promise();
    if (taskDefinitions.taskDefinitionArns.some(arn => arn.includes(ecsTaskDefinitionName))) {
      result[5].status = true;
      result[5].weightage = 0.1;
    }
  } catch (error) {
  }

  try {
    // Check if the container named "logtest" and image URL includes "ecslogsrepo:latest"
    const ecsTaskDefinitionName = 'ecslogs';
    const describeTaskDefinitionParams = { taskDefinition: ecsTaskDefinitionName };
    const taskDefinition = await ecs.describeTaskDefinition(describeTaskDefinitionParams).promise();
    if (taskDefinition.taskDefinition.containerDefinitions.some(container => container.name === 'logtest' && container.image.includes('ecslogsrepo:latest'))) {
      result[6].status = true;
      result[6].weightage = 0.1;
    }
  } catch (error) {
  }

  try {
    // Check if the CloudWatch log group named "/ecs/ecslogs" exists
    const logGroupName = '/ecs/ecslogs';
    const describeLogGroupsParams = { logGroupNamePrefix: logGroupName };
    const logGroups = await cloudwatchlogs.describeLogGroups(describeLogGroupsParams).promise();
    if (logGroups.logGroups.some(group => group.logGroupName === logGroupName)) {
      result[7].status = true;
      result[7].weightage = 0.1;
    }
  } catch (error) {
  }

  try {
    // Check if the ECS service named "logmonitor" exists
    const ecsClusterName = 's3cluster';
    const ecsServiceName = 'logmonit';
    const listServicesParams = { cluster: ecsClusterName };
    const services = await ecs.listServices(listServicesParams).promise();
    if (services.serviceArns.some(serviceArn => serviceArn.endsWith(ecsServiceName))) {
      result[8].status = true;
      result[8].weightage = 0.1;
    }
  } catch (error) {
  }

  try {
    // Check if the Lambda function named "test" exists
    const lambdaFunctionName = 'ecsloglambda';
    const listFunctionsParams = {};
    const lambdaFunctions = await lambda.listFunctions(listFunctionsParams).promise();
    if (lambdaFunctions.Functions.some(func => func.FunctionName === lambdaFunctionName)) {
      result[9].status = true;
      result[9].weightage = 0.1;
    }
  } catch (error) {
  }

  // Set weightage to 0 if status is false
  for (let testCase of result) {
    if (!testCase.status) {
      testCase.weightage = 0;
    }
  }
  console.log('Result:', result);
}

main();