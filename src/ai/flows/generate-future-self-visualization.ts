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
        text: `Analyze the provided photo meticulously. Your primary goal is to preserve the person's distinct facial features, likeness, and ethnicity. Based on a detailed psychometric analysis, this individual shows strong interest in '${input.interests}' and possesses a '${input.mindset}' mindset.
        Generate a new, inspiring, high-fidelity, and photorealistic image that vividly portrays this person's future self in a professional context. This image must clearly represent a profession suggested by their interests.
        Incorporate tangible elements of this profession—such as the environment, attire, and tools (e.g., a modern computer setup for a developer, a sterile lab for a scientist, or a creative studio for an artist).
        Crucially, the generated person must be clearly and unmistakably identifiable as the person in the original photo. The background and attire should not only reflect the profession but also subtly echo their creative and determined mindset. The final image should be a professional, candid-style photograph that suggests a successful, fulfilling, and dynamic future career.`,
      });
    } else {
        imageGenPromptParts.push({
            text: `Based on a psychometric analysis, a person has interests in '${input.interests}' and a '${input.mindset}' mindset.
            Generate an inspiring, high-quality, and photorealistic image of this person's future self. This image must clearly represent a profession suggested by their interests.
            The image should be a full-body or upper-body shot, not just abstract elements, and must clearly represent the profession through the environment, attire, and objects (e.g., a computer for a developer, a sterile lab for a scientist, or a creative studio for an artist).
            The theme of the image, including the background and attire, should reflect their interests and mindset. 
            The final image should be realistic and inspiring, with a professional and candid style, suggesting a successful and fulfilling future. Do not show the person's face.`,
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
