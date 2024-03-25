// // Load the AWS SDK for Node.js
// const AWS = require('aws-sdk');
// const http = require('http');
// // Load credentials and set region from JSON file
// AWS.config.update({ region: 'ap-southeast-1' });

const ec2 = new AWS.EC2({ apiVersion: "2016-11-15", region: 'ap-southeast-1' });
ec2.describeInstances(
    {
        DryRun: false,
        Filters: [
            {
                Name: "instance-state-name",
                Values: ["running"],
            },
            {
                Name: "tag:Name",
                Values: ["dev-test"],
            },
        ],
    },
    function (err, data) {
        if (err) console.log(err, err.stack);
        //console.log(data.Reservations[0].Instances[0]);
        const result = [];
        if (
            data.Reservations[0] &&
            data.Reservations[0].Instances &&
            // data.Reservations[0].Instances[0]
            //data.Reservations[0].Instances[0].KeyName == 'dev-test' &&
            data.Reservations[0].Instances[0].Tags[0].Value == 'dev-test'
        ) {
            const instance = data.Reservations[0].Instances[0];
            if (instance.ImageId === 'ami-051f7e7f6c2f40dc1') {
                result.push({ name: "Windows Server 2022 Core is selected", weightage: 0.2, status: true });
            } else {
                result.push({ name: "Windows Server 2022 Core is selected", status: false });                
            }

            if (instance.PublicIpAddress) {
                result.push({ name: "Auto-Assign public IP is enabled", weightage: 0.2, status: true });
            } else {
                result.push({ name: "Auto-Assign public IP is enabled", status: false });
            }
            if (
                instance.SecurityGroups[0] &&
                instance.SecurityGroups[0].GroupId
            ) {
                ec2.describeSecurityGroups(
                    {
                        GroupIds: [instance.SecurityGroups[0].GroupId],
                    },
                    (ruleErr, rules) => {
                        const instanceRules = rules.SecurityGroups[0];
                        if (instanceRules && instanceRules.IpPermissions) {
                            if (
                                instanceRules.IpPermissions.find((r) => r.FromPort === 80)
                            ) {
                                result.push({ name: "Exposed 80 port in security group", weightage: 0.2, status: true });
                                //console.log(result);
                            } else {
                                result.push({ name: "Exposed 80 port in security group", status: false });
                                //console.log(result);
                            }
                            if (
                                instance.PublicDnsName &&
                                instance.PublicIpAddress
                            ) {
                                const options = {
                                    host: instance.PublicIpAddress,
                                    path: '/homepage.html',
                                };
                                const request = http.request(options, (response) => {
                                    //console.log(`STATUS: ${response.statusCode}`);
                                    if (response.statusCode === 200) {
                                        result.push({ name: "WebService is running", weightage: 0.2, status: true });
                                        result.push({ name: "homepage.html Webpage is available", weightage: 0.2, status: true });
                                        console.log(result);
                                    } else {
                                        result.push({ name: "WebService is running", status: false });
                                        result.push({ name: "homepage.html Webpage is available", status: false });
                                        console.log(result);
                                    }
                                })
                                request.on('error', (error) => {
                                    result.push({ name: "WebService is running", status: false });
                                    result.push({ name: "homepage.html Webpage is available", status: false });
                                    console.log(result);
                                });
                                request.end();
                            } else {
                                result.push({ name: "Public IP is enabled", status: false });
                                console.log(result);
                            }
                        }
                    }
                )
            }
        } else {
            result.push({ name: "'dev-test' is availbale", status: false });
            console.log(result);
        }
    }
)

