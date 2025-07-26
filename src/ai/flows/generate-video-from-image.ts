'use server';

/**
 * @fileOverview Generates a short video from an image to create a subtle animation.
 *
 * - generateVideoFromImage - A function that handles the video generation process.
 * - GenerateVideoFromImageInput - The input type for the generateVideoFromImage function.
 * - GenerateVideoFromImageOutput - The return type for the generateVideoFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const GenerateVideoFromImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The generated image of the user's future self, as a data URI."
    ),
});
export type GenerateVideoFromImageInput = z.infer<
  typeof GenerateVideoFromImageInputSchema
>;

const GenerateVideoFromImageOutputSchema = z.object({
  video: z.string().describe('The generated video as a data URI.'),
});
export type GenerateVideoFromImageOutput = z.infer<
  typeof GenerateVideoFromImageOutputSchema
>;

export async function generateVideoFromImage(
  input: GenerateVideoFromImageInput
): Promise<GenerateVideoFromImageOutput> {
  return generateVideoFromImageFlow(input);
}

const generateVideoFromImageFlow = ai.defineFlow(
  {
    name: 'generateVideoFromImageFlow',
    inputSchema: GenerateVideoFromImageInputSchema,
    outputSchema: GenerateVideoFromImageOutputSchema,
  },
  async (input) => {
    let {operation} = await ai.generate({
      model: googleAI.model('veo-2.0-generate-001'),
      prompt: [
        {
          text: 'make the subject in the photo have a subtle motion, like they are breathing or gently smiling. The background should have very subtle movement too.',
        },
        {
          media: {
            url: input.imageDataUri,
          },
        },
      ],
      config: {
        durationSeconds: 5,
        aspectRatio: '9:16',
        personGeneration: 'allow_adult',
      },
    });

    if (!operation) {
      throw new Error('Expected the model to return an operation');
    }

    // Wait until the operation completes.
    while (!operation.done) {
      operation = await ai.checkOperation(operation);
      // Sleep for 5 seconds before checking again.
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    if (operation.error) {
      throw new Error('failed to generate video: ' + operation.error.message);
    }

    const videoPart = operation.output?.message?.content.find(p => !!p.media);
    if (!videoPart || !videoPart.media) {
      throw new Error('Failed to find the generated video');
    }

    // The API returns a URL that needs to be fetched.
    // We will use node-fetch to get the video data and then base64 encode it.
    const fetch = (await import('node-fetch')).default;
    const videoResponse = await fetch(
      `${videoPart.media.url}&key=${process.env.GEMINI_API_KEY}`
    );

    if (!videoResponse.ok || !videoResponse.body) {
      throw new Error(
        `Failed to download video: ${videoResponse.statusText}`
      );
    }

    const videoBuffer = await videoResponse.arrayBuffer();
    const videoBase64 = Buffer.from(videoBuffer).toString('base64');
    const contentType =
      videoPart.media.contentType || videoResponse.headers.get('content-type') || 'video/mp4';

    return {
      video: `data:${contentType};base64,${videoBase64}`,
    };
  }
);
