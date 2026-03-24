# Migration Notes: Netlify to AWS Lambda

## Completed Changes

### 1. Removed Netlify Dependencies
- Removed `@netlify/functions` from package.json
- Removed `netlify-cli` from devDependencies
- Added `@types/aws-lambda` for AWS Lambda type support

### 2. Updated Node Version
- Updated to Node 22.x in:
  - `package.json` engines field
  - `.nvmrc` file
  - `netlify.toml` (NODE_VERSION = "22")

### 3. Updated Lambda Handler
- Modified `/netlify/functions/storage/index.ts` to use AWS Lambda handler format
- Added proper TypeScript types for `APIGatewayProxyEvent` and `APIGatewayProxyResult`
- Changed Express app path from `/.netlify/functions/storage` to `/storage`

### 4. Updated Router
- Changed cookie path from `/.netlify/functions/storage` to `/storage` in CSRF token route

### 5. Created AWS Deployment Configuration
- Created `template.yaml` with AWS SAM configuration including:
  - Lambda function with Node.js 22.x runtime
  - S3 bucket with 30-day lifecycle policy
  - API Gateway integration
  - IAM roles and policies
  - Environment variables setup

### 6. Updated Documentation
- Updated README.md with:
  - AWS deployment instructions
  - Local development setup
  - Environment variables documentation
  - Removed verify endpoint references

## Manual Steps Required

### 1. Remove Verify Endpoint (Optional)
The verify endpoint files still exist in the codebase:
- `/netlify/functions/verify/index.ts`
- `/netlify/functions/verify/router.ts`

To remove them manually:
```bash
rm -rf netlify/functions/verify
```

### 2. Update Tests
Review and update test files to work with the new AWS Lambda setup:
- `tests/integration/document-storage.test.ts`
- Other test files that may reference Netlify-specific endpoints

### 3. Environment Variables
Set up the following environment variables in AWS Lambda:
- `API_KEY`: Your API key for authentication
- `SESSION_SECRET`: Secret for express-session
- `TT_AWS_BUCKET_NAME`: S3 bucket name (auto-created by SAM template)
- `TT_STORAGE_AWS_ACCESS_KEY_ID`: AWS access key (auto-created by SAM template)
- `TT_STORAGE_AWS_SECRET_ACCESS_KEY`: AWS secret key (auto-created by SAM template)

### 4. Deploy to AWS
Follow the deployment instructions in README.md:
```bash
sam build
sam deploy --guided
```

## Breaking Changes

1. **Endpoint URLs**: The endpoint path changes from `/.netlify/functions/storage` to `/storage`
2. **Hosting Platform**: Moving from Netlify to AWS Lambda + API Gateway
3. **Verify Endpoint**: No longer hosted (removed from deployment)

## Notes

- The S3 service configuration in `/netlify/services/s3/index.ts` already uses AWS SDK and is compatible with AWS Lambda
- All existing middleware (CORS, CSRF, API key validation) remains functional
- The serverless-http package handles the Express to Lambda integration
