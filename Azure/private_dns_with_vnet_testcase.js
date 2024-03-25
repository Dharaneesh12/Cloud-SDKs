const { ClientSecretCredential } = require("@azure/identity");
const { PrivateDnsManagementClient } = require("@azure/arm-privatedns");
const { NetworkManagementClient } = require("@azure/arm-network");

require('dotenv').config();

// Azure AD authentication details
const tenantId = process.env.tenantId;
const clientId = process.env.clientId;
const clientSecret = process.env.clientSecret;
const subscriptionId = process.env.subscriptionId;

// Define input variables
const privateDnsZoneName = "discount365.com";
const virtualNetworkLinkName = "myvnetlink";
const vnetName = "AppVNet";

const validationResult = [
    { weightage: 0, name: `Private DNS Zone '${privateDnsZoneName}' exists`, status: false },
    { weightage: 0, name: `Virtual Network '${vnetName}' exists`, status: false },
    { weightage: 0, name: `Zone '${privateDnsZoneName}' has vnet link '${virtualNetworkLinkName}'`, status: false },
    { weightage: 0, name: `Vnet link '${virtualNetworkLinkName}' has vnet '${vnetName}'`, status: false },
]

async function validateAzureDNSLab() {
    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    const dnsClient = new PrivateDnsManagementClient(credential, subscriptionId);
    const networkClient = new NetworkManagementClient(credential, subscriptionId);

    let zone, vnetlink, vnet;
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
        vnet = await networkClient.virtualNetworks.get(resourceGroupName, vnetName);
        if (vnet && vnet.name === vnetName) {
            validationResult[1].weightage = 0.1;
            validationResult[1].status = true;
        }
    } catch (error) {
        console.error("Error of VNet:", error.message);
    }

    try {
        // Check if Azure DNS Zone exists
        vnetlink = await dnsClient.virtualNetworkLinks.get(resourceGroupName, privateDnsZoneName, virtualNetworkLinkName);
        console.log(vnetlink);
        if (vnetlink.name === virtualNetworkLinkName) {
            validationResult[2].weightage = 0.25;
            validationResult[2].status = true;
        }

        if (vnetlink.virtualNetwork.id.includes(vnetName)) {
            validationResult[3].weightage = 0.25;
            validationResult[3].status = true;
        }
    } catch (error) {
        console.error("Error of DNS zone:", error.message);
    }
    
    return validationResult;
};

(async () => {
    const result = await validateAzureDNSLab();
    console.log(result);
    return result;
})();

// The script checks if the Azure DNS Zone exists and validates various DNS records based on the lab requirements.
