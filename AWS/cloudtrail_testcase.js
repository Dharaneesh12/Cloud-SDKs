// const AWS = require('aws-sdk');
const result = [];
const cloudtrail = new AWS.CloudTrail({ apiVersion: '2013-11-01', region: "eu-west-2" });
var params = {
    Name: 'AdminTrail'
};
cloudtrail.getTrail(params, function (err, data) {
    if (data) {
        result.push({ name: "CloudTrail created in the name 'AdminTrail'", weightage: 0.25, status: true });
        var params = {
            TrailName: 'AdminTrail'
        };
        cloudtrail.getEventSelectors(params, function (err, data) {
            if (data && data.AdvancedEventSelectors[0]) {
                // console.log(data.AdvancedEventSelectors[0].FieldSelectors)
                if (data.AdvancedEventSelectors[0].FieldSelectors[0].Equals[0] == 'Data') {
                    result.push({ name: "Log Event Type is 'Data Events", weightage: 0.25, status: true });
                }
                else {
                    result.push({ name: "Log Event Type is 'Data Events", status: false });
                }
                if ((data.AdvancedEventSelectors[0].FieldSelectors[2]) && (data.AdvancedEventSelectors[0].FieldSelectors[2].Equals == "AWS::S3::AccessPoint")) {
                    result.push({ name: "Data event type is 'S3'", weightage: 0.25, status: true });
                    if ((data.AdvancedEventSelectors[0].FieldSelectors[1]) && (data.AdvancedEventSelectors[0].FieldSelectors[1].Field == "readOnly") && (data.AdvancedEventSelectors[0].FieldSelectors[1].Equals = "false")) {
                        result.push({ name: "Log selector template is 'Log readOnly events", weightage: 0.25, status: true });
                    }
                    else {
                        result.push({ name: "Log selector template is 'Log readOnly events", status: false });
                    }
                    console.log(result)
                }
                else {
                    result.push({ name: "Data event type is 'S3 AccessPoint'", status: false });
                    result.push({ name: "Log selector template is 'Log readOnly events", status: false });
                    console.log(result)
                }
            }
            else {
                result.push({ name: "Log Event Type is 'Data Events", status: false });
                result.push({ name: "Log selector template is 'Log readOnly events", status: false });
                result.push({ name: "Data event type is 'S3 AccessPoint'", status: false });
                console.log(result)
            }
        });
    }
    else {
        result.push({ name: "CloudTrail created in the name 'AdminTrail'", status: false });
        result.push({ name: "Log Event Type is 'Data Events", status: false });
        result.push({ name: "Log selector template is 'Log readOnly events", status: false });
        result.push({ name: "Data event type is 'S3 AccessPoint'", status: false });
        console.log(result)
    }
});