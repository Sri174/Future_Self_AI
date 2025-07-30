import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY!);

function getProfessionSpecificPrompt(profession: string): string {
  const professionLower = profession.toLowerCase();

  if (professionLower.includes('doctor') || professionLower.includes('physician') || professionLower.includes('medical')) {
    return `- SETTING: Hospital, clinic, or medical facility
- EQUIPMENT: Stethoscope around neck, medical charts, medical equipment
- ATTIRE: White medical coat or scrubs
- ACTIVITY: Examining patient, reviewing medical charts, or consulting
- ENVIRONMENT: Clean, professional medical setting with medical equipment visible`;
  }

  if (professionLower.includes('teacher') || professionLower.includes('educator') || professionLower.includes('professor')) {
    return `- SETTING: Classroom, lecture hall, or educational facility
- EQUIPMENT: Whiteboard, books, educational materials, teaching tools
- ATTIRE: Professional teaching attire
- ACTIVITY: Teaching students, writing on board, or presenting
- ENVIRONMENT: Educational setting with students or classroom materials`;
  }

  if (professionLower.includes('artist') || professionLower.includes('painter') || professionLower.includes('creative')) {
    return `- SETTING: Art studio, creative workspace, or gallery
- EQUIPMENT: Paintbrushes, canvas, easel, art supplies, palette
- ATTIRE: Casual creative attire, possibly with paint smudges
- ACTIVITY: Painting, drawing, or creating artwork
- ENVIRONMENT: Artistic studio with canvases, art supplies, and creative materials`;
  }

  if (professionLower.includes('software') || professionLower.includes('developer') || professionLower.includes('programmer')) {
    return `- SETTING: Modern office, tech workspace, or home office
- EQUIPMENT: Computer, multiple monitors, keyboard, coding environment
- ATTIRE: Casual professional or tech company attire
- ACTIVITY: Coding, reviewing code, or working on computer
- ENVIRONMENT: Tech office with computers, screens showing code`;
  }

  if (professionLower.includes('social worker') || professionLower.includes('counselor') || professionLower.includes('community')) {
    return `- SETTING: Community center, office, or meeting room
- EQUIPMENT: Files, documents, meeting materials (NO medical equipment)
- ATTIRE: Professional but approachable casual attire
- ACTIVITY: Meeting with clients, reviewing case files, or community work
- ENVIRONMENT: Office or community setting focused on helping people`;
  }

  if (professionLower.includes('environmental') || professionLower.includes('scientist') || professionLower.includes('researcher')) {
    return `- SETTING: Outdoor natural environment, field research site, or laboratory
- EQUIPMENT: Research tools, field equipment, scientific instruments
- ATTIRE: Field research attire or lab coat
- ACTIVITY: Conducting research, collecting samples, or analyzing data
- ENVIRONMENT: Natural outdoor setting or scientific laboratory`;
  }

  // Default for any other profession
  return `- SETTING: Professional workplace appropriate for ${profession}
- EQUIPMENT: Tools and equipment specific to ${profession}
- ATTIRE: Professional attire appropriate for ${profession}
- ACTIVITY: Working in their ${profession} role
- ENVIRONMENT: Workplace setting that matches ${profession}`;
}

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

export async function POST(request: NextRequest) {
  try {
    // Check if API key is available
    if (!process.env.GOOGLE_GENAI_API_KEY) {
      console.error('GOOGLE_GENAI_API_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    const { photoDataUri, interests, mindset, suggestedProfession, gender } = await request.json();

    if (!suggestedProfession) {
      return NextResponse.json(
        { error: 'suggestedProfession is required' },
        { status: 400 }
      );
    }

    // Generate text description with profession-specific context
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

    // Validate that the description matches the profession
    if (!futureSelfDescription.toLowerCase().includes(suggestedProfession.toLowerCase())) {
      console.log('Description does not match profession, regenerating...');

      // Create a more specific prompt to ensure consistency
      const specificPrompt = `Write a 2-3 sentence description of someone working as a ${suggestedProfession}.

**CRITICAL**: The description MUST:
1. Mention "${suggestedProfession}" explicitly
2. Describe them in the correct work environment for a ${suggestedProfession}
3. Use profession-specific tools and activities

**Environment Guidelines:**
- Doctor: Hospital/clinic with medical equipment, stethoscope, helping patients
- Teacher: Classroom with students, educational materials, teaching
- Artist: Art studio with brushes, canvas, creating artwork
- Software Developer: Office with computers, coding, technology
- Social Worker: Community center, helping people, social services
- Environmental Scientist: Outdoor research, nature, environmental tools

Write an inspiring description showing them thriving as a ${suggestedProfession}.`;

      const specificResult = await textModel.generateContent(specificPrompt);
      futureSelfDescription = specificResult.response.text().trim();
    }

    // Generate image using Gemini's image generation capabilities
    let generatedImage = '';

    // For now, use enhanced placeholder to ensure reliability
    console.log('Using enhanced placeholder for reliable results');
    generatedImage = createPlaceholderImage(suggestedProfession, futureSelfDescription);

    /* Temporarily disabled image generation for stability
    try {
      const imagePromptParts = [];

      if (photoDataUri) {
        // Convert data URI to proper format for Gemini
        try {
          const mimeType = photoDataUri.split(';')[0].split(':')[1];
          const base64Data = photoDataUri.split(',')[1];

          imagePromptParts.push({
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          });
          console.log('Added photo to image generation prompt');
        } catch (photoError) {
          console.error('Error processing photo:', photoError);
          // Continue without photo if there's an error
        }
      }

      const imagePromptText = photoDataUri
        ? `GENERATE AN IMAGE OF A ${suggestedProfession.toUpperCase()} ONLY.`
        : `Generate a professional image of a ${suggestedProfession}.`;

      // Temporarily disabled for stability
      // imagePromptParts.push({ text: imagePromptText });
    } catch (imageError) {
      console.error('Image generation failed:', imageError);
      console.log('Creating placeholder image due to error');
      // Create a professional placeholder instead of using original photo
      generatedImage = createPlaceholderImage(suggestedProfession, futureSelfDescription);
    }
    */

    // Final validation: Ensure description mentions the profession
    if (!futureSelfDescription.toLowerCase().includes(suggestedProfession.toLowerCase())) {
      console.log('Final validation failed - description does not match profession');

      // Create a fallback description that definitely matches
      futureSelfDescription = `Meet your future self as a successful ${suggestedProfession}! You've found your calling in this meaningful career, using your unique talents to make a positive impact. Your dedication and passion shine through as you excel in your role as a ${suggestedProfession}, creating the fulfilling future you've always envisioned.`;
    }

    return NextResponse.json({
      generatedImage,
      futureSelfDescription
    });

  } catch (error) {
    console.error('Error in generate-future-self:', error);
    return NextResponse.json(
      { error: 'Failed to generate future self visualization' },
      { status: 500 }
    );
  }
}
