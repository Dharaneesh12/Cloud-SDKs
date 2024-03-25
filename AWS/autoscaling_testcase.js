// const AWS = require('aws-sdk');

// Replace 'ap-south-1' with the appropriate AWS region
const ec2 = new AWS.EC2({ region: 'ap-south-1' });
const ecs = new AWS.ECS({ region: 'ap-south-1' });

const ecsClusterName = 'prodcluster';
const ecsServiceName = 'autoscalingservice';

async function main() {
  const result = [
    { weightage: 0, name: 'Cluster named "prodcluster" exists', status: false },
    { weightage: 0, name: 'Capacity provider named "prodcp" exists', status: false }, // New test case
    { weightage: 0, name: 'Task definition named "prodtaskdef" exists', status: false }, // New test case
    { weightage: 0, name: 'Container named "prodtest" with image URL "prodecs:latest" exists', status: false }, // New test case
    { weightage: 0, name: 'Service named "autoscalingservice" exists', status: false }, // New test case
    { weightage: 0, name: 'Desired task should be selected as 3 in the "autoscalingservice" service', status: false }, // New test case
  ];

  let clusterExists = false;
  try {
    // Check if the ECS cluster named "prodcluster" exists
    const ecsClusterName = 'prodcluster';
    const listClustersParams = {};
    const clusters = await ecs.listClusters(listClustersParams).promise();
    if (clusters.clusterArns.some(clusterArn => clusterArn.includes(ecsClusterName))) {
      result[0].status = true;
      result[0].weightage = 0.125;
      clusterExists = true;
    }
  } catch (error) {
    // Handle errors or set status to false
  }

  try {
    // Check if the capacity provider named "prodcp" exists
    const capacityProviderName = 'prodcp';
    if (clusterExists) {
      const describeCapacityProvidersParams = { capacityProviders: [capacityProviderName] };
      const capacityProviders = await ecs.describeCapacityProviders(describeCapacityProvidersParams).promise();
      if (capacityProviders.capacityProviders.length > 0) {
        result[1].status = true;
        result[1].weightage = 0.125;
      }
    }
  } catch (error) {
    // Handle errors or set status to false
  }

  try {
    // Check if the ECS task definition named "prodtaskdef" exists
    const ecsTaskDefinitionName = 'prodtaskdef';
    const listTaskDefinitionsParams = {};
    const taskDefinitions = await ecs.listTaskDefinitions(listTaskDefinitionsParams).promise();
    if (taskDefinitions.taskDefinitionArns.some(arn => arn.includes(ecsTaskDefinitionName))) {
      result[2].status = true;
      result[2].weightage = 0.125;
    }
  } catch (error) {
    // Handle errors or set status to false
  }

  try {
    // Check if the container named "prodtest" and image URL includes "prodecs:latest"
    const ecsTaskDefinitionName = 'prodtaskdef';
    const describeTaskDefinitionParams = { taskDefinition: ecsTaskDefinitionName };
    const taskDefinition = await ecs.describeTaskDefinition(describeTaskDefinitionParams).promise();
    if (taskDefinition.taskDefinition.containerDefinitions.some(container => container.name === 'prodtest' && container.image.includes('prodecs:latest'))) {
      result[3].status = true;
      result[3].weightage = 0.125;
    }
  } catch (error) {
    // Handle errors or set status to false
  }

  try {
    // Check if the ECS service named "vpcservice" exists
    const listServicesParams = { cluster: ecsClusterName };
    const services = await ecs.listServices(listServicesParams).promise();
    if (services.serviceArns.some(serviceArn => serviceArn.endsWith(ecsServiceName))) {
      result[4].status = true;
      result[4].weightage = 0.125;
    }
  } catch (error) {
    // Handle errors or set status to false
  } 
  
  try {
    // Check if the ECS service named "autoscalingservice" exists
    const serviceDesiredTasks = 3; // Set the desired task count you want to check
    const listServicesParams = { cluster: ecsClusterName };
    const services = await ecs.listServices(listServicesParams).promise();
    if (services.serviceArns.some(serviceArn => serviceArn.endsWith('autoscalingservice'))) {
        const describeServicesParams = {
            cluster: ecsClusterName,
            services: ['autoscalingservice'], // Replace with your service name
        };
        const serviceDescription = await ecs.describeServices(describeServicesParams).promise();
        if (serviceDescription.services.length > 0 && serviceDescription.services[0].desiredCount === serviceDesiredTasks) {
            result[5].status = true;
            result[5].weightage = 0.125;
        }
    }
  } catch (error) {
    // Handle errors or set status to false
  } finally {
    // Print the results
    console.log('Result:', result);
  }
}

main();
