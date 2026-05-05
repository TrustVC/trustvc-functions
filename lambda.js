import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({});

export const handler = async (event) => {
  try {
    const path = event.path || "/";
    const method = event.httpMethod || "GET";

    if (path === "/" && method === "POST") {
      const body = JSON.parse(event.body || "{}");

      const fileName = body.fileName || `file-${Date.now()}.txt`;
      const content = body.content || "default";

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.TT_AWS_BUCKET_NAME,
          Key: fileName,
          Body: content,
        }),
      );

      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Uploaded", fileName }),
      };
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Not found" }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
