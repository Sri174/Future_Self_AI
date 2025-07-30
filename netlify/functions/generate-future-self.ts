import { Handler } from '@netlify/functions';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Ensure API key is defined
const API_KEY = process.env.GOOGLE_GENAI_API_KEY;
if (!API_KEY) throw new Error("Missing GOOGLE_GENAI_API_KEY in environment variables.");

const genAI = new GoogleGenerativeAI(API_KEY);

// Helper for response headers
const createHeaders = (contentType: string = 'application/json') => ({
  'Access-Control-Allow-Origin': '*',
  'Content-Type': contentType
});

// Placeholder image for fallback
function createPlaceholderImage(profession: string): string {
  const colors = {
    Doctor: ['#e3f2fd', '#2196f3'],
    Teacher: ['#fff3e0', '#ff9800'],
    Artist: ['#fce4ec', '#e91e63'],
    Engineer: ['#e8eaf6', '#3f51b5'],
    Developer: ['#f3e5f5', '#9c27b0'],
    Scientist: ['#e0f2f1', '#009688'],
    default: ['#f5f5f5', '#607d8b'],
  }[profession] || ['#f5f5f5', '#607d8b'];

  const [bg, accent] = colors;

  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bg}" />
          <stop offset="100%" stop-color="${accent}" stop-opacity="0.3" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#grad)" />
      <circle cx="200" cy="120" r="40" fill="${accent}" opacity="0.7" />
      <rect x="160" y="160" width="80" height="100" fill="${accent}" opacity="0.5" rx="5" />
      <text x="200" y="280" text-anchor="middle" font-size="16" fill="${accent}" font-family="Arial" font-weight="bold">
        Future ${profession}
      </text>
    </svg>
  `;

  const base64Svg = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64Svg}`;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'text/plain'
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: createHeaders(),
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { photoDataUri, interests, mindset, suggestedProfession, gender } = JSON.parse(event.body || '{}');

    if (!suggestedProfession) {
      return {
        statusCode: 400,
        headers: createHeaders(),
        body: JSON.stringify({ error: 'suggestedProfession is required' }),
      };
    }

    const textModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const textPrompt = `
Write a 2-3 sentence inspiring future-self description for a student with:
- Profession: ${suggestedProfession}
- Interests: ${interests}
- Mindset: ${mindset}

Describe them thriving in their profession-specific environment with realistic tools and activities. Use an uplifting, motivational tone.
    `.trim();

    const textResponse = await textModel.generateContent(textPrompt);
    const futureSelfDescription = textResponse.response.text().trim();

    let generatedImage = '';

    try {
      const imagePrompt = `
Generate a realistic image of a ${gender || 'person'} thriving as a ${suggestedProfession}. They are actively working in a realistic environment suited for that profession, using relevant tools. Show success and confidence, but avoid showing their face. Keep it photo-like and professional.
      `.trim();

      const imageRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: imagePrompt }]
          }],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
            temperature: 0.8,
          }
        }),
      });

      if (!imageRes.ok) throw new Error(`Image fetch failed: ${imageRes.status}`);

      const imageJson = await imageRes.json();

      const candidate = imageJson?.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (candidate?.inlineData) {
        generatedImage = `data:${candidate.inlineData.mimeType};base64,${candidate.inlineData.data}`;
      } else {
        console.warn('Image data not found, using placeholder');
        generatedImage = createPlaceholderImage(suggestedProfession);
      }
    } catch (imageError) {
      console.error('Image generation error:', imageError);
      generatedImage = createPlaceholderImage(suggestedProfession);
    }

    return {
      statusCode: 200,
      headers: createHeaders(),
      body: JSON.stringify({
        futureSelfDescription,
        generatedImage
      }),
    };

  } catch (error) {
    console.error('Unhandled error:', error);
    return {
      statusCode: 500,
      headers: createHeaders(),
      body: JSON.stringify({ error: 'Failed to generate future self visualization' }),
    };
  }
};
