import { Handler } from '@netlify/functions';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY!);

// Add retry function at top of file
async function retryWithBackoff(fn: () => Promise<any>, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.message?.includes('503') && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, (i + 1) * 2000));
        continue;
      }
      throw error;
    }
  }
}

// Helper function to create consistent headers
const createHeaders = (contentType: string = 'application/json') => ({
  'Access-Control-Allow-Origin': '*',
  'Content-Type': contentType
});

// Function to create a professional placeholder image
function createPlaceholderImage(profession: string, description: string): string {
  // Create a more sophisticated SVG placeholder with profession-specific styling
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
        AI-Generated Visualization
      </text>
    </svg>
  `;

  // Convert SVG to base64 data URI
  const base64Svg = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64Svg}`;
}

export const handler: Handler = async (event) => {
  // Handle CORS preflight
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
    // Check if API key is available
    if (!process.env.GOOGLE_GENAI_API_KEY) {
      console.error('GOOGLE_GENAI_API_KEY environment variable is not set');
      return {
        statusCode: 500,
        headers: createHeaders(),
        body: JSON.stringify({ error: 'API configuration error' }),
      };
    }

    const { photoDataUri, interests, mindset, suggestedProfession, gender } = JSON.parse(event.body || '{}');

    if (!suggestedProfession) {
      return {
        statusCode: 400,
        headers: createHeaders(),
        body: JSON.stringify({ error: 'suggestedProfession is required' }),
      };
    }

    // Generate text description with profession-specific context
    console.log('Initializing text generation model...');
    const textModel = genAI.getGenerativeModel({
      model: "gemini-1.5-flash", // Fallback to more stable model
      generationConfig: {
        temperature: 0.7, // Reduce temperature
        topP: 0.8,
        topK: 30,
        maxOutputTokens: 300,
      }
    });

    const textPrompt = `You are an expert career counselor and motivational writer. Your task is to create an inspiring, vivid description of a student's future self that perfectly matches their suggested profession and work environment.

**Student Profile:**
- **Interests:** ${interests}
- **Mindset:** ${mindset}
- **Suggested Profession:** ${suggestedProfession}

**Instructions:**
1. **Professional Context:** Write about them actively working in their **${suggestedProfession}** role, describing the specific environment, tools, and activities authentic to this profession.

2. **Environment Alignment:** The description MUST match the professional environment:
   - If "Environmental Scientist" or "Marine Biologist" → Describe them working in nature, field research, outdoor settings
   - If "Landscape Architect" → Describe them working outdoors with design plans, not in an office
   - If "Software Developer" → Office/tech environment is appropriate
   - If "Teacher" → Classroom or educational setting
   - If "Doctor" → Hospital/clinic setting
   - If "Artist" → Studio or creative workspace
   - If "Social Worker" → Community center, helping people in community settings
   - Avoid generic office descriptions unless the profession specifically requires it

3. **Mindset Integration:** Reflect their ${mindset} mindset in how they approach their work and interact with their environment.

4. **Specific Details:** Include profession-specific tools, responsibilities, and achievements that someone in ${suggestedProfession} would actually have.

5. **Inspiring Tone:** Make it motivational and forward-looking, showing them thriving and making an impact in their chosen field.

Write a compelling 2-3 sentence description that vividly portrays them succeeding in their specific professional environment.`;

    console.log('Generating text description...');
    let futureSelfDescription = '';

    try {
      const textResult = await retryWithBackoff(() => textModel.generateContent(textPrompt));
      futureSelfDescription = textResult.response.text().trim();
      console.log('Text description generated successfully');
    } catch (textError) {
      console.error('Text generation failed:', textError);
      // Fallback description
      futureSelfDescription = `Meet your future self as a successful ${suggestedProfession}! You've found your calling in this meaningful career, using your unique talents to make a positive impact. Your dedication and passion shine through as you excel in your role as a ${suggestedProfession}, creating the fulfilling future you've always envisioned.`;
      console.log('Using fallback description');
    }

    // Generate image using Gemini's image generation capabilities
    let generatedImage = '';

    try {
      const imagePromptParts = [];

      if (photoDataUri) {
        // Convert data URI to proper format for Gemini
        imagePromptParts.push({
          inlineData: {
            mimeType: photoDataUri.split(';')[0].split(':')[1],
            data: photoDataUri.split(',')[1]
          }
        });
      }

      const imagePromptText = photoDataUri
        ? `You are an expert AI image generator. Your task is to create a photorealistic, inspiring, and highly-detailed image of a person's future self that perfectly matches their suggested profession and work environment.

        **Analysis Results:**
        - **Interests:** ${interests}
        - **Mindset:** ${mindset}
        - **Suggested Profession:** ${suggestedProfession}

        **Critical Instructions:**
        1. **Preserve Identity:** Meticulously preserve the person's distinct facial features, likeness, ethnicity, and estimated age. The generated person MUST be clearly and unmistakably identifiable as the person in the original photo.

        2. **Professional Environment Match:** Generate a high-fidelity image showing them actively working in their **${suggestedProfession}** role with profession-specific environment:
            - **Social Work/Community roles** (Social Worker, Community Organizer, Counselor): Community center, office with clients, meeting room, or helping people in community settings - NO medical equipment like stethoscopes
            - **Healthcare roles** (Doctor, Nurse, Medical professional): Hospital, clinic, or medical facility with medical equipment like stethoscopes, medical charts
            - **Environmental/Nature roles** (Environmental Scientist, Marine Biologist, Landscape Architect): Show them outdoors in natural settings, field research, with nature-specific tools
            - **Education roles** (Teacher, Professor): Classroom, laboratory, or educational environment with students or educational materials
            - **Creative roles** (Artist, Designer, Architect): Studio, workshop, or creative workspace with art supplies, design tools
            - **Technology roles** (Software Developer, Engineer): Modern office or tech workspace with computers, coding environment
            - **Leadership roles**: Show them in action leading teams or projects in their specific field context

        3. **Authentic Professional Details:** Include ONLY the specific tools, equipment, and activities that someone in ${suggestedProfession} would actually use:
            - **Social Worker**: Files, documents, meeting with clients, community center setting, casual professional attire - NEVER medical equipment
            - **Doctor/Medical**: Stethoscope, medical charts, hospital/clinic setting, medical coat
            - **Teacher**: Books, whiteboard, classroom materials, educational setting
            - **Artist**: Paintbrushes, canvas, art supplies, studio setting
            - **Software Developer**: Computer, coding environment, tech office
            - **Environmental Scientist**: Field equipment, outdoor research tools, nature setting
            - Display appropriate professional attire for the specific field
            - Show them engaged in typical activities of THIS EXACT profession only

        4. **Mindset Reflection:** The overall composition and mood should reflect their ${mindset} mindset through lighting, posture, and environmental elements.

        5. **Leadership and Success:** Show them in a position of competence and leadership within their field, demonstrating expertise and making a positive impact.

        6. **Final Style:** Professional, candid-style photograph that looks realistic and inspiring, clearly showing them thriving in their specific career environment.`
        : `You are an expert AI image generator. Your task is to create a photorealistic, inspiring, and highly-detailed image of a person's future self that perfectly matches their suggested profession and work environment.

            **Analysis Results:**
            - **Interests:** ${interests}
            - **Mindset:** ${mindset}
            - **Suggested Profession:** ${suggestedProfession}
            - **Gender:** ${gender || 'unspecified'}

            **Critical Instructions:**
            1. **Professional Environment Match:** Generate a high-fidelity image showing a ${gender || 'person'} actively working in their **${suggestedProfession}** role with profession-specific environment:
                - **Social Work/Community roles** (Social Worker, Community Organizer, Counselor): Community center, office with clients, meeting room, or helping people in community settings - NO medical equipment like stethoscopes
                - **Healthcare roles** (Doctor, Nurse, Medical professional): Hospital, clinic, or medical facility with medical equipment like stethoscopes, medical charts
                - **Environmental/Nature roles** (Environmental Scientist, Marine Biologist, Landscape Architect): Show them outdoors in natural settings, field research, with nature-specific tools
                - **Education roles** (Teacher, Professor): Classroom, laboratory, or educational environment with students or educational materials
                - **Creative roles** (Artist, Designer, Architect): Studio, workshop, or creative workspace with art supplies, design tools
                - **Technology roles** (Software Developer, Engineer): Modern office or tech workspace with computers, coding environment
                - **Leadership roles**: Show them in action leading teams or projects in their field

            2. **Anonymity:** **DO NOT show the person's face clearly.** Use back view, side profile, or creative angles that conceal facial identity while still showing them engaged in their profession.

            3. **Authentic Professional Details:** Include ONLY the specific tools, equipment, and activities that someone in ${suggestedProfession} would actually use:
                - **Social Worker**: Files, documents, meeting with clients, community center setting, casual professional attire - NEVER medical equipment
                - **Doctor/Medical**: Stethoscope, medical charts, hospital/clinic setting, medical coat
                - **Teacher**: Books, whiteboard, classroom materials, educational setting
                - **Artist**: Paintbrushes, canvas, art supplies, studio setting
                - **Software Developer**: Computer, coding environment, tech office
                - **Environmental Scientist**: Field equipment, outdoor research tools, nature setting
                - Display appropriate professional attire for the specific field
                - Show them engaged in typical activities of THIS EXACT profession only

            4. **Body Representation:** Full-body or upper-body shot showing them actively working, not just abstract elements or distant figures.

            5. **Mindset Reflection:** The overall composition and mood should reflect their ${mindset} mindset through lighting, posture, and environmental elements.

            6. **Leadership and Success:** Show them in a position of competence and leadership within their field, demonstrating expertise and making a positive impact.

            7. **Final Style:** Professional, candid-style photograph that looks realistic and inspiring, clearly showing them thriving in their specific career environment.`;

      imagePromptParts.push({ text: imagePromptText });

      console.log('🎨 Attempting AI image generation with Gemini...');

      // Try the image generation API with better error handling
      const imageResult = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GOOGLE_GENAI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: imagePromptParts
          }],
          generationConfig: {
            temperature: 0.8,
            topP: 0.9,
            maxOutputTokens: 4096,
          }
        })
      });

      if (!imageResult.ok) {
        const errorText = await imageResult.text();
        console.error(`❌ Image generation failed: ${imageResult.status} ${imageResult.statusText}`, errorText);

        // Try alternative approach with different model
        try {
          console.log('🔄 Trying alternative image generation approach...');

          const fallbackResult = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_GENAI_API_KEY}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                role: 'user',
                parts: [{ text: `Generate a professional image of a ${suggestedProfession} at work. Show them in their typical work environment with profession-specific tools and setting. Make it realistic and inspiring.` }]
              }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
              }
            })
          });

          if (fallbackResult.ok) {
            const fallbackData = await fallbackResult.json();
            if (fallbackData.candidates && fallbackData.candidates[0]) {
              const candidate = fallbackData.candidates[0];
              if (candidate.content && candidate.content.parts) {
                for (const part of candidate.content.parts) {
                  if (part.inlineData) {
                    generatedImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    console.log('✅ Fallback AI image generated successfully!');
                    break;
                  }
                }
              }
            }
          }
        } catch (fallbackError) {
          console.log('❌ Fallback image generation also failed');
        }

        // If still no image, use placeholder
        if (!generatedImage) {
          console.log('📋 Using enhanced placeholder as final fallback');
          generatedImage = createPlaceholderImage(suggestedProfession, futureSelfDescription);
        }
      } else {

        const imageData = await imageResult.json();

        console.log('📥 Image generation response received');

        // Try to extract image data from response
        if (imageData.candidates && imageData.candidates[0]) {
          const candidate = imageData.candidates[0];
          if (candidate.content && candidate.content.parts) {
            for (const part of candidate.content.parts) {
              if (part.inlineData) {
                generatedImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                console.log('✅ Successfully extracted AI-generated image!');
                break;
              }
            }
          }
        }

        // If no image was extracted, use placeholder
        if (!generatedImage) {
          console.log('⚠️ No image extracted from response, using placeholder');
          generatedImage = createPlaceholderImage(suggestedProfession, futureSelfDescription);
        }
      }
    } catch (imageError) {
      console.error('Image generation failed:', imageError);
      console.log('Creating placeholder image due to error');
      // Create a professional placeholder instead of using original photo
      generatedImage = createPlaceholderImage(suggestedProfession, futureSelfDescription);
    }

    return {
      statusCode: 200,
      headers: createHeaders(),
      body: JSON.stringify({
        generatedImage,
        futureSelfDescription
      }),
    };

  } catch (error) {
    console.error('Error in generate-future-self:', error);
    return {
      statusCode: 500,
      headers: createHeaders(),
      body: JSON.stringify({ error: 'Failed to generate future self visualization' }),
    };
  }
};

