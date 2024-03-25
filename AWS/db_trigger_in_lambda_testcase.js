// const AWS = require('aws-sdk');

AWS.config.update({ region: 'ap-northeast-3' });

const lambda = new AWS.Lambda();
const dynamodb = new AWS.DynamoDB();

let result = [
  { weightage: 0, name: "Lambda function name should be 'db_lambda'", status: false },
  { weightage: 0, name: "DynamoDB table 'lambdadb' exists", status: false },
  { weightage: 0, name: "DynamoDB trigger is configured for the Lambda function", status: false },
];

async function checkLambdaAndDynamoDBTrigger() {
  try {
    const lambdaFunctionName = 'db_lambda'; // Change to your Lambda function name
    const dynamoDBTableName = 'lambdadb'; // Change to your DynamoDB table name

    const lambdaData = await lambda.getFunction({ FunctionName: lambdaFunctionName }).promise();

    if (lambdaData.Configuration) {
      result[0].status = true;
      
      const dynamoDBTableData = await dynamodb.describeTable({ TableName: dynamoDBTableName }).promise();

      if (dynamoDBTableData.Table) {
        result[1].status = true;

        // Check for DynamoDB trigger using listEventSourceMappings
        const eventSourceMappings = await lambda.listEventSourceMappings({ FunctionName: lambdaFunctionName }).promise();

        const dynamoDBTriggerExists = eventSourceMappings.EventSourceMappings.some((mapping) => {
          return (
            mapping.EventSourceArn === dynamoDBTableData.Table.LatestStreamArn &&
            mapping.EventSourceArn.startsWith('arn:aws:dynamodb')
          );
        });

        if (dynamoDBTriggerExists) {
          result[2].status = true;
          // console.log('DynamoDB trigger is configured for the Lambda function.');
        }
      }
    }

    // Check if the DynamoDB table exists
    const dynamoDBTableExists = await dynamodb.describeTable({ TableName: dynamoDBTableName }).promise();
    if (dynamoDBTableExists.Table) {
      result[1].status = true;
      // console.log(`DynamoDB table '${dynamoDBTableName}' exists.`);
    }

  } catch (error) {
    // console.error('Error:', error);
  }

  // Update weightage based on the results
  result[0].weightage = result[0].status ? 0.25 : 0;
  result[1].weightage = result[1].status ? 0.25 : 0;
  result[2].weightage = result[2].status ? 0.5 : 0;

  console.log('Result:', result);
}

checkLambdaAndDynamoDBTrigger();
