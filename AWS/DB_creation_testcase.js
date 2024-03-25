// const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-northeast-3' }); // Change the region as required

const dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

const tableName = 'userdb'; // Change to your desired table name
const primaryKey = 'rollno'; // Change to your desired primary key attribute name
const provisionedThroughput = {
  ReadCapacityUnits: 1, // Change to your desired read capacity units
  WriteCapacityUnits: 1, // Change to your desired write capacity units
};
const tagKey = 'lab'; // Change to your desired tag key
const tagValue = 'efs'; // Change to your desired tag value

const validateDynamoDBTableCreation = async () => {
  const validationResult = [
    { weightage: 0, name: 'DynamoDB table name should be "userdb"', status: false },
    { weightage: 0, name: 'DynamoDB table primary key should be "rollno"', status: false },
    { weightage: 0, name: 'DynamoDB table should have the specified provisioned throughput', status: false },
    { weightage: 0, name: 'DynamoDB table tag should be tagKey as "lab" and tagValue as "efs"', status: false },
  ];

  try {
    const tables = await dynamodb.listTables().promise();

    // Check if the DynamoDB table with the desired name exists
    if (tables.TableNames.includes(tableName)) {
      validationResult[0].weightage = 0.25;
      validationResult[0].status = true;

      // Describe the table to check its properties
      const tableDescription = await dynamodb.describeTable({ TableName: tableName }).promise();

      // Check if the DynamoDB table has the specified primary key
      if (tableDescription.Table.KeySchema.some(key => key.AttributeName === primaryKey)) {
        validationResult[1].weightage = 0.25;
        validationResult[1].status = true;

        // Check if the DynamoDB table has the specified provisioned throughput
        if (
          tableDescription.Table.ProvisionedThroughput.ReadCapacityUnits === provisionedThroughput.ReadCapacityUnits &&
          tableDescription.Table.ProvisionedThroughput.WriteCapacityUnits === provisionedThroughput.WriteCapacityUnits
        ) {
          validationResult[2].weightage = 0.25;
          validationResult[2].status = true;
        }

        // Check if the DynamoDB table has the specified tag value
        const tags = await dynamodb.listTagsOfResource({ ResourceArn: tableDescription.Table.TableArn }).promise();
        if (tags.Tags.find(tag => tag.Key === tagKey && tag.Value === tagValue)) {
          validationResult[3].weightage = 0.25;
          validationResult[3].status = true;
        }
      }
    }

    return validationResult;
  } catch (error) {
    return validationResult;
  }
};

(async () => {
  const result = await validateDynamoDBTableCreation();
  console.log(result);
  return result;
})();
