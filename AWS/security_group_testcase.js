// Import the required modules from AWS SDK v3
const { EC2, DescribeSecurityGroupsCommand } = require('@aws-sdk/client-ec2');

// Set the region
const REGION_NAME = 'eu-west-1';

const result = [
    { weightage: 0, name: "'Testing-sg' Security Group is available", status: false, error: '' },
    { weightage: 0, name: "Allow SMTP in Inbound Rules", status: false, error: '' },
    { weightage: 0, name: "Allow MSSQL in Inbound Rules", status: false, error: '' },
    { weightage: 0, name: "Allow NFS in Outbound Rules", status: false, error: '' },
    { weightage: 0, name: "Allow WinRM-Redshift in Outbound Rules", status: false, error: '' },
];

// Create EC2 service object
const ec2 = new EC2({ region: REGION_NAME });

async function checkSecurityGroups() {
    try {
        // Describe Security Groups
        const data = await ec2.send(new DescribeSecurityGroupsCommand({
            DryRun: false,
            Filters: [{
                Name: "tag:Name",
                Values: ["Testing-sg"],
            }],
        }));

        if (data.SecurityGroups && data.SecurityGroups.length > 0) {
            const instanceRules = data.SecurityGroups[0];

            result[0].weightage = 0.2;
            result[0].status = true;

            // Check Inbound Rules
            if (instanceRules.IpPermissions.find((r) => r.FromPort === 3306)) {
                result[1].weightage = 0.2;
                result[1].status = true;
            }else{
                result[1].error = `Inbound Rules for SMTP is not available`;
            }

            // Check MSSQL Rules
            if (instanceRules.IpPermissions.find((r) => r.FromPort === 3389)) {
                result[2].weightage = 0.2;
                result[2].status = true;
            }else{
                result[2].error = `Inbound Rules for MSSQL is not available`;
            }

            // Check Outbound Rules for NFS
            if (instanceRules.IpPermissionsEgress.find((r) => r.FromPort === 1521)) {
                result[3].weightage = 0.2;
                result[3].status = true;
            }else{
                result[3].error = `Outbound Rules for NFS is not available`;
            }

            // Check Outbound Rules for WinRM-Redshift
            if (instanceRules.IpPermissionsEgress.find((r) => r.FromPort === 5985)) {
                result[4].weightage = 0.2;
                result[4].status = true;
            }else{
                result[4].error = `Outbound Rules for WinRM-Redshift is not available`;
            }   
            
        }else{
            result[0].error = `Security Group 'Testing-sg' is not available`;
            result[1].error = `Security Group 'Testing-sg' is not available to validate Inbound Rules for SMTP`;
            result[2].error = `Security Group 'Testing-sg' is not available to validate Inbound Rules for MSSQL`;
            result[3].error = `Security Group 'Testing-sg' is not available to validate Outbound Rules for NFS`;
            result[4].error = `Security Group 'Testing-sg' is not available to validate Outbound Rules for WinRM-Redshift`;
        }

        console.log(result);
    } catch (error) {
        // Handle errors
        result[0].error = `Security Group name validation: ${error.message}`;
        result[1].error = `Inbound Rules for SMTP validation: ${error.message}`;
        result[2].error = `Inbound Rules for MSSQL validation: ${error.message}`;
        result[3].error = `Outbound Rules for NFS validation: ${error.message}`;
        result[4].error = `Outbound Rules for WinRM-Redshift validation: ${error.message}`;
        console.error(error);
    }

    finally
    {
        return result;
    }
}

(async () => {
    await checkSecurityGroups();
})();
