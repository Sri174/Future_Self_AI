
'use server';

/**
 * @fileOverview A flow that takes student's answers to multiple-choice questions
 *  and returns a summary of the student's interests and mindset.
 *
 * - answerMCQQuestions - A function that handles the answering of MCQ questions and returns a summary.
 * - AnswerMCQQuestionsInput - The input type for the answerMCQQuestions function.
 * - AnswerMCQQuestionsOutput - The return type for the answerMCQQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerMCQQuestionsInputSchema = z.object({
  answers: z.record(z.string(), z.string()).describe('A map of question texts to answer texts.'),
});
export type AnswerMCQQuestionsInput = z.infer<typeof AnswerMCQQuestionsInputSchema>;

const AnswerMCQQuestionsOutputSchema = z.object({
  interests: z.string().describe("A summary of the student's key interests based on their answers."),
  mindset: z.string().describe("A summary of the student's mindset based on their answers."),
  summary: z.string().describe('A summary of the student\'s interests and mindset based on their answers.'),
  suggestedProfession: z.string().describe("A suggested profession for the student based on their answers."),
});
export type AnswerMCQQuestionsOutput = z.infer<typeof AnswerMCQQuestionsOutputSchema>;

export async function answerMCQQuestions(input: AnswerMCQQuestionsInput): Promise<AnswerMCQQuestionsOutput> {
  return answerMCQQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerMCQQuestionsPrompt',
  input: {schema: AnswerMCQQuestionsInputSchema},
  output: {schema: AnswerMCQQuestionsOutputSchema},
  prompt: `You are an expert psychometric analyst AI. Your task is to analyze a user's answers from a questionnaire to create a detailed personality and career profile.

Based on the answers provided, generate:
1.  **Interests**: A concise summary of the user's key interests and passions. Identify primary themes like Technology, Arts, Humanitarianism, or Logic/Problem-Solving.
2.  **Mindset**: A description of the user's mindset (e.g., Growth, Fixed, Adaptable, Reflective) based on their responses to challenges, failure, and learning.
3.  **Summary**: A holistic summary combining their interests and mindset into a compelling narrative about their potential and work style.
4.  **Suggested Profession**: Based on the interests and mindset, suggest a single, specific profession (e.g., 'Landscape Architect', 'Marine Biologist', 'Software Developer'). This field is required and you MUST provide a profession.

Analyze the following answers:
{{#each answers}}
- Question: {{@key}}
- Answer: {{this}}
{{/each}}
`,
});

const answerMCQQuestionsFlow = ai.defineFlow(
  {
    name: 'answerMCQQuestionsFlow',
    inputSchema: AnswerMCQQuestionsInputSchema,
    outputSchema: AnswerMCQQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
