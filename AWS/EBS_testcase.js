// const AWS = require('aws-sdk');

AWS.config.update({ region: 'eu-central-1' });

const ec2 = new AWS.EC2({ apiVersion: '2016-11-15' });

let result = [
  { weightage: '0', description: 'EBS Volume size should be 9 and type should be \'gp2\'', status: false },
  { weightage: '0', description: 'EBS Volume snapshot is enabled', status: false },
  { weightage: '0', description: 'EBS Volume is attached to an EC2 instance', status: false },
  { weightage: '0', description: 'EBS Volume tag Key as "ebs" and Value as "snapshot_enabled"', status: false },
];

async function checkEBSVolume() {
  try {
    // List all EBS volumes in your account
    const volumes = await ec2.describeVolumes().promise();
    // console.log(volumes.Volumes);

    for (const volume of volumes.Volumes) {
      if (volume.VolumeType === 'gp2' && volume.Size === 9) {
        result[0].status = true;
        result[0].weightage = '0.25';
        break;
      }
    }

    for (const volume of volumes.Volumes) {
      if (volume.SnapshotId) {
        result[1].status = true;
        result[1].weightage = '0.25';
        break;
      }
    }

    // List all EC2 instances in your account
    const instances = await ec2.describeInstances().promise();

    for (const reservation of instances.Reservations) {
      for (const ec2Instance of reservation.Instances) {
        for (const volume of ec2Instance.BlockDeviceMappings) {
          if (volume.Ebs) {
            result[2].status = true;
            result[2].weightage = '0.25';
            break;
          }
        }
      }
    }

    // Check for a valid tag on an EBS volume
    for (const volume of volumes.Volumes) {
      const tags = volume.Tags;
      if (tags.some(tag => tag.Key === 'ebs' && tag.Value === 'snapshot_enabled')) {
        result[3].status = true;
        result[3].weightage = '0.25';
        break;
      }
    }

    console.log('Result: ', result);
  } catch (error) {
    // console.error(error);
  }
}

checkEBSVolume();
