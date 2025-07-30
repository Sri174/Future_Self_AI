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

export async function POST(request: NextRequest) {
  try {
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
    
    const textResult = await textModel.generateContent(textPrompt);
    let futureSelfDescription = textResult.response.text().trim();

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
        ? `GENERATE AN IMAGE OF A ${suggestedProfession.toUpperCase()} ONLY.

**CRITICAL PROFESSION MATCH**: You MUST generate an image that matches EXACTLY with "${suggestedProfession}".

**Profession-Specific Requirements:**
${getProfessionSpecificPrompt(suggestedProfession)}

**Identity Preservation:** Preserve the person's facial features, ethnicity, and age from the uploaded photo.

**FRAMING REQUIREMENTS:**
- Show the person from waist up or three-quarter body shot
- ENSURE the entire head, face, and neck are completely visible and not cropped
- The person should be centered in the frame with adequate space around the head
- Full face must be clearly visible looking at the camera or slightly angled
- No part of the head should be cut off by the image boundaries

**Quality Requirements:**
- Professional, realistic photograph style
- High-quality, inspiring composition
- Person actively engaged in their ${suggestedProfession} work
- Appropriate professional attire for ${suggestedProfession}
- Confident, successful posture and expression
- Clear, well-lit face with professional lighting

**Description Match:** The image must align with this description: "${futureSelfDescription}"

Generate a photorealistic image of them working as a ${suggestedProfession} in the appropriate environment with their full head and face clearly visible.`
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
            
            2. **Face Visibility:** Show the person's face clearly and professionally. Ensure the entire head, face, and neck are completely visible and not cropped. The person should be looking at the camera or slightly angled with a confident, professional expression.
            
            3. **Authentic Professional Details:** Include ONLY the specific tools, equipment, and activities that someone in ${suggestedProfession} would actually use:
                - **Social Worker**: Files, documents, meeting with clients, community center setting, casual professional attire - NEVER medical equipment
                - **Doctor/Medical**: Stethoscope, medical charts, hospital/clinic setting, medical coat
                - **Teacher**: Books, whiteboard, classroom materials, educational setting
                - **Artist**: Paintbrushes, canvas, art supplies, studio setting
                - **Software Developer**: Computer, coding environment, tech office
                - **Environmental Scientist**: Field equipment, outdoor research tools, nature setting
                - Display appropriate professional attire for the specific field
                - Show them engaged in typical activities of THIS EXACT profession only
            
            4. **Body Representation:** Upper-body shot from waist up showing them actively working. Ensure the entire head and face are completely visible within the frame boundaries with adequate space around the head. No cropping of the head, face, or neck.
            
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
