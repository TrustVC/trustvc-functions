# Trustvc functions

API endpoints for document storage using AWS Lambda and S3.

## ⚠️ Reminder

The following API endpoints are references on how you would implement such microservices for your own business requirements. They are NOT to be relied on, for any of your production related needs. We reserve the right to change or shutdown the API anytime.

> There is a limit of `6mb` on maximum request body size. Revising your OpenAttestation document file size might help if you encounter 413 `Payload Too Large` errors.

---

## Prerequisites

- Node.js 22.x or higher
- AWS Account
- AWS SAM CLI (for deployment)

---

### Document storage

Endpoint: `https://<your-api-gateway-url>/storage`

POST

- `/storage` uploads an encrypted OpenAttestation document
- `/storage/:id` uploads an encrypted OpenAttestation document with decrypt key from `/storage/queue`

```
// POST data example
{
  "document": {
    "version": "https://schema.openattestation.com/2.0/schema.json",
    "network: {
      "chain": "9a09ae01-f16a-466d-ad66-b42e6b07e225:string:ETH",
      "chainId": "19ca73ed-e2cf-43ac-b104-3c43d2fc0680:string:5"
    },
    ...rest
  }
}
```

> Document storage endpoint requires `network.chainId` field in OA document.

> The uploaded encrypted OpenAttestation documents will not be stored long term. They will be auto deleted after 30 days.

GET

- `/storage/:id` returns an encrypted OpenAttestation document
- `/storage/queue` returns id and generated decrypt key

---

## Development

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Start local development server with S3:
```bash
npm run start
```

This will start:
- Local S3 server (s3rver) on port 4568
- Lambda function locally

### Environment Variables

Required environment variables:

- `API_KEY`: API key for authentication
- `SESSION_SECRET`: Secret for express-session
- `TT_AWS_BUCKET_NAME`: S3 bucket name for document storage
- `TT_STORAGE_AWS_ACCESS_KEY_ID`: AWS access key ID for S3
- `TT_STORAGE_AWS_SECRET_ACCESS_KEY`: AWS secret access key for S3

For local development, the dummy value in `API_KEY` should work.

## Deployment

### Deploy to AWS using SAM

1. Install AWS SAM CLI: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html

2. Build the application:
```bash
sam build
```

3. Deploy the application:
```bash
sam deploy --guided
```

During the guided deployment, you'll be prompted for:
- Stack name
- AWS Region
- API Key (for authentication)
- Session Secret

4. After deployment, SAM will output the API Gateway endpoint URL.

### Manual Deployment

Alternatively, you can deploy using AWS Lambda and API Gateway manually:

1. Build the TypeScript code
2. Package the `netlify/functions/storage` directory with `node_modules`
3. Create a Lambda function with Node.js 22.x runtime
4. Set up API Gateway with proxy integration
5. Configure environment variables
6. Create an S3 bucket with 30-day lifecycle policy

## Testing

Run tests:
```bash
npm test
```

Run tests with CI (includes local S3 and function server):
```bash
npm run test:ci
```
