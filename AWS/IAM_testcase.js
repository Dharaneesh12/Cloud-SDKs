//const AWS = require("aws-sdk");
// const { log } = require("console");

AWS.config.update({ region: "us-east-1" }); // Replace with your region
const result = [];
const iam = new AWS.IAM({ apiVersion: "2010-05-08" });

const groupName = "Test-Admins";

// List the IAM group and its policies
const listGroupParams = { GroupName: "Test-Admins" };
iam.getGroup(listGroupParams, function(err, data) {
    if (err) {
        result.push({ name: "IAM group 'Test-Admins' is available", status: false });
        console.log(result);
    } else {
        result.push({ name: "IAM group 'Test-Admins' is available", weightage: 0.25, status: true, });
        //console.log(result);
        const userName = data.Users
        if (userName.find((r) => r.UserName === 'TestAdmin1')) {
            result.push({ name: "IAM user 'TestAdmin1' is available", weightage: 0.25, status: true, });
            //console.log(result);
        } else {
            result.push({ name: "IAM user 'TestAdmin1 is available", status: false });
            //console.log(result);
        }
        const listPoliciesParams = { GroupName: "Test-Admins" };
        iam.listAttachedGroupPolicies(listPoliciesParams, function(err, data) {
            if (err) {
                result.push({
                    name: "AmazonECS_FullAccess & AmazonGlacierReadOnlyAccess is available",
                    status: false,
                });
                //console.log(result);
            } else {
                // console.log(data);
                const policyName = data.AttachedPolicies;
                // console.log(policyName);
                if (policyName.find((r) => r.PolicyName === "AmazonECS_FullAccess")) {
                    result.push({
                        name: "'AmazonECS_FullAccess' is available",
                        weightage: 0.25,
                        status: true,
                    });
                } else {
                    result.push({
                        name: "'AmazonECS_FullAccess' is available",
                        status: false,
                    });
                    //console.log(result);
                }
                if (policyName.find((r) => r.PolicyName === "AmazonGlacierReadOnlyAccess")) {
                    result.push({
                        name: "'AmazonGlacierReadOnlyAccess' is available",
                        weightage: 0.25,
                        status: true,
                    });
                    console.log(result);
                } else {
                    result.push({
                        name: "'AmazonGlacierReadOnlyAccess' is available",
                        status: false,
                    });
                    //result.push({ name: "'AmazonGlacierReadOnlyAccess' should be attached policy", status: false });
                    console.log(result);
                }
            }
        });

    }
    //console.log(result);
});