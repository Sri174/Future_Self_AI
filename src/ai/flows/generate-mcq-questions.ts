'use server';

/**
 * @fileOverview A flow that generates multiple-choice questions based on the
 *  student's interests and mindset to collect information for future self visualization.
 *
 * - generateMCQQuestions - A function that handles the generation of MCQ questions.
 * - GenerateMCQQuestionsInput - The input type for the generateMCQQuestions function.
 * - GenerateMCQQuestionsOutput - The return type for the generateMCQQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMCQQuestionsInputSchema = z.object({
  topic: z.string().describe('The topic for the multiple-choice questions.'),
  numberOfQuestions: z
    .number()
    .describe('The number of multiple-choice questions to generate.'),
});
export type GenerateMCQQuestionsInput = z.infer<
  typeof GenerateMCQQuestionsInputSchema
>;

const GenerateMCQQuestionsOutputSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe('The multiple-choice question.'),
      options: z.array(z.string()).describe('The options for the question.'),
    })
  ).describe('An array of multiple-choice questions and their options.'),
});
export type GenerateMCQQuestionsOutput = z.infer<
  typeof GenerateMCQQuestionsOutputSchema
>;

export async function generateMCQQuestions(
  input: GenerateMCQQuestionsInput
): Promise<GenerateMCQQuestionsOutput> {
  return generateMCQQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMCQQuestionsPrompt',
  input: {schema: GenerateMCQQuestionsInputSchema},
  output: {schema: GenerateMCQQuestionsOutputSchema},
  prompt: `You are an AI assistant designed to generate multiple-choice questions on a given topic.

  Given the topic: {{{topic}}}, generate {{{numberOfQuestions}}} multiple-choice questions. Each question should have 4-5 options.

  Format the output as a JSON array of objects, where each object has a "question" field and an "options" field. The "options" field should be an array of strings.

  Example:
  [
    {
      "question": "What are you most passionate about?",
      "options": ["Technology", "Arts", "Science", "Sports"]
    },
    {
      "question": "What kind of mindset do you have?",
      "options": ["Growth", "Fixed", "Positive", "Negative"]
    }
  ]
  `,
});

const generateMCQQuestionsFlow = ai.defineFlow(
  {
    name: 'generateMCQQuestionsFlow',
    inputSchema: GenerateMCQQuestionsInputSchema,
    outputSchema: GenerateMCQQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
