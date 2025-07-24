// Implemented the flow for generating a future self visualization based on user input and image.

'use server';

/**
 * @fileOverview Generates a visualization of the user's future self based on their interests, mindset, and uploaded photo.
 *
 * - generateFutureSelfVisualization - A function that handles the future self visualization generation process.
 * - GenerateFutureSelfVisualizationInput - The input type for the generateFutureSelfVisualization function.
 * - GenerateFutureSelfVisualizationOutput - The return type for the generateFutureSelfVisualization function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const GenerateFutureSelfVisualizationInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the student, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  interests: z
    .string()
    .describe('A comma separated list of the student\'s interests.'),
  mindset: z.string().describe('A description of the student\'s mindset.'),
});
export type GenerateFutureSelfVisualizationInput = z.infer<
  typeof GenerateFutureSelfVisualizationInputSchema
>;

const GenerateFutureSelfVisualizationOutputSchema = z.object({
  generatedImage: z
    .string()
    .describe(
      'The AI-generated image of the student\'s future self, as a data URI.'
    ),
});
export type GenerateFutureSelfVisualizationOutput = z.infer<
  typeof GenerateFutureSelfVisualizationOutputSchema
>;

export async function generateFutureSelfVisualization(
  input: GenerateFutureSelfVisualizationInput
): Promise<GenerateFutureSelfVisualizationOutput> {
  return generateFutureSelfVisualizationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFutureSelfVisualizationPrompt',
  input: {schema: GenerateFutureSelfVisualizationInputSchema},
  output: {schema: GenerateFutureSelfVisualizationOutputSchema},
  prompt: `You are an AI artist specializing in generating images of people\'s future selves.

You will be provided with a photo of the student, a list of their interests, and a description of their mindset.

Use this information to generate an image of the student\'s future self that reflects their aspirations and potential.

Interests: {{{interests}}}
Mindset: {{{mindset}}}
Photo: {{media url=photoDataUri}}

Ensure the generated image is high-quality and visually appealing.

Return the generated image as a data URI.
`,
});

const generateFutureSelfVisualizationFlow = ai.defineFlow(
  {
    name: 'generateFutureSelfVisualizationFlow',
    inputSchema: GenerateFutureSelfVisualizationInputSchema,
    outputSchema: GenerateFutureSelfVisualizationOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        {media: {url: input.photoDataUri}},
        {
          text:
            `Generate an image of this person\'s future self, taking into account their interests are ${input.interests} and their mindset is ${input.mindset}`,
        },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    return {generatedImage: media!.url!};
  }
);
