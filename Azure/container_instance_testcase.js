// Azure AD authentication details
const tenantId = process.env.tenantId;
const clientId = process.env.clientId;
const clientSecret = process.env.clientSecret;
const subscriptionId = process.env.subscriptionId;

const { ClientSecretCredential } = require("@azure/identity");
const { ContainerInstanceManagementClient } = require("@azure/arm-containerinstance");

const containerInstanceName = "testing";

const result = [
  { weightage: 0, name: "Container Instance named 'testing' exists", status: false },
  { weightage: 0, name: "Container Instance is in Central India region", status: false },
  { weightage: 0, name: "Container Image matches the selected image", status: false },
  { weightage: 0, name: "CPU setting is 1 vCPU and Memory setting is 2 GB", status: false },
  { weightage: 0, name: "Networking type is 'Public'", status: false },
  { weightage: 0, name: "Restart Policy is set to 'Never'", status: false }
];

async function validateContainerInstance() {
  const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
  const client = new ContainerInstanceManagementClient(credential, subscriptionId);

  try {
    // Get the Azure Container Instance
    const containerInstance = await client.containerGroups.get(resourceGroupName, containerInstanceName);

    if (containerInstance.name === containerInstanceName) {
      result[0].weightage = 0.2;
      result[0].status = true;
    }

    try{
    if (containerInstance.location === "centralindia") {
      result[1].weightage = 0.1;
      result[1].status = true;
    }
  }
  catch{
    console.log("Error:",error);
  }
   
   try{ // Validate the container image used for the instance
    const selectedImage = "mcr.microsoft.com/azuredocs/aci-helloworld:latest";
    if (containerInstance.containers && containerInstance.containers.length > 0) {
    const container = containerInstance.containers[0];
    //console.log(container.image)
    if (container.image === selectedImage) {
        result[2].weightage = 0.1;
        result[2].status = true;
    }
    }
     //console.log(containerInstance.containers)
    }
    catch{
      console.log("Error:",error);
    }
  
 // Validate the CPU and memory settings
 try{
    if (containerInstance.containers && containerInstance.containers.length > 0) {
        const container = containerInstance.containers[0];
        const resources = container.resources;
        if (resources && resources.requests && resources.requests.cpu && resources.requests.memoryInGB) {
        const cpu = resources.requests.cpu;
        const memory = resources.requests.memoryInGB;
        //console.log(cpu, memory);
        if (cpu === 1 && memory === 2) {
            result[3].weightage = 0.2;
            result[3].status = true;
        }
        }
    }
  }
  catch{
    console.log("Error",error);
  }
  

  try{
   //console.log(containerInstance.restartPolicy)
    // Validate the restart policy
    if (containerInstance.restartPolicy === "Never") {
      result[5].weightage = 0.2;
      result[5].status = true;
    }
  }
  catch{
    console.log("Error",error);
  }

    
  try{
    if (containerInstance.containers && containerInstance.containers.length > 0) {
      const container = containerInstance.containers[0];
      // console.log(containerInstance.ipAddress);
      if (container.ports && container.ports.length > 0) {
        if (containerInstance.ipAddress && containerInstance.ipAddress.type === "Public") {
          result[4].weightage = 0.2;
          result[4].status = true;
        }
      }
    }
  }
  catch{
    console.log("Error",error);
  }
  
    return result;
  } catch (error) {
    console.log("Error",error);
    return result;
  }
}

// Usage:
(async () => {
  let result=await validateContainerInstance();
  console.log( result);
  return result;
})();
