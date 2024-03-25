const { ClientSecretCredential } = require("@azure/identity");
const { ApiManagementClient } = require("@azure/arm-apimanagement");
const { WebSiteManagementClient } = require("@azure/arm-appservice");
require('dotenv').config();

// Azure AD authentication details
const tenantId = process.env.tenantId;
const clientId = process.env.clientId;
const clientSecret = process.env.clientSecret;
const subscriptionId = process.env.subscriptionId;


const apiManagementName = resourceGroupName;
const apiNameToCheck = "moviebooking"; // The API name you want to check
const resourceName = "BookingHttpTrigger"; // The operation name you want to check
const methodName1 = "GET";
const methodName2 = "POST";
const functionAppName = "moviebooking";
const funcloc = "West Europe";
const funcname = "moviebooking/BookingHttpTrigger";

const result = [
  { weightage: 0, name: `Function App named '${functionAppName}' exists`, status: false, error: '' }, 
  { weightage: 0, name: `Function App in the "West Europe" location`, status: false, error: '' }, 
  { weightage: 0, name: `Function '${resourceName}' exists in the Function App`, status: false, error: '' }, 
  { weightage: 0, name: `API Management service named '${apiManagementName}'exists`, status: false, error: '' },
  { weightage: 0, name: `Region is selected as 'West Europe'`, status: false, error: '' },
  { weightage: 0, name: `Tier is selected as 'Developer (No SLA)'`, status: false, error: '' },
  { weightage: 0, name: `API named '${apiNameToCheck}' exists`, status: false, error: '' }, 
  { weightage: 0, name: `Resource named '${resourceName}' imported from Azure Function App exists`, status: false, error: '' }, 
  { weightage: 0, name: `'GET' method exists in the '${resourceName}' Resource`, status: false, error: '' }, 
  { weightage: 0, name: `'POST' method exists in the '${resourceName}' Resource`, status: false, error: '' }, 
];

async function validateApiManagementService() {
  try {
  const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
  const client = new ApiManagementClient(credential, subscriptionId);
  const webSiteClient = new WebSiteManagementClient(credential, subscriptionId);

    // Get the Azure API Management service
    const apiManagement = await client.apiManagementService.get(resourceGroupName, apiManagementName);

    if (apiManagement.name === apiManagementName) {
      result[3].weightage = 0.1;
      result[3].status = true;
    }else{
      result[3].error = `API Management service with the same name of the Resource group given to you does not exist`;
    }

    try {
      if (apiManagement.location === "West Europe") {
        result[4].weightage = 0.1;
        result[4].status = true;
      }else{
        result[4].error = `Region is not selected as 'West Europe'`;
      }
    } catch (error) {
      console.log("Error", error);
    }

    try {
      if (apiManagement.sku.name === "Developer") {
        result[5].weightage = 0.1;
        result[5].status = true;
      }else{
        result[5].error = `Tier is not selected as 'Developer (No SLA)'`;
      }
    } catch (error) {
      console.log("Error", error);
    }

    // Check if API 'flight' exists
    try {
      const apiList = await client.api.listByService(resourceGroupName, apiManagementName);

      for await (const api of apiList) {
        if (api.name === apiNameToCheck) {
          result[6].weightage = 0.1;
          result[6].status = true;
          break; // Exit the loop when found
        }else{  
          result[6].error = `API named '${apiNameToCheck}' does not exist`;
        }
      }
    } catch (error) {
      console.log("Error", error);
    }

    // Check if 'sample' resource with 'GET' method exists
    try {
      const apiOperations = await client.apiOperation.listByApi(
        resourceGroupName,
        apiManagementName,
        apiNameToCheck
      );

      for await (const apiOperation of apiOperations) {
        if (apiOperation.displayName === resourceName) {
          result[7].weightage = 0.1;
          result[7].status = true;

          // Check if 'GET' method exists
          if (apiOperation.method === methodName1) {
            result[8].weightage = 0.1;
            result[8].status = true;
          }else{
            result[8].error = `GET method does not exist`;
          }

          // Check if 'GET' method exists
          if (apiOperation.method === methodName2) {
            result[9].weightage = 0.1;
            result[9].status = true;
          }else{
            result[9].error = `POST method does not exist`;
          }
        }else{
          result[7].error = `Resource named '${resourceName}' imported from Azure Function App does not exist`;
          result[8].error = `GET method does not exist`;
          result[9].error = `POST method does not exist`;
        }
      }
    } catch (error) {
      console.log("Error", error);
    }

    try {
      // Check if Function App exists
      const functionApp = await webSiteClient.webApps.get(resourceGroupName, functionAppName);
      // console.log(functionApp);
      if (functionApp.name === functionAppName) {
        result[0].weightage = 0.1;
        result[0].status = true;

        if (functionApp.location == funcloc) {
          result[1].weightage = 0.1;
          result[1].status = true;

          // Check if Function 'BookingHttpTrigger' exists in the Function App (Test case 8)
          const functionsList = await webSiteClient.webApps.listFunctions(resourceGroupName, functionAppName);

          if (functionsList && typeof functionsList.byPage === 'function') {
            for await (const funcPage of functionsList.byPage()) {
              for (const func of funcPage) {
                // console.log(func.location);
                if (func.name === funcname) {
                  result[2].weightage = 0.1;
                  result[2].status = true;
                  break; // Exit the loop when found
                }
              }
            }
          }
        }
      }
    } catch (error) {
      result[0].error = `Function App Name does not match`;
      result[1].error = `Function App location does not match`;
      result[2].error = `Function '${resourceName}' does not exist in the Function App`;
      // console.log("Error:", error);
      return result;
    }

    return result;
  } catch (error) {
    result[0].error = `Error during Function App Name validation: ${error.message}`;
    result[1].error = `Error during Function App location validation: ${error.message}`;
    result[2].error = `Error during Function App '${resourceName}' Function validation: ${error.message}`;
    result[3].error = `Error in API Management service name: ${error.message}`;
    result[4].error = `Error in API Management service region: ${error.message}`;
    result[5].error = `Error in API Management service tier: ${error.message}`;
    result[6].error = `Error in API Management service API: ${error.message}`;
    result[7].error = `Error in API Management service resource: ${error.message}`;
    result[8].error = `Error in API Management service GET method: ${error.message}`;
    result[9].error = `Error in API Management service POST method: ${error.message}`;
    // console.log("Error:", error);
    return result;
  }
}

// Usage:
(async () => {
  const result = await validateApiManagementService();
  console.log(result);
  return result;
})();
