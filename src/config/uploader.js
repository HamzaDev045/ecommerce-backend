import S3 from "aws-sdk/clients/s3.js";

export const s3Uploader = () => {
  const accessKeyId = process.env.S3_ACCEESS_KEY;
  const secretAccessKey = process.env.SECRETY_ACCESS_KEY;
  const s3 = new S3({
    region: "us-east-1",
    endpoint: "#",
    accessKeyId,
    secretAccessKey,
  });
  return s3;
};
