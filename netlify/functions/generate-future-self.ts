import { Handler } from '@netlify/functions';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY!);

// Helper function to create consistent headers
const createHeaders = (contentType: string = 'application/json') => ({
  'Access-Control-Allow-Origin': '*',
  'Content-Type': contentType
});

// Function to create a professional placeholder image
function createPlaceholderImage(profession: string, description: string): string {
  // Create a simple SVG placeholder with profession-specific styling
  const professionColors: { [key: string]: { bg: string; accent: string } } = {
    'Social Worker': { bg: '#e8f5e8', accent: '#4caf50' },
    'Doctor': { bg: '#e3f2fd', accent: '#2196f3' },
    'Teacher': { bg: '#fff3e0', accent: '#ff9800' },
    'Software Developer': { bg: '#f3e5f5', accent: '#9c27b0' },
    'Environmental Scientist': { bg: '#e0f2f1', accent: '#009688' },
    'Artist': { bg: '#fce4ec', accent: '#e91e63' },
    'Engineer': { bg: '#e8eaf6', accent: '#3f51b5' },
    'default': { bg: '#f5f5f5', accent: '#607d8b' }
  };

  const colors = professionColors[profession] || professionColors['default'];

  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.bg};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:0.3" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#grad)" />
      <circle cx="200" cy="120" r="40" fill="${colors.accent}" opacity="0.7" />
      <rect x="160" y="160" width="80" height="100" fill="${colors.accent}" opacity="0.5" rx="5" />
      <text x="200" y="280" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="${colors.accent}">
        Future ${profession}
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
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.8,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 500,
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
      const textResult = await textModel.generateContent(textPrompt);
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

    // For now, let's skip image generation and use placeholder to avoid 500 errors
    console.log('Using placeholder image to avoid API issues');
    generatedImage = createPlaceholderImage(suggestedProfession, futureSelfDescription);

    // Commented out image generation temporarily to debug the 500 error
    /*
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

      console.log('Attempting image generation with Gemini...');

      // For image generation, we need to use a different approach
      const imageResult = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${process.env.GOOGLE_GENAI_API_KEY}`, {
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
            responseModalities: ['TEXT', 'IMAGE'],
            temperature: 0.8,
          }
        })
      });

      if (!imageResult.ok) {
        const errorText = await imageResult.text();
        console.error(`Image generation failed: ${imageResult.status} ${imageResult.statusText}`, errorText);
        throw new Error(`Image generation failed: ${imageResult.status} ${imageResult.statusText}`);
      }

      const imageData = await imageResult.json();

      console.log('Image generation response received');

      // Try to extract image data from response
      if (imageData.candidates && imageData.candidates[0]) {
        const candidate = imageData.candidates[0];
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData) {
              generatedImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
              console.log('Successfully extracted generated image');
              break;
            }
          }
        }
      }

      // If no image was extracted, use placeholder
      if (!generatedImage) {
        console.log('No image extracted, using placeholder');
        generatedImage = createPlaceholderImage(suggestedProfession, futureSelfDescription);
      }
    } catch (imageError) {
      console.error('Image generation failed:', imageError);
      console.log('Creating placeholder image due to error');
      // Create a professional placeholder instead of using original photo
      generatedImage = createPlaceholderImage(suggestedProfession, futureSelfDescription);
    }
    */

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
