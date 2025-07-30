import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY!);

function createPlaceholderImage(profession: string): string {
  const professionData: { [key: string]: { bg: string; accent: string; icon: string } } = {
    'Social Worker': { bg: '#e8f5e8', accent: '#4caf50', icon: '👥' },
    'Doctor': { bg: '#e3f2fd', accent: '#2196f3', icon: '🩺' },
    'Teacher': { bg: '#fff3e0', accent: '#ff9800', icon: '📚' },
    'Software Developer': { bg: '#f3e5f5', accent: '#9c27b0', icon: '💻' },
    'Environmental Scientist': { bg: '#e0f2f1', accent: '#009688', icon: '🌱' },
    'Artist': { bg: '#fce4ec', accent: '#e91e63', icon: '🎨' },
    'Fashion Designer': { bg: '#f8e6ff', accent: '#8e24aa', icon: '✂️' },
    'Engineer': { bg: '#e8eaf6', accent: '#3f51b5', icon: '⚙️' },
    'Scientist': { bg: '#e1f5fe', accent: '#0277bd', icon: '🔬' },
    'default': { bg: '#f5f5f5', accent: '#607d8b', icon: '💼' }
  };

  const data = professionData[profession] || professionData['default'];

  const svg = `
    <svg width="512" height="384" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${data.bg};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${data.accent};stop-opacity:0.2" />
        </linearGradient>
        <linearGradient id="personGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${data.accent};stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:${data.accent};stop-opacity:0.6" />
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="512" height="384" fill="url(#bgGrad)" />

      <!-- Professional figure -->
      <circle cx="256" cy="140" r="45" fill="url(#personGrad)" />
      <rect x="211" y="185" width="90" height="120" fill="url(#personGrad)" rx="8" />

      <!-- Professional icon -->
      <circle cx="320" cy="120" r="25" fill="${data.accent}" opacity="0.9" />
      <text x="320" y="130" text-anchor="middle" font-size="20" fill="white">${data.icon}</text>

      <!-- Title -->
      <text x="256" y="340" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="${data.accent}">
        Your Future as a ${profession}
      </text>

      <!-- Subtitle -->
      <text x="256" y="365" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="${data.accent}" opacity="0.8">
        Professional Visualization
      </text>
    </svg>
  `;

  const base64Svg = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64Svg}`;
}

export async function POST(request: NextRequest) {
  try {
    const { interests, mindset, suggestedProfession, gender } = await request.json();

    if (!suggestedProfession) {
      return NextResponse.json(
        { error: 'suggestedProfession is required' },
        { status: 400 }
      );
    }

    console.log('⚡ Generating future self for profession:', suggestedProfession);

    // Set overall timeout for the entire request
    const requestTimeout = setTimeout(() => {
      console.log('⏰ Request timeout reached, using fallback response');
    }, 25000);

    // Generate actual AI image
    let generatedImage = '';

    try {
      console.log('🎨 Starting AI image generation...');

      // Set a timeout for the entire image generation process
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Image generation timeout')), 15000)
      );

      const imageGenerationPromise = async () => {
        const imageModel = genAI.getGenerativeModel({
          model: "gemini-2.0-flash-exp",
          generationConfig: {
            temperature: 0.8,
            topP: 0.9,
            maxOutputTokens: 4096,
          }
        });

        const imagePrompt = `Create a professional, high-quality photograph of a successful ${suggestedProfession} at work.

Key requirements:
- Show a confident, professional person working as a ${suggestedProfession}
- Include realistic work environment and tools specific to ${suggestedProfession}
- Professional lighting and composition
- Person should look successful and engaged in their work
- High resolution, photorealistic style

Context: This person is interested in ${interests} and has a ${mindset} mindset.

Generate a realistic professional photograph.`;

        console.log('📤 Sending image generation request...');
        return await imageModel.generateContent([imagePrompt]);
      };

      const result = await Promise.race([imageGenerationPromise(), timeoutPromise]) as any;

      if (result.response && result.response.candidates && result.response.candidates[0]) {
        const candidate = result.response.candidates[0];

        // Check for image data in the response
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData && part.inlineData.data) {
              generatedImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
              console.log('✅ AI image generated successfully!');
              break;
            }
          }
        }

        // If no inline data, check if there's text that might contain image info
        if (!generatedImage && candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.text && part.text.includes('data:image')) {
              generatedImage = part.text.match(/data:image[^"'\s]*/)?.[0] || '';
              if (generatedImage) {
                console.log('✅ AI image extracted from text response!');
                break;
              }
            }
          }
        }
      }

      if (!generatedImage) {
        console.log('⚠️ No image data found in AI response, trying alternative approach...');
        throw new Error('No image data in response');
      }

    } catch (imageError: any) {
      console.log('❌ AI image generation failed:', imageError.message);

      // Fallback: Try a different model or approach
      try {
        console.log('🔄 Trying alternative image generation...');

        const fallbackModel = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        });

        const simplePrompt = `Generate an image of a professional ${suggestedProfession} at work.`;
        const fallbackResult = await fallbackModel.generateContent([simplePrompt]);

        if (fallbackResult.response && fallbackResult.response.candidates && fallbackResult.response.candidates[0]) {
          const candidate = fallbackResult.response.candidates[0];
          if (candidate.content && candidate.content.parts) {
            for (const part of candidate.content.parts) {
              if (part.inlineData && part.inlineData.data) {
                generatedImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                console.log('✅ Fallback AI image generated successfully!');
                break;
              }
            }
          }
        }

        if (!generatedImage) {
          throw new Error('Fallback image generation also failed');
        }

      } catch (fallbackError: any) {
        console.log('❌ All image generation attempts failed:', fallbackError.message);
        // Only use placeholder as last resort
        generatedImage = createPlaceholderImage(suggestedProfession);
      }
    }

    // Create description
    let futureSelfDescription = `Meet your future self as a successful ${suggestedProfession}! You've found your calling in this meaningful career, using your unique talents to make a positive impact. Your dedication and passion shine through as you excel in your role as a ${suggestedProfession}, creating the fulfilling future you've always envisioned.`;

    // Generate enhanced description with AI
    try {
      console.log('📝 Generating AI description...');

      // Set timeout for text generation
      const textTimeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Text generation timeout')), 10000)
      );

      const textGenerationPromise = async () => {
        const textModel = genAI.getGenerativeModel({
          model: "gemini-2.0-flash-exp",
          generationConfig: {
            temperature: 0.8,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 300,
          }
        });

        const textPrompt = `Write a compelling, inspiring 2-3 sentence description of someone's future self working as a ${suggestedProfession}.

        Context:
        - Interests: ${interests}
        - Mindset: ${mindset}
        - Target Profession: ${suggestedProfession}
        - Gender: ${gender || 'unspecified'}

        Make it personal, inspiring, and specific to the ${suggestedProfession} profession. Focus on their success and fulfillment.`;

        return await textModel.generateContent(textPrompt);
      };

      const textResult = await Promise.race([textGenerationPromise(), textTimeoutPromise]) as any;
      const enhancedDescription = textResult.response.text().trim();

      if (enhancedDescription && enhancedDescription.length > 50) {
        futureSelfDescription = enhancedDescription;
        console.log('✅ AI description generated successfully!');
      } else {
        console.log('⚠️ AI description too short, using fallback');
      }

    } catch (textError: any) {
      console.log('❌ AI text generation failed:', textError.message);
    }

    // Clear the timeout
    clearTimeout(requestTimeout);

    console.log('✅ Successfully generated future self visualization');

    return NextResponse.json({
      generatedImage,
      futureSelfDescription
    });

  } catch (error) {
    console.error('❌ Error in generate-future-self:', error);

    // Always return a successful response with fallback content
    const fallbackProfession = 'Professional';
    const fallbackDescription = "Meet your future self as a successful professional! You've found your calling in this meaningful career, using your unique talents to make a positive impact.";

    console.log('🔄 Returning fallback response to prevent timeout');

    return NextResponse.json({
      generatedImage: createPlaceholderImage(fallbackProfession),
      futureSelfDescription: fallbackDescription
    }, { status: 200 }); // Always return 200, never 500
  }
}
