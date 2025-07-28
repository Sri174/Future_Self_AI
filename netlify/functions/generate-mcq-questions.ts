import { Handler } from '@netlify/functions';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY!);

export const handler: Handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { topic, numberOfQuestions } = JSON.parse(event.body || '{}');

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2000,
      }
    });

    const prompt = `You are an AI assistant designed to generate multiple-choice questions for career and personality assessment.

Given the topic: ${topic || 'career interests and personality'}, generate ${numberOfQuestions || 10} multiple-choice questions. Each question should have 4-5 options.

The questions should help assess:
1. Career interests and preferences
2. Work style and environment preferences  
3. Problem-solving approaches
4. Learning and growth mindset
5. Values and motivations
6. Communication and collaboration preferences
7. Leadership and responsibility preferences
8. Creativity and innovation approaches
9. Stress management and resilience
10. Long-term goals and aspirations

Format the output as a JSON array of objects, where each object has a "question" field and an "options" field. The "options" field should be an array of strings.

Example format:
[
  {
    "question": "What type of work environment energizes you most?",
    "options": ["Collaborative team settings", "Independent focused work", "Dynamic changing environments", "Structured organized spaces", "Creative open spaces"]
  },
  {
    "question": "When facing a complex problem, what's your preferred approach?",
    "options": ["Break it down into smaller parts", "Brainstorm creative solutions", "Research best practices", "Collaborate with others", "Take time to reflect deeply"]
  }
]

Generate ${numberOfQuestions || 10} diverse questions that will help create a comprehensive personality and career profile.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Try to parse JSON response
    let questions;
    try {
      // Remove any markdown formatting
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      questions = JSON.parse(cleanResponse);
    } catch (parseError) {
      // Fallback: create default questions if parsing fails
      questions = [
        {
          question: "What type of activities do you find most engaging?",
          options: ["Working with technology", "Creating art or designs", "Helping people", "Analyzing data", "Leading teams"]
        },
        {
          question: "How do you prefer to learn new skills?",
          options: ["Hands-on practice", "Reading and research", "Group discussions", "Online courses", "Mentorship"]
        },
        {
          question: "What motivates you most in work?",
          options: ["Making a difference", "Financial success", "Creative expression", "Recognition", "Personal growth"]
        },
        {
          question: "How do you handle challenges?",
          options: ["Face them head-on", "Plan carefully first", "Seek help from others", "Break them into steps", "Find creative solutions"]
        },
        {
          question: "What work environment suits you best?",
          options: ["Office setting", "Outdoor locations", "Home/remote", "Laboratory", "Community spaces"]
        }
      ];
    }

    // Validate the questions array
    if (!Array.isArray(questions)) {
      throw new Error('Invalid questions format');
    }

    // Ensure each question has the required structure
    const validatedQuestions = questions.map((q, index) => ({
      question: q.question || `Question ${index + 1}`,
      options: Array.isArray(q.options) ? q.options : ['Option A', 'Option B', 'Option C', 'Option D']
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ questions: validatedQuestions }),
    };

  } catch (error) {
    console.error('Error in generate-mcq-questions:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Failed to generate questions' }),
    };
  }
};
