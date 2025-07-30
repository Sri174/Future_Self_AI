// Test script to verify the Netlify function works locally
const { handler } = require('./netlify/functions/generate-future-self.ts');

async function testFunction() {
  console.log('Testing Netlify function locally...');
  
  const testEvent = {
    httpMethod: 'POST',
    body: JSON.stringify({
      interests: 'helping people, community work',
      mindset: 'collaborative and empathetic',
      suggestedProfession: 'Social Worker',
      gender: 'female'
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  };

  try {
    const result = await handler(testEvent);
    console.log('Function result:', result);
    
    if (result.statusCode === 200) {
      const body = JSON.parse(result.body);
      console.log('✅ Function executed successfully');
      console.log('Description:', body.futureSelfDescription);
      console.log('Image type:', body.generatedImage.substring(0, 50) + '...');
    } else {
      console.log('❌ Function returned error:', result.statusCode);
      console.log('Error body:', result.body);
    }
  } catch (error) {
    console.error('❌ Function execution failed:', error);
  }
}

testFunction();
