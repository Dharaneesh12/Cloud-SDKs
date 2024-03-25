const { ClientSecretCredential } = require("@azure/identity");
const { ComputeManagementClient } = require("@azure/arm-compute");
const { NetworkManagementClient } = require("@azure/arm-network");
require('dotenv').config();

// Azure AD authentication details
const tenantId = process.env.tenantId;
const clientId = process.env.clientId;
const clientSecret = process.env.clientSecret;
const subscriptionId = process.env.subscriptionId;

//const resourceGroupName = "iamneo";
const vmName = "test845";

const result = [
    { weightage: 0, name: "VM name is test845", status: false },
    { weightage: 0, name: "VM size/type is 'Standard_B1s'", status: false },
    { weightage: 0, name: "OS is Ubuntu and Version is '22.04'", status: false },
    { weightage: 0, name: "VM Location is 'centralindia'", status: false }
];

async function getVmProperties() {
    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    const computeClient = new ComputeManagementClient(credential, subscriptionId);
    const networkClient = new NetworkManagementClient(credential, subscriptionId);
    
    try {
        // Get the virtual machine by its resource group and name
        const vm = await computeClient.virtualMachines.get(resourceGroupName, vmName, {
            expand: "instanceView" // Include the instance view for additional properties
        });
        //console.log(vm.instanceView.osName)
        //console.log(vm.instanceView.osVersion)
        if (vm.name === "test845") {
            result[0].weightage = 0.25;
            result[0].status = true;
        }

        if (vm.hardwareProfile.vmSize === 'Standard_B1s') {
            result[1].weightage = 0.25;
            result[1].status = true;
        }

        if (vm.instanceView.osName === 'ubuntu' && vm.instanceView.osVersion === '22.04') {
            result[2].weightage = 0.25;
            result[2].status = true;
        }

        if (vm.location === 'centralindia') {
            result[3].weightage = 0.25;
            result[3].status = true;
        }
        return result;

    } catch (error) {
        //console.error("Error:", error);
        return result;
    }
}

(async () => {
    const result = await getVmProperties();
    console.log(result);
    return result;}
)();