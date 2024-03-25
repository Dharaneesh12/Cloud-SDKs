// const AWS = require('aws-sdk');
const result = [];
const cloudwatch = new AWS.CloudWatch({ apiVersion: '2010-08-01', region: "ap-southeast-1"  });
var params = {
    AlarmNames: [
        'EC2Monitor2',
    ],
};
cloudwatch.describeAlarms(params, function (err, data) {
    if (data && data.MetricAlarms[0]) {
        result.push({ name: "Alarm Created in the name 'EC2Monitor2'", weightage: 0.25, status: true });
        if(data.MetricAlarms[0].MetricName == "CPUUtilization")
        {
            result.push({ name: "Alarm created for the Metric 'CPUUtilization'", weightage: 0.25, status: true });
        }else{
            result.push({ name: "Alarm created for the Metric 'CPUUtilization'",status: false });
        }
        if(data.MetricAlarms[0].Period == 86400){
            result.push({ name: "The period given is '1 Day'", weightage: 0.25, status: true });
        }else{
            result.push({ name: "The period given is '1 Day'", status: false });
        }
        if((data.MetricAlarms[0].Threshold == 1000) &&(data.MetricAlarms[0].ComparisonOperator =="GreaterThanThreshold")){
            result.push({ name: "The Threshold is set to Greater than 1000 ", weightage: 0.25, status: true });
            console.log(result);
        }else{
            result.push({ name: "The Threshold is set to Greater than 1000", status: false });
            console.log(result);
        }
    } 
    else {
        result.push({ name: "Alarm Created in the name 'EC2Monitor2'", status: false });
        result.push({ name: "Alarm created for the Metric 'CPUUtilization'",status: false });
        result.push({ name: "The period given is '1 Day'", status: false });
        result.push({ name: "The Threshold is set to Greater than 1000 ", status: false });
        console.log(result);
    }     
});