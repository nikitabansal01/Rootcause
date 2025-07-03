# Deploying Auvra to Vercel

This guide will help you deploy the Auvra hormone health assessment app to Vercel with data storage capabilities.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Vercel CLI** (optional): `npm i -g vercel`

## Step 1: Set Up Vercel KV Database

1. **Create a Vercel Project**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Add Vercel KV Database**:
   - In your Vercel dashboard, go to "Storage"
   - Click "Create Database"
   - Choose "KV" (Key-Value)
   - Select a region close to your users
   - Note down the connection details

3. **Configure Environment Variables**:
   - In your Vercel project settings, go to "Environment Variables"
   - Add the following variables from your KV database:
     ```
     KV_URL=your_kv_url
     KV_REST_API_URL=your_kv_rest_api_url
     KV_REST_API_TOKEN=your_kv_rest_api_token
     KV_REST_API_READ_ONLY_TOKEN=your_kv_read_only_token
     ```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard
1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect it's a React app
3. The build settings are already configured in `vercel.json`
4. Click "Deploy"

### Option B: Deploy via CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts to link to your project
```

## Step 3: Verify Deployment

1. **Check API Endpoints**:
   - `https://your-app.vercel.app/api/save-response` (POST)
   - `https://your-app.vercel.app/api/save-email` (POST)
   - `https://your-app.vercel.app/api/get-responses` (GET)

2. **Test the App**:
   - Complete a survey
   - Check that data is saved in Vercel KV
   - Test email functionality

## Step 4: Access Saved Data

You can access saved responses and emails via:
- **API**: `GET /api/get-responses`
- **Vercel Dashboard**: Go to Storage → KV → Browse data

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `KV_URL` | Vercel KV connection URL | Yes |
| `KV_REST_API_URL` | KV REST API endpoint | Yes |
| `KV_REST_API_TOKEN` | KV REST API token | Yes |
| `KV_REST_API_READ_ONLY_TOKEN` | KV read-only token | Optional |

## Troubleshooting

### Common Issues:

1. **API Routes Not Working**:
   - Check that environment variables are set correctly
   - Verify KV database is created and connected
   - Check Vercel function logs in dashboard

2. **Build Failures**:
   - Ensure all dependencies are in `package.json`
   - Check that `vercel.json` is configured correctly
   - Verify TypeScript compilation

3. **Data Not Saving**:
   - Check browser console for errors
   - Verify API endpoints are accessible
   - Check KV database permissions

### Debugging:

1. **Check Function Logs**:
   - Go to Vercel Dashboard → Functions
   - Click on function name to see logs

2. **Test API Locally**:
   ```bash
   # Test save response
   curl -X POST https://your-app.vercel.app/api/save-response \
     -H "Content-Type: application/json" \
     -d '{"surveyData":{},"results":{}}'

   # Test get responses
   curl https://your-app.vercel.app/api/get-responses
   ```

## Security Considerations

1. **API Protection**: Consider adding authentication to `/api/get-responses`
2. **Rate Limiting**: Vercel provides basic rate limiting
3. **Data Privacy**: Ensure compliance with data protection regulations
4. **CORS**: Configure CORS if needed for cross-origin requests

## Monitoring

1. **Vercel Analytics**: Enable in project settings
2. **Function Monitoring**: Check function execution times and errors
3. **KV Usage**: Monitor database usage in Vercel dashboard

## Cost Considerations

- **Vercel Hobby Plan**: Free tier includes 100GB-hours of function execution
- **KV Storage**: Free tier includes 256MB storage
- **Bandwidth**: Free tier includes 100GB bandwidth

For production use, consider upgrading to Pro plan for better performance and limits. 