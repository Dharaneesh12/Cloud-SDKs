// const AWS = require('aws-sdk');
const ecs = new AWS.ECS({ region: 'eu-west-1' }); // Replace with your region
const elbv2 = new AWS.ELBv2({ region: 'eu-west-1' }); // Replace with your region


async function checkTestCases() {
  const result = [
    { weightage: 0, name: 'Cluster named "Loadbalancercluster" exists', status: false },
    { weightage: 0, name: 'CapacityProvider name should be "loadbalancercp"', status: false },
    { weightage: 0, name: 'Task definition named "lbtaskdef" exists', status: false },
    { weightage: 0, name: 'Container named "loadbalancercontainer" and image URL includes "loadbalancerrepo:latest"', status: false },
    { weightage: 0, name: 'Service named "applicationlb" exists', status: false },
    { weightage: 0, name: 'Load balancer named "ecsappicationlb" exists', status: false },
    { weightage: 0, name: 'Target Load balancer named "targetapl" exists in the "applicationlb" service', status: false },
  ];

  try {
    // Check if the ECS cluster named "Loadbalancercluster" exists
    const ecsClusterName = 'loadbalancercluster';
    const listClustersParams = {};
    const clusters = await ecs.listClusters(listClustersParams).promise();
    if (clusters.clusterArns.some(clusterArn => clusterArn.includes(ecsClusterName))) {
      result[0].status = true;
      result[0].weightage = 0.2;
    }

    // Check if the capacity provider named "loadbalancercp" exists
    const describeCapacityProvidersParams = { capacityProviders: ['loadbalancercp'] };
    const capacityProviders = await ecs.describeCapacityProviders(describeCapacityProvidersParams).promise();
    if (capacityProviders.capacityProviders.length > 0) {
      result[1].status = true;
      result[1].weightage = 0.1;
    }

    // Check if the ECS task definition named "lbtaskdef" exists
    const ecsTaskDefinitionName = 'lbtaskdef';
    const listTaskDefinitionsParams = {};
    const taskDefinitions = await ecs.listTaskDefinitions(listTaskDefinitionsParams).promise();
    if (taskDefinitions.taskDefinitionArns.some(arn => arn.includes(ecsTaskDefinitionName))) {
      result[2].status = true;
      result[2].weightage = 0.1;
    }

    // Check if the container named "loadbalancercontainer" and image URL includes "loadbalancerrepo:latest"
    const describeTaskDefinitionParams = { taskDefinition: ecsTaskDefinitionName };
    const taskDefinition = await ecs.describeTaskDefinition(describeTaskDefinitionParams).promise();
    if (taskDefinition.taskDefinition.containerDefinitions.some(container => container.name === 'loadbalancercontainer' && container.image.includes('loadbalancerrepo:latest'))) {
      result[3].status = true;
      result[3].weightage = 0.1;
    }

    // Check if the service named "apl" exists
    const serviceName = 'applicationlb';
    const listServicesParams = { cluster: ecsClusterName };
    const services = await ecs.listServices(listServicesParams).promise();
    if (services.serviceArns.some(serviceArn => serviceArn.endsWith(serviceName))) {
      result[4].status = true;
      result[4].weightage = 0.2;
    }

    // Check if the Load balancer named "ecsappicationlb" exists
    const loadBalancerName = 'ecsappicationlb';
    const describeLoadBalancersParams = { Names: [loadBalancerName] };
    const loadBalancers = await elbv2.describeLoadBalancers(describeLoadBalancersParams).promise();
    if (loadBalancers.LoadBalancers.length > 0) {
      result[5].status = true;
      result[5].weightage = 0.2;
    }

    // Check if the Load balancer named "ecsappicationlb" is selected in the service
    const describeServicesParams = { services: [serviceName], cluster: ecsClusterName };
    const service = await ecs.describeServices(describeServicesParams).promise();
    const serviceLoadBalancers = service.services[0].loadBalancers;
    // console.log(serviceLoadBalancers);
    if (serviceLoadBalancers.some(loadBalancer => loadBalancer.targetGroupArn.includes('targetapl'))) {
      result[6].status = true;
      result[6].weightage = 0.1;
    }

  } catch (error) {
    // Handle errors
    // console.error('Error:', error);
  } finally {
    // Log the results
    console.log('Result:', result);
  }
}

checkTestCases();
