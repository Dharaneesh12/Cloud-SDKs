const tenantId = process.env.tenantId;
const clientId = process.env.clientId;
const clientSecret = process.env.clientSecret;
const subscriptionId = process.env.subscriptionId;

const { ClientSecretCredential } = require("@azure/identity");
const { StorageManagementClient } = require("@azure/arm-storage");
//require('dotenv').config();

//const resourceGroupName = "iamneo";
const expectedLocation = "westeurope"; // Replace with your expected location

const validateStorageAccountScenario = async () => {
  const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
  const storageClient = new StorageManagementClient(credential, subscriptionId);

  try {
    // Get the Storage accounts in the resource group
    const storageAccounts = [];

    for await (const page of storageClient.storageAccounts.listByResourceGroup(resourceGroupName).byPage()) {
      for (const storageAccount of page) {
        storageAccounts.push(storageAccount);
      }
    }

    let validationResult = [
      { weightage: 0, name: "Storage account name matches the naming convention", status: false },
      { weightage: 0, name: "Storage account performance tier is 'Premium'", status: false },
      { weightage: 0, name: "Locally-redundant storage (LRS) replication is enabled", status: false },
      { weightage: 0, name: "Account access tier is set to 'Hot'", status: false },
      { weightage: 0, name: `Storage account is located in '${expectedLocation}'`, status: false }
    ];

    // Find the first Storage account that matches the naming convention
    //const storageAccount = storageAccounts.find(account => account.name.startsWith("myStorageAccount"));
      const storageAccount = storageAccounts.find(account => account.name.match(/^[a-z0-9]{3,24}$/i));
    if (storageAccount) {
      // Storage account name validation
      validationResult[0].weightage = 0.2;
      validationResult[0].status = true;

      try{
        // Performance tier validation
      if (storageAccount.sku.tier === "Premium") {
        validationResult[1].weightage = 0.2;
        validationResult[1].status = true;
      }
    }
    catch(err){
      console.log("Error",err);
    }
      
    try{
      //console.log(storageAccount.sku.replicationType )
      // GRS replication validation
      if (storageAccount.sku && storageAccount.sku.name.includes("LRS")) {
        validationResult[2].weightage = 0.2;
        validationResult[2].status = true;
      }
    }
    catch(err){
      console.log("Error",err);
    }


      try{
        // Account access tier validation
      if (storageAccount.accessTier === "Hot") {
        validationResult[3].weightage = 0.2;
        validationResult[3].status = true;
      }
    }
    catch(err){
      console.log("Error",err);
    }
      
       // Location validation
      if (storageAccount.location === expectedLocation) {
        validationResult[4].weightage = 0.2;
        validationResult[4].status = true;
      }
    }

    //console.log("Validation Result:", validationResult);
    return validationResult;
}catch (error) {
    console.error("Error:", error);
  }
};


(async () => {
  const result = await validateStorageAccountScenario();
  console.log(result);
  return result;
})();