const { ClientSecretCredential } = require("@azure/identity");
const { StorageManagementClient } = require("@azure/arm-storage");
const { QueueServiceClient, StorageSharedKeyCredential } = require("@azure/storage-queue");
require('dotenv').config();

// Azure AD authentication details
const tenantId = process.env.tenantId;
const clientId = process.env.clientId;
const clientSecret = process.env.clientSecret;
const subscriptionId = process.env.subscriptionId;

// const resourceGroupName = "stark-content-creation";
const accountName = resourceGroupName;
const expectedLocation = "southeastasia"; // Replace with your expected location
const queueName = "myorderqueue";

let result = [
  { weightage: 0, name: `Storage account named '${accountName}' exists`, status: false, error:'' },
  { weightage: 0, name: `Storage account is located in 'SouthEast Asia'`, status: false, error:'' },
  { weightage: 0, name: "Storage account with Standard performance tier exists", status: false, error:'' },
  { weightage: 0, name: "Storage account with LRS replication exists", status: false, error:'' },
  { weightage: 0, name: "Storage account with Hot access tier exists", status: false, error:'' },
  { weightage: 0, name: `Azure Queue name '${queueName}' exists`, status: false, error:'' },
  { weightage: 0, name: `Message text named "Your order is in the queue. We appreciate your patience." in the Azure Queue name '${queueName}'`, status: false, error:'' },
];

const validateStorageAccountScenario = async () => {
  const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
  const storageClient = new StorageManagementClient(credential, subscriptionId);

  try {
    // Get the Storage accounts in the resource group
    const storageAccount = await storageClient.storageAccounts.getProperties(resourceGroupName, accountName);

    if (storageAccount.name === accountName) {
      // Storage account name validation
      result[0].weightage = 0.1;
      result[0].status = true;
    }
      else {
        result[0].error = `Storage account name does not exists as '${accountName}'`;
      }
      
      // Location validation
      if (storageAccount.location === expectedLocation) {
          result[1].weightage = 0.1;
          result[1].status = true;
          } else {
              result[1].error = `Storage account is not located in 'SouthEast Asia'`;
          }


        if (storageAccount.sku.name === "Standard_LRS") {
          result[2].weightage = 0.1;
          result[2].status = true;
        } else {
          result[2].error = `Storage account with Standard performance tier does not exist`;
        }


        if (storageAccount.sku.tier === "Standard") {
          result[3].weightage = 0.1;
          result[3].status = true;
        } else {
          result[3].error = `Storage account with LRS replication does not exist`;
        }


        if (storageAccount.kind === "StorageV2") {
          result[4].weightage = 0.1;
          result[4].status = true;
        } else {
          result[4].error = `Storage account with Hot access tier does not exist`;
        }

      // Check if the queue exists in the storage account
      try {
        const keys = await storageClient.storageAccounts.listKeys(resourceGroupName, storageAccount.name);
        const accountKey = keys.keys[0].value;

        const sharedKeyCredential = new StorageSharedKeyCredential(storageAccount.name, accountKey);
        const queueServiceClient = new QueueServiceClient(`https://${accountName}.queue.core.windows.net`, sharedKeyCredential);
        const getqueue = await storageClient.queue.get(resourceGroupName, accountName, queueName);
        //console.log(queueClient);

        if (getqueue.name === queueName) {
          result[5].weightage = 0.3;
          result[5].status = true;

          const queueClient = queueServiceClient.getQueueClient(queueName);
          const messages = await queueClient.receiveMessages();
          // console.log(messages);
          if (messages && messages.receivedMessageItems.length > 0) {
            const firstMessage = messages.receivedMessageItems[0];
            if (firstMessage.messageText === "Your order is in the queue. We appreciate your patience.") {
              result[6].weightage = 0.2;
              result[6].status = true;
            }
            else {
              result[6].error = `Message text named "Your order is in the queue. We appreciate your patience" does not exist in the Azure Queue name '${queueName}'`;
            }
          }
        }
      } catch (error) { 
        result[5].error = `Error fetching Queue Name in the storage account: ${JSON.parse(error.message).error.message}`;
        result[6].error = `Error fetching Message text in the storage account: ${JSON.parse(error.message).error.message}`;
      }
    } 
   catch (error) {
    // console.error("Error:", error);
    result[0].error = `Error fetching Storage account Name: ${JSON.parse(error.message).error.message}`;
    result[1].error = `Error fetching Storage account Location: ${JSON.parse(error.message).error.message}`;
    result[2].error = `Error fetching Storage account Tier: ${JSON.parse(error.message).error.message}`;
    result[3].error = `Error fetching Storage account Performance: ${JSON.parse(error.message).error.message}`;
    result[4].error = `Error fetching Storage account Hot/Cool: ${JSON.parse(error.message).error.message}`;
    result[5].error = `Error fetching Queue Name in the storage account: ${JSON.parse(error.message).error.message}`;
    result[6].error = `Error fetching Message text in the storage account: ${JSON.parse(error.message).error.message}`;
  } finally {
    return result;
  }
};

// Usage:
(async () => {
  const result = await validateStorageAccountScenario();
  console.log(result);
  return result;
})();
