const { ClientSecretCredential } = require("@azure/identity");
const { ApiManagementClient } = require("@azure/arm-apimanagement");
require('dotenv').config();

// Azure AD authentication details
const tenantId = process.env.tenantId;
const clientId = process.env.clientId;
const clientSecret = process.env.clientSecret;
const subscriptionId = process.env.subscriptionId;


const apiManagementName = resourceGroupName;

const result = [
  { weightage: 0, name: "API Management service with the same name of the Resource group given to you exists", status: false, error: '' },
  { weightage: 0, name: "Region is selected as 'West US'", status: false, error: '' },
  { weightage: 0, name: "Tier is selected as 'Developer(No SLA)'", status: false, error: '' },
  { weightage: 0, name: "Connectivity type is 'none'", status: false, error: '' },
];

async function validateApiManagementService() {
  const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
  const client = new ApiManagementClient(credential, subscriptionId);

  try {
    // Get the Azure API Management service
    const apiManagement = await client.apiManagementService.get(resourceGroupName, apiManagementName);
    // console.log(apiManagement);
    if (apiManagement.name === apiManagementName) {
      result[0].weightage = 0.25;
      result[0].status = true;
    }else{
      result[0].error = `API Management service with the same name of the Resource group given to you does not exist`;
    }

    try{
    if (apiManagement.location === "West US") {
      result[1].weightage = 0.25;
      result[1].status = true;
    }
  } catch (error) {
    result[1].error = `API management Location validation: ${error.message}`;
    console.log("Error:",error);
  }
  
     try{
      if (apiManagement.sku.name === "Developer") {
      result[2].weightage = 0.25;
      result[2].status = true;
    }else{
      result[2].error = `API management Tier does not match the expected value`;
    }
  } catch (error) {
    result[2].error = `API management Tier validation: ${error.message}`;
  console.log("Error",error);
}

     try{
     if (apiManagement.virtualNetworkType === "None") {
      result[3].weightage = 0.25;
      result[3].status = true;
    }else{
      result[3].error = `API management Connectivity type does not match the expected value`;
    }
  } catch (error) {
    result[3].error = `API management Connectivity type validation: ${error.message}`;
    console.log("Error:",error);
  }

    return result;
  } catch (error) {
    result[0].error = `Error fetching API Management service: ${error.message}`;
    result[1].error = `Error fetching API Management service Location: ${error.message}`;
    result[2].error = `Error fetching API Management service Tier: ${error.message}`;
    result[3].error = `Error fetching API Management service Connectivity type: ${error.message}`;
    // console.log("Error",error);
    return result;
  }
}

// Usage:
(async () => {
  const result = await validateApiManagementService();
  console.log(result);
  return result;
})();
