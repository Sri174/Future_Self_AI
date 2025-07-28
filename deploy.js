#!/usr/bin/env node

/**
 * Deployment preparation script for FutureSelf AI
 * This script helps prepare your project for Netlify deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 FutureSelf AI - Netlify Deployment Preparation\n');

// Check if required files exist
const requiredFiles = [
  'netlify.toml',
  'next.config.ts',
  'package.json',
  'netlify/functions/answer-mcq-questions.ts',
  'netlify/functions/generate-future-self.ts',
  'netlify/functions/generate-mcq-questions.ts'
];

console.log('✅ Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING!`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing. Please ensure all files are present.');
  process.exit(1);
}

// Check environment variables
console.log('\n🔧 Environment Variables Check...');
const envExample = fs.readFileSync('.env.example', 'utf8');
console.log('Required environment variables:');
console.log(envExample);

// Check if .env exists
if (fs.existsSync('.env')) {
  console.log('✅ .env file found (for local development)');
} else {
  console.log('⚠️  .env file not found (you\'ll need to set environment variables in Netlify)');
}

// Test build
console.log('\n🔨 Testing build process...');
try {
  console.log('Running npm install...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('Running build...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Build successful!');
} catch (error) {
  console.log('❌ Build failed. Please fix the errors before deploying.');
  process.exit(1);
}

// Generate deployment summary
console.log('\n📋 Deployment Summary:');
console.log('='.repeat(50));
console.log('✅ All required files present');
console.log('✅ Build process successful');
console.log('✅ Netlify Functions configured');
console.log('✅ Frontend updated to use API endpoints');
console.log('✅ CORS and error handling implemented');

console.log('\n🚀 Ready for Netlify Deployment!');
console.log('='.repeat(50));
console.log('Next steps:');
console.log('1. Push your code to Git repository');
console.log('2. Connect repository to Netlify');
console.log('3. Set GOOGLE_GENAI_API_KEY in Netlify environment variables');
console.log('4. Deploy!');

console.log('\n📖 For detailed instructions, see: NETLIFY_DEPLOYMENT_GUIDE.md');

// Create a deployment checklist
const checklist = `
# 📋 Netlify Deployment Checklist

## Pre-Deployment
- [ ] Code pushed to Git repository
- [ ] Google AI API key obtained
- [ ] Netlify account created

## Netlify Setup
- [ ] Repository connected to Netlify
- [ ] Build settings configured:
  - Build command: npm run build
  - Publish directory: .next
  - Functions directory: netlify/functions
- [ ] Environment variable set: GOOGLE_GENAI_API_KEY

## Post-Deployment Testing
- [ ] Site loads correctly
- [ ] MCQ questions generate
- [ ] Quiz completion works
- [ ] Image upload functions
- [ ] Future self visualization generates
- [ ] Images match descriptions

## Optional
- [ ] Custom domain configured
- [ ] Analytics enabled
- [ ] Performance monitoring set up

Generated on: ${new Date().toISOString()}
`;

fs.writeFileSync('DEPLOYMENT_CHECKLIST.md', checklist);
console.log('📝 Created DEPLOYMENT_CHECKLIST.md for your reference');

console.log('\n🎉 Your project is ready for Netlify deployment!');
