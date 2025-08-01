import { Handler } from '@netlify/functions';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY!);

// Helper function to create consistent headers
const createHeaders = (contentType: string = 'application/json') => ({
  'Access-Control-Allow-Origin': '*',
  'Content-Type': contentType
});

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
    const { answers, ageGroup } = JSON.parse(event.body || '{}');

    if (!answers || typeof answers !== 'object') {
      return {
        statusCode: 400,
        headers: createHeaders(),
        body: JSON.stringify({ error: 'Invalid answers format' }),
      };
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1000,
      }
    });

    // Format answers for the prompt
    const formattedAnswers = Object.entries(answers)
      .map(([question, answer]) => `- Question: ${question}\n- Answer: ${answer}`)
      .join('\n');

    const ageContext = ageGroup === '5-10'
      ? 'This is for a young student (5-10 years old). Use simple, encouraging language and suggest age-appropriate career interests that can grow with them.'
      : 'This is for an older student (11-17 years old). Provide more detailed analysis and realistic career suggestions.';

    const professionExamples = ageGroup === '5-10'
      ? 'Teacher, Doctor, Artist, Scientist, Engineer, Veterinarian, Chef, Firefighter'
      : 'Software Developer, Data Scientist, Graphic Designer, Teacher, Doctor, Nurse, Environmental Scientist, Psychologist, Social Worker, Architect, Artist, Musician, Writer, Biologist, Chemist, Marketing Manager';

    const prompt = `You are an expert career counselor and psychologist specializing in student career guidance. Analyze the following questionnaire responses from a student and provide detailed insights.

**Context**: ${ageContext}

Based on the student's answers, generate:
1. **Interests**: A concise summary of the student's key interests and passions. Focus on these categories:
   - STEM/Technology: Programming, engineering, scientific research, data analysis
   - Creative Arts: Visual arts, music, writing, design, entertainment
   - Education/Research: Teaching, academic research, knowledge sharing, learning
   - Healthcare/Social: Medicine, counseling, social work, community service

2. **Mindset**: Describe the student's learning and problem-solving approach:
   - Analytical: Logical, systematic, detail-oriented
   - Creative: Innovative, artistic, imaginative
   - Collaborative: Team-oriented, social, communicative
   - Independent: Self-directed, research-focused, autonomous

3. **Summary**: A compelling narrative about their potential career path and work style.

4. **Suggested Profession**: Based on their interests and mindset, suggest ONE specific profession from these examples: ${professionExamples}. The profession MUST:
   - Match their demonstrated interests from the questionnaire responses
   - Align with their problem-solving and learning style
   - Be clearly visualizable in a professional workplace setting

**Student Age Group**: ${ageGroup || '11-17'} years old

**Student Responses:**
${formattedAnswers}

**CRITICAL REQUIREMENTS:**
- The suggested profession MUST be specific and match the student's strongest interests
- Consider how their answers about subjects, activities, and work environments align
- The profession should be visualizable in a clear workplace setting (office, lab, classroom, studio, etc.)
- Ensure consistency between interests, mindset, and suggested profession

Respond in valid JSON format:
{
  "interests": "string",
  "mindset": "string",
  "summary": "string",
  "suggestedProfession": "string"
}`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Try to parse JSON response, fallback to text parsing if needed
    let parsedResponse;
    try {
      // Remove any markdown formatting
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      parsedResponse = JSON.parse(cleanResponse);
    } catch (parseError) {
      // Fallback: extract information from text response
      parsedResponse = {
        interests: extractField(response, 'interests') || 'Technology, Problem-solving',
        mindset: extractField(response, 'mindset') || 'Growth-oriented',
        summary: extractField(response, 'summary') || 'A motivated individual with diverse interests.',
        suggestedProfession: extractField(response, 'profession') || 'Software Developer'
      };
    }

    // Validate required fields
    if (!parsedResponse.suggestedProfession) {
      parsedResponse.suggestedProfession = 'Software Developer';
    }

    return {
      statusCode: 200,
      headers: createHeaders(),
      body: JSON.stringify(parsedResponse),
    };

  } catch (error) {
    console.error('Error in answer-mcq-questions:', error);
    return {
      statusCode: 500,
      headers: createHeaders(),
      body: JSON.stringify({ error: 'Failed to analyze answers' }),
    };
  }
};

// Helper function to extract fields from text response
function extractField(text: string, field: string): string | null {
  const patterns = [
    new RegExp(`"${field}":\\s*"([^"]+)"`, 'i'),
    new RegExp(`${field}[:\\s]+([^\n]+)`, 'i'),
    new RegExp(`\\*\\*${field}\\*\\*[:\\s]+([^\n]+)`, 'i'),
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}
