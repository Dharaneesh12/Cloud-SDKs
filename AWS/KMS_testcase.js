// Import the required modules from AWS SDK v3
const { KMSClient, ListAliasesCommand, DescribeKeyCommand, ListKeysCommand } = require('@aws-sdk/client-kms');
const { S3Client, GetBucketEncryptionCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');

// Set the region
const REGION_NAME = 'us-east-1';

let result = [
    { weightage: 0, name: "Alias named as 'Testkey' exists", status: false, error: '' },
    { weightage: 0, name: "Key usage is selected as 'Encrypt and Decrypt'", status: false, error: '' },
    { weightage: 0, name: "S3 bucket 'Testing' uses SSE-KMS under Default encryption", status: false, error: '' },
    { weightage: 0, name: "S3 bucket 'Testing' uses 'Testkey' KMS key", status: false, error: '' },
    { weightage: 0, name: "Object 'sample.txt' exists in 'Testingbucket' bucket", status: false, error: '' }
];

// Create KMS service object
const kms = new KMSClient({ region: REGION_NAME });

// Create S3 service object
const s3 = new S3Client({ region: REGION_NAME });

const validateConditions = async () => {
    try {
        // Check Alias Existence
        const listAliasesResponse = await kms.send(new ListAliasesCommand({}));
        const aliases = listAliasesResponse.Aliases;
        const aliasExists = aliases.some(alias => alias.AliasName === 'alias/Testkey');

        if (aliasExists) {
            result[0].weightage = 0.2;
            result[0].status = true;
        }
    }catch (error) {
        result[0].error = `Error fetching Alias: ${error.message}`;
    }

            // Check Key Types
            try{
            const listKeysResponse = await kms.send(new ListKeysCommand({}));
            const keys = listKeysResponse.Keys;

            for (const key of keys) {
                const keyId = key.KeyId;
                const describeKeyResponse = await kms.send(new DescribeKeyCommand({ KeyId: keyId }));
                const keyUsage = describeKeyResponse.KeyMetadata.KeyUsage;

                if (keyUsage === 'ENCRYPT_DECRYPT') {
                    result[1].weightage = 0.2;
                    result[1].status = true;
                }else{
                    result[1].error = `Key usage is not selected as 'Encrypt and Decrypt'`;
                }
            }
    } catch (error) {
        result[1].error = `Error fetching Key usage: ${error.message}`;
    }

        // Check S3 Bucket Encryption
        try{
        const bucketName = 'Testingbucket';
        const bucketEncryptionResponse = await s3.send(new GetBucketEncryptionCommand({ Bucket: bucketName }));
        const rules = bucketEncryptionResponse.ServerSideEncryptionConfiguration.Rules;

        for (const rule of rules) {
            if (rule.ApplyServerSideEncryptionByDefault.SSEAlgorithm === 'aws:kms') {
                result[2].weightage = 0.2;
                result[2].status = true;

                // Fetch KMSMasterKeyID from the rule
                const kmsMasterKeyID = rule.ApplyServerSideEncryptionByDefault.KMSMasterKeyID;

                // If the KMSMasterKeyID matches the format for an alias
                if (kmsMasterKeyID && kmsMasterKeyID.startsWith('arn:aws:kms:') && kmsMasterKeyID.includes('alias/')) {
                    result[3].weightage = 0.2;
                    result[3].status = true;
                }
            }else{
                result[2].error = `S3 bucket 'Testing' does not use SSE-KMS under Default encryption`;
                result[3].error = `S3 bucket 'Testing' does not use 'Testkey' KMS key`;
            }
        }
    } catch (error) {
        result[2].error = `Error fetching S3 bucket encryption: ${error.message}`;
        result[3].error = `Error fetching KMS key: ${error.message}`;
    }

        // Check Object Existence in S3 Bucket
        try{
        const objectKey = 'sample.txt';
        const objexists = await s3.send(new HeadObjectCommand({ Bucket: bucketName, Key: objectKey }));
        if (objexists) {
        result[4].weightage = 0.2;
        result[4].status = true;
        }else{
            result[4].error = `Object 'sample.txt' does not exist in 'Testingbucket' bucket`;
        }   
    } catch (error) {
        result[4].error = `Error fetching S3 bucket object: ${error.message}`;
        console.error("Error:", error.message);
        return result;
    }
    finally {
        return result;
    }
};

(async () => {
    const validationResults = await validateConditions();
    console.log(validationResults);
    return validationResults;
})();
