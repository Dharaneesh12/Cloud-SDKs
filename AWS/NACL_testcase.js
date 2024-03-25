// Import the required modules from AWS SDK v3
const { EC2Client, DescribeNetworkAclsCommand } = require('@aws-sdk/client-ec2');

// Set the region
const REGION_NAME = 'eu-central-1';

const result = [
    { weightage: 0, name: "'Devnetwork' Network ACl is available", status: false, error: '' },
    { weightage: 0, name: "Allow 'telnet' in Inbound Rules", status: false, error: '' },
    { weightage: 0, name: "Deny 'HTTP' in Inbound Rules", status: false, error: '' },
    { weightage: 0, name: "Allow 'DNS' in Outbound Rules", status: false, error: '' },
    { weightage: 0, name: "Deny 'IMAP' in Outbound Rules", status: false, error: '' },
];

// Create EC2 service object
const ec2 = new EC2Client({ region: REGION_NAME });

async function checkNetworkACL() {
    try {
        const params = {
            DryRun: false,
            Filters: [{
                Name: "tag:Name",
                Values: ["Devnetwork"],
            }],
        };

        // Describe Network ACLs
        const data = await ec2.send(new DescribeNetworkAclsCommand(params));

        if (data.NetworkAcls && data.NetworkAcls[0]) {
            result[0].weightage = 0.2;
            result[0].status = true;

            // Check 'telnet' in Inbound Rules
            if (data.NetworkAcls[0].Entries.find((r) => r.PortRange && r.PortRange.From === 3306 && r.RuleAction === 'allow' && !r.Egress)) {
                result[1].weightage = 0.2;
                result[1].status = true;
            }else{
                result[1].error = `telnet not found in Inbound Rules`;
            }

            // Check 'HTTP' in Inbound Rules
            if (data.NetworkAcls[0].Entries.find((r) => r.PortRange && r.PortRange.From === 3389 && r.RuleAction === 'deny' && !r.Egress)) {
                result[2].weightage = 0.2;
                result[2].status = true;
            }else{
                result[2].error = `HTTP not found in Inbound Rules`;
            }

            // Check 'DNS' in Outbound Rules
            if (data.NetworkAcls[0].Entries.find((r) => r.PortRange && r.PortRange.From === 1521 && r.RuleAction === 'allow' && r.Egress)) {
                result[3].weightage = 0.2;
                result[3].status = true;
            }else{
                result[3].error = `DNS not found in Outbound Rules`;
            }


            // Check 'IMAP' in Outbound Rules
            if (data.NetworkAcls[0].Entries.find((r) => r.PortRange && r.PortRange.From === 5985 && r.RuleAction === 'deny' && r.Egress)) {
                result[4].weightage = 0.2;
                result[4].status = true;
            }else{
                result[4].error = `IMAP not found in Outbound Rules`;
            }

        }else{
            result[0].error = `Network ACL 'Devnetwork' not found`;
            result[1].error = `Network ACL 'Devnetwork' not found to validate Inbound Rules`;
            result[2].error = `Network ACL 'Devnetwork' not found to validate Inbound Rules`;
            result[3].error = `Network ACL 'Devnetwork' not found to validate Outbound Rules`;
            result[4].error = `Network ACL 'Devnetwork' not found to validate Outbound Rules`;
        }

    } catch (error) {
        result[0].error = `Error Network ACL validation: ${error.message}`;
        result[1].error = `Error Network ACL  Inbound validation: ${error.message}`;
        result[2].error = `Error Network ACL  Inbound validation: ${error.message}`;
        result[3].error = `Error Network ACL  Outbound validation: ${error.message}`;
        result[4].error = `Error Network ACL  Outbound validation: ${error.message}`;
        // console.error(error);
    }
    finally
    {
        return result;
    }
}

(async () => {
    const result = await checkNetworkACL();
    console.log(result);
    return result;
})();
