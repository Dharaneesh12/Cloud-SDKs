  // const AWS = require('aws-sdk');

// Set your AWS region
AWS.config.update({ region: 'global' });

// Create an IAM instance
const iam = new AWS.IAM();

// Define the IAM role and policy names
const roleName = 'Production';
const s3PolicyName = 'AmazonS3FullAccess';
const cloudtrailPolicyName = 'AWSCloudTrail_ReadOnlyAccess';

// Test result details
let result = [
  { weightage: 0, name: "IAM role is 'Production'", status: false },
  { weightage: 0, name: `Policy '${s3PolicyName}' attached`, status: false },
  { weightage: 0, name: `Policy '${cloudtrailPolicyName}' attached`, status: false },
  { weightage: 0, name: "Trust entity includes 'elasticbeanstalk.amazonaws.com'", status: false }
];

async function validateIAMRole() {
  try {
    // Get the IAM role details
    const roleResponse = await iam.getRole({ RoleName: roleName }).promise();

    if (!roleResponse.Role) {
      console.log(`IAM role '${roleName}' not found.`);
      return;
    }

    // Get the attached policies for the role
    const attachedPolicyResponse = await iam.listAttachedRolePolicies({ RoleName: roleName }).promise();
    const attachedPolicies = attachedPolicyResponse.AttachedPolicies || [];

    // Check if the specified policies are attached
    const isS3PolicyAttached = attachedPolicies.some(policy => policy.PolicyName === s3PolicyName);
    const isVpcPolicyAttached = attachedPolicies.some(policy => policy.PolicyName === cloudtrailPolicyName);

    // Check if the trust entity includes 'elasticbeanstalk.amazonaws.com'
    let isTrustEntityValid = false;
    const assumeRolePolicyDocumentStr = decodeURIComponent(roleResponse.Role.AssumeRolePolicyDocument);
    const assumeRolePolicyDocument = JSON.parse(assumeRolePolicyDocumentStr);

    if (assumeRolePolicyDocument && Array.isArray(assumeRolePolicyDocument.Statement)) {
      for (const statement of assumeRolePolicyDocument.Statement) {
        if (statement.Principal && statement.Principal.Service === 'elasticbeanstalk.amazonaws.com') {
          isTrustEntityValid = true;
          break;
        }
      }
    }

    // Update weightage based on conditions
    if (roleName === 'Production') {
      result[0].weightage = 0.25;
      result[0].status = true;
    }

    if (isS3PolicyAttached) {
      result[1].weightage = 0.25;
      result[1].status = true;
    }

    if (isVpcPolicyAttached) {
      result[2].weightage = 0.25;
      result[2].status = true;
    }

    if (isTrustEntityValid) {
      result[3].weightage = 0.25;
      result[3].status = true;
    }

    return result;

  } catch (error) {
    console.error('Error:', error);
    return result;
  }
}

// Call the validation function asynchronously
(async () => {
  const validationResults = await validateIAMRole();
  console.log(validationResults);
})();