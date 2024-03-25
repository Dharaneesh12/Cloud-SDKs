const { ClientSecretCredential } = require("@azure/identity");
const { NetworkManagementClient } = require("@azure/arm-network");
const { WebSiteManagementClient } = require("@azure/arm-appservice");
//const { ComputeManagementClient, NetworkManagementClient, WebSiteManagementClient } = require("@azure/arm-resources");

require('dotenv').config();

// Azure AD authentication details
const tenantId = process.env.tenantId;
const clientId = process.env.clientId;
const clientSecret = process.env.clientSecret;
const subscriptionId = process.env.subscriptionId;

// Define input variables
const vnetName = "AppVNet";
const vnetAddress = "177.31.0.0/16";
const Subnet1Name = "TestSubnet";
const Subnet1Address = "177.31.0.0/24";
const functionAppName = resourceGroupName;

const validateVNetIntegrationLab = async () => {
    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    const networkClient = new NetworkManagementClient(credential, subscriptionId);
    const webSiteClient = new WebSiteManagementClient(credential, subscriptionId);

    const validationResult = [
        { weightage: 0, name: `VNet '${vnetName}' exists`, status: false },
        { weightage: 0, name: `VNet '${vnetName}' address space is '${vnetAddress}'`, status: false },
        { weightage: 0, name: `Subnet '${Subnet1Name}' exists under '${vnetName}'`, status: false },
        { weightage: 0, name: `Subnet '${Subnet1Name}' exists with address range '${Subnet1Address}'`, status: false },
        { weightage: 0, name: `Function App '${functionAppName}' exists`, status: false },
        { weightage: 0, name: `Function App '${functionAppName}' is integrated with VNet`, status: false },
    ];

    let vnet, subnets, mysubnet, subnet1, functionApp;
    try {
        // Check if VNet exists
        vnet = await networkClient.virtualNetworks.get(resourceGroupName, vnetName);
        const vnetaddress = vnet.addressSpace;
        //console.log(vnetaddress);
        if (vnet && vnet.name === vnetName) {
            validationResult[0].weightage = 0.15;
            validationResult[0].status = true;
        }

        if (vnetaddress.addressPrefixes.includes(vnetAddress)) {
            validationResult[1].weightage = 0.15;
            validationResult[1].status = true;
        }

    } catch (error) {
        console.error("Error fetching VNet:", error.message);
        //validationResult.push({ weightage: 0, name: `Error fetching VNet: ${error.message}`, status: false });
    }

    try {
        // Fetch Subnets
        subnets = await networkClient.virtualNetworks.get(resourceGroupName, vnetName);
        mysubnet = subnets.subnets;
        subnet1 = mysubnet.find(s1 => s1.name === Subnet1Name);

        if (subnet1 && subnet1.name === Subnet1Name) {
            validationResult[2].weightage = 0.15;
            validationResult[2].status = true;
        }

        if (subnet1.addressPrefix === Subnet1Address || subnet1.addressPrefixes.includes(Subnet1Address)) {
            validationResult[3].weightage = 0.15;
            validationResult[3].status = true;
        }

    } catch (error) {
        console.error(`Error fetching Subnet: ${error.message}`);
        //validationResult.push({ weightage: 0, name: `Error fetching Subnet: ${error.message}`, status: false });
    }

    try {
        // Check if Function App exists
        const functionApp = await webSiteClient.webApps.get(resourceGroupName, functionAppName);
        if (functionApp.name === functionAppName) {
            validationResult[4].weightage = 0.20;
            validationResult[4].status = true;
        }

        // Validate VNet Integration for Function App
        if (functionApp.virtualNetworkSubnetId.includes(vnetName && Subnet1Name)) {
            validationResult[5].weightage = 0.20;
            validationResult[5].status = true;
        }
    } catch (error) {
        console.error(`Error fetching App: ${error.message}`);
        //validationResult.push({ weightage: 0, name: `Error fetching App: ${error.message}`, status: false });
    }

    return validationResult;
};

(async () => {
    const result = await validateVNetIntegrationLab();
    console.log(result);
    return result;
})();

// The script checks if the VNet, Function App, VNet integration, and secure access are correctly set up and returns a validation result.
