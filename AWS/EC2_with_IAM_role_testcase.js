// const AWS = require('aws-sdk');

// Set your AWS region
AWS.config.update({ region: 'ap-southeast-2' }); // Replace with your desired region

// Initialize the IAM and EC2 clients
const iam = new AWS.IAM();
const ec2 = new AWS.EC2();

// IAM role and EC2 instance names
const iamRoleNameTag = 'EC2ToLambdaRole';
const ec2InstanceNameTag = 'LambdaRoleinstance';

// Test result details
let result = [
  { weightage: 0, name: `IAM role name tag '${iamRoleNameTag}' exists`, status: false },
  { weightage: 0, name: 'Trust entity includes \'ec2.amazonaws.com\'', status: false },
  { weightage: 0, name: 'AWSLambda_FullAccess is attached', status: false },
  { weightage: 0, name: `EC2 instance with name tag '${ec2InstanceNameTag}' exists`, status: false },
  { weightage: 0, name: 'IAM role selected in EC2 IAM role', status: false },
];

async function validateIAMRoleAndEC2() {
  try {
    // Check if IAM role with the specified name tag exists and fetch its details
    const iamRoleResponse = await iam.getRole({ RoleName: iamRoleNameTag }).promise();
    if (iamRoleResponse.Role) {
      result[0].weightage = 0.2;
      result[0].status = true;

      // Check if trust entity includes 'ec2.amazonaws.com'
      const assumeRolePolicyDocument = JSON.parse(decodeURIComponent(iamRoleResponse.Role.AssumeRolePolicyDocument));
      if (assumeRolePolicyDocument.Statement.some(statement => statement.Principal.Service === 'ec2.amazonaws.com')) {
        result[1].weightage = 0.2;
        result[1].status = true;
      }

      // Check if "AWSLambda_FullAccess" is attached to the IAM role
      const attachedPoliciesResponse = await iam.listAttachedRolePolicies({ RoleName: iamRoleNameTag }).promise();
      const attachedPolicies = attachedPoliciesResponse.AttachedPolicies || [];
      if (attachedPolicies.some(policy => policy.PolicyName === 'AWSLambda_FullAccess')) {
        result[2].weightage = 0.2;
        result[2].status = true;
      }
    }

    // Check if an EC2 instance with the specified name tag exists
    const ec2InstancesResponse = await ec2.describeInstances().promise();
    const ec2InstanceExists = ec2InstancesResponse.Reservations.some(reservation =>
      reservation.Instances.some(instance =>
        instance.Tags.some(tag => tag.Key === 'Name' && tag.Value === ec2InstanceNameTag)
      )
    );

    if (ec2InstanceExists) {
      result[3].weightage = 0.2;
      result[3].status = true;

      // Check if the EC2 instance has the IAM role selected
      const ec2Instance = ec2InstancesResponse.Reservations.find(reservation =>
        reservation.Instances.some(instance =>
          instance.Tags.some(tag => tag.Key === 'Name' && tag.Value === ec2InstanceNameTag)
        )
      );

      if (ec2Instance) {
        const iamInstanceProfile = ec2Instance.Instances[0].IamInstanceProfile;

        if (iamInstanceProfile && iamInstanceProfile.Arn) {
          const arnComponents = iamInstanceProfile.Arn.split('/');
          const ec2RoleName = arnComponents[arnComponents.length - 1];

          if (ec2RoleName === iamRoleNameTag) {
            result[4].weightage = 0.2;
            result[4].status = true;
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
  const validationResults = await validateIAMRoleAndEC2();
  console.log(validationResults);
})();
