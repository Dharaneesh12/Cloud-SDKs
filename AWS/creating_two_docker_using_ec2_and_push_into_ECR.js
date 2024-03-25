// const AWS = require("aws-sdk");

AWS.config.update({ region: "ca-central-1" });

const ec2 = new AWS.EC2();
const ecr = new AWS.ECRPUBLIC({
  apiVersion: "2020-10-30",
  region: "ca-central-1",
});

let result = [
  {
    weightage: 0,
    name: "EC2 instance named 'DevECR' exists and the OS should be 'Amazon Linux 2023 AMI'",
    status: false,
  },
  {
    weightage: 0,
    name: "Public repository named 'Devdocker' exists",
    status: false,
  },
  {
    weightage: 0,
    name: "Image tag 'latest' exists in the 'Devdocker' public repo",
    status: false,
  },
  {
    weightage: 0,
    name: "Image tag 'V2' exists in the 'Devdocker' public repo",
    status: false,
  },
];

async function getEC2Instance() {
  const params = {
    Filters: [
      {
        Name: "tag:Name",
        Values: ["DevECR"],
      },
      {
        Name: "instance-state-name",
        Values: ["running"],
      },
    ],
    };
    return new Promise((resolve, reject) => {
      ec2.describeInstances(params, function (err, data) {
        err ? reject(err) : resolve(data);
      });
    });
  }

  async function describeECRRepositories() {
    return new Promise((resolve, reject) => {
      ecr.describeRepositories({}, function (err, data) {
        err ? reject(err) : resolve(data);
      });
    })
  }

  async function describeECRImages(repositoryName) {
    return new Promise((resolve, reject) => {
      ecr.describeImages({ repositoryName }, function (err, data) {
        err ? reject(err) : resolve(data);
      });
    })
  }

  async function main() {
    try {
      const ec2InstanceData = await getEC2Instance();
      if (
        ec2InstanceData.Reservations.length > 0 &&
        ec2InstanceData.Reservations[0].Instances[0].PlatformDetails === "Linux/UNIX"
      ) {
        result[0].status = true;
      }

      const ecrReposData = await describeECRRepositories();
      if (
        ecrReposData.repositories &&
        ecrReposData.repositories.some(
          (repo) => repo.repositoryName === "Devdocker"
        )
      ) {
        result[1].status = true;

        const ecrImagesData = await describeECRImages("Devdocker");
        if (ecrImagesData.imageDetails) {
          const imageExists = ecrImagesData.imageDetails.some(
            (image) => image.imageTags && image.imageTags.includes("latest")
          );
          result[2].status = imageExists;
        }
        if (ecrImagesData.imageDetails) {
          const imageExists = ecrImagesData.imageDetails.some(            
            (image) => image.imageTags && image.imageTags.includes("V2")
          );
          result[3].status = imageExists;
        }
      }
    } catch (error) {
      // console.error(error);
    }

    // Update weightage based on test case status
    result[0].weightage = result[0].status ? 0.25 : 0;
    result[1].weightage = result[1].status ? 0.25 : 0;
    result[2].weightage = result[2].status ? 0.25 : 0;
    result[3].weightage = result[3].status ? 0.25 : 0;

    console.log("Result: ", result);
  }

  main();