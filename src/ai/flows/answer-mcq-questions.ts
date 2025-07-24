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
  answers: z.record(z.string(), z.string()).describe('A map of question IDs to answer IDs.'),
});
export type AnswerMCQQuestionsInput = z.infer<typeof AnswerMCQQuestionsInputSchema>;

const AnswerMCQQuestionsOutputSchema = z.object({
  summary: z.string().describe('A summary of the student\'s interests and mindset based on their answers.'),
});
export type AnswerMCQQuestionsOutput = z.infer<typeof AnswerMCQQuestionsOutputSchema>;

export async function answerMCQQuestions(input: AnswerMCQQuestionsInput): Promise<AnswerMCQQuestionsOutput> {
  return answerMCQQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerMCQQuestionsPrompt',
  input: {schema: AnswerMCQQuestionsInputSchema},
  output: {schema: AnswerMCQQuestionsOutputSchema},
  prompt: `You are an AI assistant designed to summarize a student's interests and mindset based on their answers to multiple-choice questions.

  Given the following answers, provide a concise summary of the student's key interests and mindset.

  Answers:
  {{#each answers}}
    - Question: {{@key}}, Answer: {{this}}
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
