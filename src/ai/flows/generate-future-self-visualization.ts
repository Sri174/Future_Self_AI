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

const GenerateFutureSelfVisualizationInputSchema = z.object({
  photoDataUri: z
    .string()
    .nullable()
    .describe(
      "A photo of the student, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. Can be null if skipped."
    ),
  interests: z
    .string()
    .describe(`A comma separated list of the student's interests based on their MCQ answers.`), 
  mindset: z.string().describe(`A description of the student's mindset.`),
});
export type GenerateFutureSelfVisualizationInput = z.infer<
  typeof GenerateFutureSelfVisualizationInputSchema
>;

const GenerateFutureSelfVisualizationOutputSchema = z.object({
  generatedImage: z
    .string()
    .describe(
      `The AI-generated image of the student's future self, as a data URI.`
    ),
  futureSelfDescription: z.string().describe("An inspiring description of the student's future self."),
});
export type GenerateFutureSelfVisualizationOutput = z.infer<
  typeof GenerateFutureSelfVisualizationOutputSchema
>;

export async function generateFutureSelfVisualization(
  input: GenerateFutureSelfVisualizationInput
): Promise<GenerateFutureSelfVisualizationOutput> {
  return generateFutureSelfVisualizationFlow(input);
}

const textGenerationPrompt = ai.definePrompt({
  name: 'generateFutureSelfDescriptionPrompt',
  input: {schema: GenerateFutureSelfVisualizationInputSchema},
  output: {schema: z.object({ futureSelfDescription: z.string() })},
  prompt: `Based on the following interests and mindset, generate a short, inspiring, and dynamic description of what this student's future could look like.

Interests: {{{interests}}}
Mindset: {{{mindset}}}
`,
});


const generateFutureSelfVisualizationFlow = ai.defineFlow(
  {
    name: 'generateFutureSelfVisualizationFlow',
    inputSchema: GenerateFutureSelfVisualizationInputSchema,
    outputSchema: GenerateFutureSelfVisualizationOutputSchema,
  },
  async input => {
    const textGenPromise = textGenerationPrompt(input);

    const imageGenPromptParts: any[] = [];
    if (input.photoDataUri) {
      imageGenPromptParts.push({ media: { url: input.photoDataUri } });
      imageGenPromptParts.push({
        text: `Critically analyze the provided photo. Your primary goal is to maintain the exact likeness, facial features, and ethnicity of the person in the photo. 
        Based on a psychometric analysis, this person has the following interests: ${input.interests} and mindset: ${input.mindset}.
        Generate a new, inspiring, high-quality image of this person's future self, matching the profession based on the analysis. 
        It is crucial that the generated person is clearly identifiable as the person from the photo. 
        The theme of the image, including the background and attire, should reflect their interests and mindset. 
        The final image should be realistic and inspiring, suggesting a successful and fulfilling future career.`,
      });
    } else {
        imageGenPromptParts.push({
            text: `Based on a psychometric analysis, a person has the following interests: ${input.interests} and mindset: ${input.mindset}. 
            Generate an inspiring, high-quality, abstract and symbolic image of a person's future self that subtly incorporates elements reflecting their interests and mindset into the background or their attire.
            The final image should be realistic and inspiring, suggesting a successful and fulfilling future. Do not show the person's face.`,
        });
    }


    const imageGenPromise = ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: imageGenPromptParts,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    const [textResult, imageResult] = await Promise.all([textGenPromise, imageGenPromise]);
    
    if (!imageResult.media || !imageResult.media.url) {
      throw new Error("Image generation failed.");
    }

    if (!textResult.output) {
        throw new Error("Text generation failed.");
    }

    return {
        generatedImage: imageResult.media.url,
        futureSelfDescription: textResult.output.futureSelfDescription,
    };
  }
);
