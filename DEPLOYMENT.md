# FutureSelf AI - Netlify Deployment Guide

This guide will help you deploy the FutureSelf AI application to Netlify with all the necessary configurations.

## Prerequisites

1. A Netlify account
2. A Google AI API key (for Gemini models)
3. Git repository with your code

## Environment Variables

You need to set the following environment variable in your Netlify dashboard:

### Required Environment Variables

- `GOOGLE_GENAI_API_KEY`: Your Google AI API key for accessing Gemini models

### Setting Environment Variables in Netlify

1. Go to your Netlify dashboard
2. Select your site
3. Go to Site settings > Environment variables
4. Add the following variables:
   - Key: `GOOGLE_GENAI_API_KEY`
   - Value: Your Google AI API key

## Deployment Steps

### Option 1: Deploy from Git Repository

1. **Connect your repository to Netlify:**
   - Go to Netlify dashboard
   - Click "New site from Git"
   - Choose your Git provider (GitHub, GitLab, etc.)
   - Select your repository

2. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Functions directory: `netlify/functions`

3. **Deploy:**
   - Click "Deploy site"
   - Netlify will automatically build and deploy your site

### Option 2: Manual Deploy

1. **Build the project locally:**
   ```bash
   npm install
   npm run build
   ```

2. **Deploy to Netlify:**
   - Zip the entire project folder
   - Go to Netlify dashboard
   - Drag and drop the zip file to deploy

## Build Configuration

The project includes the following configuration files:

### netlify.toml
```toml
[build]
  command = "npm run build"
  functions = "netlify/functions"
  publish = ".next"

[build.environment]
  NEXT_PRIVATE_TARGET = "server"
  NODE_VERSION = "18"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  node_bundler = "esbuild"
```

### next.config.ts
The Next.js configuration is optimized for Netlify deployment with:
- Standalone output mode
- Image optimization disabled for better compatibility
- External package handling for Genkit

## API Endpoints

The application uses Netlify Functions for the following endpoints:

- `/.netlify/functions/answer-mcq-questions` - Analyzes MCQ answers
- `/.netlify/functions/generate-future-self` - Generates future self visualization
- `/.netlify/functions/generate-mcq-questions` - Generates MCQ questions

## Troubleshooting

### Common Issues

1. **Build fails with TypeScript errors:**
   - The config ignores TypeScript errors during build
   - Check your code for syntax errors

2. **Functions not working:**
   - Ensure environment variables are set correctly
   - Check function logs in Netlify dashboard

3. **Image generation fails:**
   - Verify your Google AI API key has access to image generation models
   - Check the function logs for specific error messages

4. **CORS issues:**
   - The functions include CORS headers
   - Ensure you're calling the correct function URLs

### Debugging

1. **Check build logs:**
   - Go to Netlify dashboard > Deploys
   - Click on a deploy to see build logs

2. **Check function logs:**
   - Go to Netlify dashboard > Functions
   - Click on a function to see execution logs

3. **Test functions locally:**
   ```bash
   netlify dev
   ```

## Performance Optimization

The application is optimized for Netlify with:

- Static generation where possible
- Optimized bundle splitting
- Efficient function cold starts
- Image optimization disabled for compatibility

## Security

- Environment variables are securely stored in Netlify
- API keys are not exposed to the client
- Functions include proper error handling
- CORS is configured for security

## Monitoring

Monitor your deployment through:

- Netlify Analytics (if enabled)
- Function execution logs
- Build logs
- Performance metrics in Netlify dashboard

## Support

If you encounter issues:

1. Check the Netlify documentation
2. Review function logs for errors
3. Ensure all environment variables are set correctly
4. Test the application locally with `netlify dev`
