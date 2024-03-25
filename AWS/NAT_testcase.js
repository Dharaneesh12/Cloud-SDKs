// const AWS = require('aws-sdk');

// Configure AWS credentials
AWS.config.update({
  region: 'ap-southeast-1', // Set your desired region
});

// Create an EC2 instance
const ec2 = new AWS.EC2();

// Define test result details
let result = [
  { weightage: 0, description: "VPC 'Name' tag must be 'TestingVPC'", status: false },
  { weightage: 0, description: "Subnet 'Name' must be 'Testing-subnet'", status: false },
  { weightage: 0, description: "Route table 'Name' must be 'Testing-rt'", status: false },
  { weightage: 0, description: "'Testing-rt' route table must use the 'TestingVPC' VPC", status: false },
  { weightage: 0, description: "NAT Gateway 'Name' must be 'Testing-gateway' and 'Testing-subnet' is selected as NAT subnet", status: false }
];

async function validateConditions() {
  try {
    // Describe VPCs, Subnets, Route Tables, and NAT Gateways
    const [vpcs, subnets, routeTables, natGateways] = await Promise.all([
      ec2.describeVpcs().promise(),
      ec2.describeSubnets().promise(),
      ec2.describeRouteTables().promise(),
      ec2.describeNatGateways().promise()
    ]);

    for (const vpc of vpcs.Vpcs) {
      if (!vpc.Tags) continue;

      const vpcNameTag = vpc.Tags.find(tag => tag.Key === 'Name');
      if (!vpcNameTag) continue;

      if (vpcNameTag.Value === 'TestingVPC') {
        result[0].weightage = 0.2;
        result[0].status = true;

        const subnet = subnets.Subnets.find(s => s.VpcId === vpc.VpcId && s.Tags && s.Tags.find(tag => tag.Key === 'Name' && tag.Value === 'Testing-subnet'));
        if (subnet) {
          result[1].weightage = 0.2;
          result[1].status = true;

          const routeTable = routeTables.RouteTables.find(rt => rt.VpcId === vpc.VpcId && rt.Tags && rt.Tags.find(tag => tag.Key === 'Name' && tag.Value === 'Testing-rt'));
          if (routeTable) {
            result[2].weightage = 0.2;
            result[2].status = true;

            const associatedRoutes = routeTable.Routes.filter(route => route.VpcPeeringConnectionId === undefined && route.NatGatewayId === undefined);
            if (associatedRoutes.length > 0) {
              result[3].weightage = 0.2;
              result[3].status = true;
            }

            const natGateway = natGateways.NatGateways.find(ng => ng.Tags && ng.Tags.find(tag => tag.Key === 'Name' && tag.Value === 'Testing-gateway'));
            if (natGateway && natGateway.SubnetId === subnet.SubnetId) {
              result[4].weightage = 0.2;
              result[4].status = true;
            }
          }
        }
      }
    }

    return result;

  } catch (error) {
    console.error('Error:', error);
    return result;
  }
}

// Call the validation function asynchronously
(async () => {
  const validationResults = await validateConditions();
  console.log(validationResults);
})();
