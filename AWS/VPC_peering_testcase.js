const { EC2Client, DescribeVpcsCommand, DescribeVpcPeeringConnectionsCommand } = require('@aws-sdk/client-ec2');

const REGION_NAME = 'ap-northeast-3';

const result = [
  { weightage: 0, name: "VPC name is 'Event'", status: false, error: '' },
  { weightage: 0, name: "VPC 'Event' IPv4 CIDR is '178.130.0.0/16'", status: false, error: '' },
  { weightage: 0, name: "VPC name is 'Demo'", status: false, error: '' },
  { weightage: 0, name: "VPC 'Demo' IPv4 CIDR is '178.135.0.0/16'", status: false, error: '' },
  { weightage: 0, name: "VPC Peering Name is 'Event-Demo'", status: false, error: '' },
  { weightage: 0, name: "Route entries between Event and Demo are correct", status: false, error: '' },
  { weightage: 0, name: "Route entries between Demo and Event are correct", status: false, error: '' }
];

const ec2 = new EC2Client({ region: REGION_NAME });

async function validateConditions() {
  try {
    // Describe VPCs
    const vpcsData = await ec2.send(new DescribeVpcsCommand({}));

    // Get VPC IDs by name
    const user = vpcsData.Vpcs.find(vpc => vpc.Tags && vpc.Tags.some(tag => tag.Key === 'Name' && tag.Value === 'Event'));
    const testing = vpcsData.Vpcs.find(vpc => vpc.Tags && vpc.Tags.some(tag => tag.Key === 'Name' && tag.Value === 'Demo'));

    // Flag to track if any VPC name is found
    let vpcNameFound = false;

    // Loop through each VPC
    for (const vpc of vpcsData.Vpcs) {
      if (vpc.Tags) {
        const vpcNameTag = vpc.Tags.find(tag => tag.Key === 'Name');
        if (vpcNameTag) {
          vpcNameFound = true;  // Set the flag if at least one VPC name is found
          if (vpcNameTag.Value === 'Event') {
            result[0].weightage = 0.1;
            result[0].status = true;

            // Check IPv4 CIDR
            if (vpc.CidrBlock === '178.130.0.0/16') {
              result[1].weightage = 0.1;
              result[1].status = true;
            } else {
              result[1].error = "VPC 'Event' IPv4 CIDR is not '178.130.0.0/16'";
            }
          } else if (vpcNameTag.Value === 'Demo') {
            result[2].weightage = 0.1;
            result[2].status = true;

            // Check IPv4 CIDR
            if (vpc.CidrBlock === '178.135.0.0/16') {
              result[3].weightage = 0.1;
              result[3].status = true;
            } else {
              result[3].error = "VPC 'Demo' IPv4 CIDR is not '178.135.0.0/16'";
            }
          }
        }
      }
    }

    // If no VPC name is found, set the error in the result array
    if (!vpcNameFound) {
      result[0].error = "VPC name 'Event' not available";
      result[1].error = "VPC 'Event' IPv4 CIDR is not '178.130.0.0/16'";
      result[2].error = "VPC name 'Demo' not available";
      result[3].error = "VPC 'Demo' IPv4 CIDR is not '178.135.0.0/16'";
    }

    // Describe VPC peering connections
    const peeringConnectionsData = await ec2.send(new DescribeVpcPeeringConnectionsCommand({}));

    // Loop through each VPC peering connection
    if (peeringConnectionsData.VpcPeeringConnections.length > 0) {
      for (const peeringConnection of peeringConnectionsData.VpcPeeringConnections) {
        const accepterVpcInfo = peeringConnection.AccepterVpcInfo && peeringConnection.AccepterVpcInfo.CidrBlock;
        const requesterVpcInfo = peeringConnection.RequesterVpcInfo && peeringConnection.RequesterVpcInfo.CidrBlock;

        // Check if peering connection name is 'User-Testing' and it's active
        if (peeringConnection.Tags && peeringConnection.Tags.some(tag => tag.Key === 'Name' && tag.Value === 'Event-Demo') &&
          peeringConnection.Status && peeringConnection.Status.Code === 'active') {
          result[4].weightage = 0.2;
          result[4].status = true;
        } else {
          result[4].error = "VPC Peering Name is not 'Event-Demo'";
        }

        // Check if the peering connection involves Testing as accepter and User as requester
        if (
          testing && accepterVpcInfo === testing.CidrBlock &&
          user && requesterVpcInfo === user.CidrBlock
        ) {
          const userRouteTable = await getMainRouteTableId(user.VpcId);
          const testingRouteTable = await getMainRouteTableId(testing.VpcId);

          if (await hasCIDRInRouteTable(userRouteTable, testing.CidrBlock)) {
            result[5].weightage = 0.2;
            result[5].status = true;
          } else {
            result[5].error = "Route entries between Event and Demo are not correct";
          }

          if (await hasCIDRInRouteTable(testingRouteTable, user.CidrBlock)) {
            result[6].weightage = 0.2;
            result[6].status = true;
          } else {
            result[6].error = "Route entries between Demo and Event are not correct";
          }
        } else {
          result[5].error = "Route entries between Event and Testing are not correct";
          result[6].error = "Route entries between Testing and Event are not correct";
        }
      }
    } else {
      result[4].error = "VPC Peering Name 'Event-Testing' not available";
      result[5].error = "VPC Peering Name 'Event-Testing' not available to validate Route entries between Event and Testing";
      result[6].error = "VPC Peering Name 'Event-Testing' not available to validate Route entries between Testing and Event";
    }

  } catch (error) {
    // console.error('Error:', error);
  } finally {
    return result;
  }
}

async function getMainRouteTableId(vpcId) {
  const routeTablesData = await ec2.send(new DescribeRouteTablesCommand({ Filters: [{ Name: 'vpc-id', Values: [vpcId] }] }));
  const mainRouteTable = routeTablesData.RouteTables.find(routeTable => routeTable.Associations.some(association => association.Main));
  return mainRouteTable.RouteTableId;
}

async function hasCIDRInRouteTable(routeTableId, cidrBlock) {
  const routeTablesData = await ec2.send(new DescribeRouteTablesCommand({ RouteTableIds: [routeTableId] }));
  const matchingRoute = routeTablesData.RouteTables[0].Routes.find(route => route.DestinationCidrBlock === cidrBlock);
  return !!matchingRoute;
}

// Call the validation function asynchronously
(async () => {
  const validationResults = await validateConditions();
  console.log(validationResults);
  return validationResults;
})();
