const { ClientSecretCredential } = require("@azure/identity");
const { DnsManagementClient } = require("@azure/arm-dns");

require('dotenv').config();

// Azure AD authentication details
const tenantId = process.env.tenantId;
const clientId = process.env.clientId;
const clientSecret = process.env.clientSecret;
const subscriptionId = process.env.subscriptionId;

// Define input variables
const dnsZoneName = "zone365.com";
const aRecordName = "iamneoweb";
const arecipaddress = "10.10.70.23";
const cnameRecordName = "myweb";
const txtRecordName = "mytxt";
const txtmessage = "mydomain is zone365.com";

const validateAzureDNSLab = async () => {
    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    const dnsClient = new DnsManagementClient(credential, subscriptionId);

    const validationResult = [
        { weightage: 0, name: `Azure DNS Zone '${dnsZoneName}' exists`, status: false },
        { weightage: 0, name: `A Record '${aRecordName} exists`, status: false },
        { weightage: 0, name: `CNAME Record '${cnameRecordName} exists`, status: false },
        { weightage: 0, name: `TXT Record '${txtRecordName}' exists`, status: false },
        // { weightage: 0, name: `Subdomain '${subdomain}.${customDomain}' resolves to '${webAppName}.azurewebsites.net'`, status: false },
    ];

    try {
        // Check if Azure DNS Zone exists
        const zone = await dnsClient.zones.get(resourceGroupName, dnsZoneName);
        //console.log(zone);
        if (zone.name === dnsZoneName) {
            validationResult[0].weightage = 0.25;
            validationResult[0].status = true;
        }
    } catch (error) {
        console.error("Error of DNS zone:", error.message);
    }

    try {
        // Validate A Record
        const aRecordSet = await dnsClient.recordSets.get(resourceGroupName, dnsZoneName, aRecordName, "A");
        if (aRecordSet.aRecords.some(record => record.ipv4Address === arecipaddress)) {
            validationResult[1].weightage = 0.25;
            validationResult[1].status = true;
        }
    } catch (error) {
        console.error("Error of DNS records:", error.message);
    }

    try {
        // Validate CNAME Record
        const cnameRecordSet = await dnsClient.recordSets.get(resourceGroupName, dnsZoneName, cnameRecordName, "CNAME");
        //console.log(cnameRecordSet);
        if (cnameRecordSet.cnameRecord.cname === `${aRecordName}.${dnsZoneName}`) {
            validationResult[2].weightage = 0.25;
            validationResult[2].status = true;
        }
    } catch (error) {
        console.error("Error of DNS records:", error.message);
    }

    try {
        // Check if TXT Record exists
        const txtRecordSet = await dnsClient.recordSets.get(resourceGroupName, dnsZoneName, txtRecordName, "TXT");
        console.log(txtRecordSet.txtRecords[0].value[0]);
        if (txtRecordSet.txtRecords[0].value[0] === txtmessage) {
            validationResult[3].weightage = 0.25;
            validationResult[3].status = true;
        }
    } catch (error) {
        console.error("Error of DNS records:", error.message);
    }

    return validationResult;
};

(async () => {
    const result = await validateAzureDNSLab();
    console.log(result);
    return result;
})();

// The script checks if the Azure DNS Zone exists and validates various DNS records based on the lab requirements.
