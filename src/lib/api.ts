// API functions for calling Netlify functions

export interface MCQAnswers {
  [question: string]: string;
}

export interface MCQAnalysisResult {
  interests: string;
  mindset: string;
  summary: string;
  suggestedProfession: string;
}

export interface FutureSelfVisualizationInput {
  photoDataUri?: string | null;
  interests: string;
  mindset: string;
  suggestedProfession: string;
  gender?: 'male' | 'female' | null;
}

export interface FutureSelfVisualizationResult {
  generatedImage: string;
  futureSelfDescription: string;
}

export interface MCQQuestion {
  question: string;
  options: string[];
}

export interface MCQQuestionsResult {
  questions: MCQQuestion[];
}

// Base URL for API calls - will be different in development vs production
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side
    return window.location.origin;
  }
  // Server-side fallback
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
};

// Determine if we're in development or production
const isDevelopment = () => {
  if (typeof window !== 'undefined') {
    // Client-side detection
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  }
  // Server-side detection
  return process.env.NODE_ENV === 'development';
};

export async function answerMCQQuestions(answers: MCQAnswers, ageGroup?: '5-10' | '11-17'): Promise<MCQAnalysisResult> {
  // Use Next.js API routes in development, Netlify functions in production
  const endpoint = isDevelopment()
    ? `${getBaseUrl()}/api/answer-mcq-questions`
    : `${getBaseUrl()}/.netlify/functions/answer-mcq-questions`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ answers, ageGroup }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function generateFutureSelfVisualization(
  input: FutureSelfVisualizationInput
): Promise<FutureSelfVisualizationResult> {
  // Use Next.js API routes in development, Netlify functions in production
  const endpoint = isDevelopment()
    ? `${getBaseUrl()}/api/generate-future-self`
    : `${getBaseUrl()}/.netlify/functions/generate-future-self`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function generateMCQQuestions(
  topic?: string,
  numberOfQuestions?: number
): Promise<MCQQuestionsResult> {
  // Use Next.js API routes in development, Netlify functions in production
  const endpoint = isDevelopment()
    ? `${getBaseUrl()}/api/generate-mcq-questions`
    : `${getBaseUrl()}/.netlify/functions/generate-mcq-questions`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ topic, numberOfQuestions }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Helper function to handle API errors consistently
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}
