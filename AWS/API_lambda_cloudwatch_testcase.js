// const AWS = require('aws-sdk');

AWS.config.update({ region: 'ap-southeast-1' });
const apigw = new AWS.APIGateway({
  apiVersion: '2015-07-09',
  region: 'ap-southeast-1',
});

const APIGW_PATH = '/admin';
const APIGW_METHOD = 'POST';
const STAGE_NAME = 'adminpage';
const LOG_GROUP_NAME = '/aws/lambda/admin';

let result = [
  { weightage: 0, name: 'API Gateway name should be "userdemo"', status: false },
  { weightage: 0, name: `Resources should include "${APIGW_PATH}"`, status: false },
  { weightage: 0, name: `"${APIGW_PATH}" should have a "${APIGW_METHOD}" method`, status: false },
  { weightage: 0, name: `Stage name should be "${STAGE_NAME}"`, status: false },
  { weightage: 0, name: 'Enable Detailed CloudWatch Metrics is enabled for "errors and info logs"', status: false },
  { weightage: 0, name: `Check "${LOG_GROUP_NAME}" is in the Log group`, status: false },
];

async function getApis() {
  return new Promise((resolve, reject) => {
    apigw.getRestApis({}, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

async function getApiMethod(apiId, resourceId, method) {
  const params = {
    httpMethod: method,
    resourceId: resourceId,
    restApiId: apiId,
  };

  return new Promise((resolve, reject) => {
    apigw.getMethod(params, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

async function getApiResources(id) {
  const params = {
    restApiId: id,
  };

  return new Promise((resolve, reject) => {
    apigw.getResources(params, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

async function getStage(apiId, stageName) {
  return new Promise((resolve, reject) => {
    const params = {
      restApiId: apiId,
    };

    apigw.getStages(params, function (err, data) {
      if (err) {
        reject(err);
      } else {
        const stage = data.item.find(item => item.stageName === stageName);
        resolve(stage);
      }
    });
  });
}

async function getLoggingSettings(apiId) {
  return new Promise((resolve, reject) => {
    const params = {
      restApiId: apiId,
    };

    apigw.getStages(params, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

async function getLogGroups() {
  return new Promise((resolve, reject) => {
    const cloudwatchlogs = new AWS.CloudWatchLogs({ apiVersion: '2014-03-28' });

    cloudwatchlogs.describeLogGroups({}, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data.logGroups);
      }
    });
  });
}

async function main() {
  try {
    let apiId = '';
    const apisData = await getApis();

    for (const api of apisData.items) {
      if (api.name === 'userdemo') {
        apiId = api.id;
        result[0].status = true;
        result[0].weightage = 0.2;
        break;
      }
    }

    if (result[0].status) {
      const apiResources = await getApiResources(apiId);
      let pathFound = false;
      let resourceId = '';

      for (const resource of apiResources.items) {
        if (resource.path === APIGW_PATH) {
          pathFound = true;
          resourceId = resource.id;
          result[1].status = true;
          result[1].weightage = 0.2;
          break;
        }
      }

      if (pathFound) {
        const apiMethod = await getApiMethod(apiId, resourceId, APIGW_METHOD);
        result[2].status = !!apiMethod;
        result[2].weightage = result[2].status ? 0.2 : 0;
      }

      // Check if the Lambda function "test" is integrated
      // You can integrate this part based on your specific logic
      // If it is integrated, set status to true and weightage to 0.2

      const stageData = await getStage(apiId, STAGE_NAME);
      result[3].status = !!stageData;
      result[3].weightage = result[4].status ? 0.2 : 0;

      const loggingSettings = await getLoggingSettings(apiId);
      if (loggingSettings && Object.keys(loggingSettings).length > 0) {
        result[4].status = true;
        result[4].weightage = 0.1;
      }

      const logGroups = await getLogGroups();
      if (logGroups.some((logGroup) => logGroup.logGroupName === LOG_GROUP_NAME)) {
        result[5].status = true;
        result[5].weightage = 0.1;
      }
    }

    // Calculate total weightage
    // const totalWeightage = result.reduce((total, testCase) => total + testCase.weightage, 0);

    console.log('Result:', result);
    // console.log('Total Weightage:', totalWeightage);
  } catch (error) {
    // console.error(error);
  }
}

main();
