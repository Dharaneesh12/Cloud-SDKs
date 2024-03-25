const { ClientSecretCredential } = require("@azure/identity");
const { PrivateDnsManagementClient } = require("@azure/arm-privatedns");

require('dotenv').config();

// Azure AD authentication details
const tenantId = process.env.tenantId;
const clientId = process.env.clientId;
const clientSecret = process.env.clientSecret;
const subscriptionId = process.env.subscriptionId;

// Define input variables
const privateDnsZoneName = "discount365.com";
const aRecordName = "ltimweb";
const arecipaddress = "10.20.10.22";
const cnameRecordName = "www";
const txtRecordName = "webtxt";
const txtmessage = "This is my webpage";

const validationResult = [
    { weightage: 0, name: `Azure DNS Zone '${privateDnsZoneName}' exists`, status: false },
    { weightage: 0, name: `A Record '${aRecordName} exists`, status: false },
    { weightage: 0, name: `CNAME Record '${cnameRecordName} exists`, status: false },
    { weightage: 0, name: `TXT Record '${txtRecordName}' exists`, status: false },
    // { weightage: 0, name: `Subdomain '${subdomain}.${customDomain}' resolves to '${webAppName}.azurewebsites.net'`, status: false },
];

async function validateAzureDNSLab() {
    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    const dnsClient = new PrivateDnsManagementClient(credential, subscriptionId);

    let zone, aRecordSet, cnameRecordSet, txtRecordSet;
    try {
        // Check if Azure DNS Zone exists
        zone = await dnsClient.privateZones.get(resourceGroupName, privateDnsZoneName);
        //console.log(zone);
        if (zone.name === privateDnsZoneName) {
            validationResult[0].weightage = 0.25;
            validationResult[0].status = true;
        }
    } catch (error) {
        console.error("Error of DNS zone:", error.message);
    }

    try {
        // Validate A Record
        aRecordSet = await dnsClient.recordSets.get(resourceGroupName, privateDnsZoneName, "A", aRecordName);
        //console.log(aRecordSet);
        if (aRecordSet.aRecords.some(record => record.ipv4Address === arecipaddress)) {
            validationResult[1].weightage = 0.25;
            validationResult[1].status = true;
        }
    } catch (error) {
        console.error("Error of DNS records:", error.message);
    }

    try {
        // Validate CNAME Record
        cnameRecordSet = await dnsClient.recordSets.get(resourceGroupName, privateDnsZoneName, "CNAME", cnameRecordName);
        //console.log(cnameRecordSet);
        if (cnameRecordSet.cnameRecord.cname === `${aRecordName}.${privateDnsZoneName}`) {
            validationResult[2].weightage = 0.25;
            validationResult[2].status = true;
        }
    } catch (error) {
        console.error("Error of DNS records:", error.message);
    }

    try {
        // Check if TXT Record exists
        txtRecordSet = await dnsClient.recordSets.get(resourceGroupName, privateDnsZoneName, "TXT", txtRecordName);
        //console.log(txtRecordSet.txtRecords[0].value[0]);
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
