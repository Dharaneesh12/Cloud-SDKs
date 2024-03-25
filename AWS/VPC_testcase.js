const { EC2 } = require('@aws-sdk/client-ec2');

const ec2 = new EC2({ region: 'ap-northeast-3' });

const result = [
  { weightage: 0, name: "'ltim-vpc' is available", status: false, error: '' },
  { weightage: 0, name: "'ap-northeast-3a' has a subnet with the CIDR '155.135.1.0/24'", status: false, error: '' },
  { weightage: 0, name: "'ap-northeast-3b' has a subnet with the CIDR '155.135.2.0/24'", status: false, error: '' },
  { weightage: 0, name: "Internet gateway is attached to 'ltim-vpc'", status: false, error: '' },
  { weightage: 0, name: "Internet gateway is added in the route table", status: false, error: '' },
];

async function checkVPC() {
  try {
    // Describe VPC
    const vpcs = await ec2.describeVpcs({
      Filters: [
        { Name: 'tag:Name', Values: ['ltim-vpc'] },
        { Name: 'cidr', Values: ['155.135.0.0/16'] },
      ],
    });

    if (vpcs.Vpcs && vpcs.Vpcs.length > 0) {
      const vpc = vpcs.Vpcs[0];

      if (vpc.Tags && vpc.Tags[0].Value == 'ltim-vpc' && vpc.CidrBlock == '155.135.0.0/16') {
        result[0].weightage = 0.2;
        result[0].status = true;

        // Describe Subnets
        const subnets = await ec2.describeSubnets({
          Filters: [{ Name: 'vpc-id', Values: [vpc.VpcId] }],
        });

        if (subnets.Subnets && subnets.Subnets.length > 0) {
          const subnet1 = subnets.Subnets.find((a) => a.CidrBlock === '155.135.1.0/24' && a.AvailabilityZone === 'ap-northeast-3a');
          const subnet2 = subnets.Subnets.find((b) => b.CidrBlock === '155.135.2.0/24' && b.AvailabilityZone === 'ap-northeast-3b');

          if (subnet1) {
            result[1].weightage = 0.2;
            result[1].status = true;
          }else{
            result[1].error = `Subnet 'ap-northeast-3a' with CIDR '155.135.1.0/24' is not available`;
            }

          if (subnet2) {
            result[2].weightage = 0.2;
            result[2].status = true;
          }else{
            result[2].error = `Subnet 'ap-northeast-3b' with CIDR '155.135.2.0/24' is not available`;
            }

          // Describe Internet Gateways
          const igws = await ec2.describeInternetGateways({
            Filters: [{ Name: 'attachment.vpc-id', Values: [vpc.VpcId] }],
          });

          if (igws.InternetGateways && igws.InternetGateways.length > 0) {
            const igw = igws.InternetGateways[0];

            if (igw.Attachments && igw.Attachments[0].VpcId == vpc.VpcId) {
              result[3].weightage = 0.2;
              result[3].status = true;

              // Describe Route Tables
              const routeTables = await ec2.describeRouteTables({
                Filters: [{ Name: 'vpc-id', Values: [vpc.VpcId] }],
              });

              if (routeTables.RouteTables && routeTables.RouteTables.length > 0) {
                const routeTable = routeTables.RouteTables.find((rt) =>
                  rt.Routes.some(
                    (route) => route.GatewayId === igw.InternetGatewayId && route.DestinationCidrBlock === '0.0.0.0/0'
                  )
                );

                if (routeTable) {
                  result[4].weightage = 0.2;
                  result[4].status = true;
                }else{
                    result[4].error = `Internet gateway is not added in the route table`;
                    }
              }
            }else{
                result[3].error = `Internet gateway is not attached to 'ltim-vpc'`;
                result[4].error = `Internet gateway is not added in the route table`;
                }
          }
        }else{
            result[1].error = `Subnet 'ap-northeast-3a' with CIDR '155.135.1.0/24' is not available`;
            result[2].error = `Subnet 'ap-northeast-3b' with CIDR '155.135.2.0/24' is not available`;
            result[3].error = `Internet gateway is not attached to 'ltim-vpc'`;
            result[4].error = `Internet gateway is not added in the route table`;
            }
      }else{
        result[0].error = `VPC name 'ltim-vpc' is not available`;
        result[1].error = `VPC name 'ltim-vpc' is not available to validate Subnet 'ap-northeast-3a' with CIDR '155.135.1.0/24'`;
        result[2].error = `VPC name 'ltim-vpc' is not available to validate Subnet 'ap-northeast-3b' with CIDR '155.135.2.0/24'`;
        result[3].error = `VPC name 'ltim-vpc' is not available to validate Internet gateway is not attached to 'ltim-vpc'`;
        result[4].error = `VPC name 'ltim-vpc' is not available to validate Internet gateway is not added in the route table`;
      }
    }else{
        result[0].error = `VPC name 'ltim-vpc' is not available`;
        result[1].error = `VPC name 'ltim-vpc' is not available to validate Subnet 'ap-northeast-3a' with CIDR '155.135.1.0/24'`;
        result[2].error = `VPC name 'ltim-vpc' is not available to validate Subnet 'ap-northeast-3b' with CIDR '155.135.2.0/24'`;
        result[3].error = `VPC name 'ltim-vpc' is not available to validate Internet gateway is not attached to 'ltim-vpc'`;
        result[4].error = `VPC name 'ltim-vpc' is not available to validate Internet gateway is not added in the route table`;
      }

    console.log(result);
  } catch (error) {
    // Handle errors
    result[0].error = `Error fetching VPC: ${error.message}`;
    result[1].error = `Error fetching subnet: ${error.message}`;
    result[2].error = `Error fetching subnet: ${error.message}`;
    result[3].error = `Error fetching Internet Gateway: ${error.message}`;
    result[4].error = `Error fetching Route Table: ${error.message}`;
    // console.error(error);
  }
  finally{
    return result;
  }
}

(async () => {
  await checkVPC();
})();
