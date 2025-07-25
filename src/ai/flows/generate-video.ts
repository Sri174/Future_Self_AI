'use server';
/**
 * @fileOverview Generates a video based on a user's future self image and profile.
 *
 * - generateVideo - A function that handles the video generation process.
 * - GenerateVideoInput - The input type for the generateVideo function.
 * - GenerateVideoOutput - The return type for the generateVideo function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

const GenerateVideoInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The generated image of the user's future self, as a data URI."
    ),
  futureSelfDescription: z
    .string()
    .describe("The description of the user's future self."),
});
export type GenerateVideoInput = z.infer<typeof GenerateVideoInputSchema>;

const GenerateVideoOutputSchema = z.object({
  videoUrl: z.string().describe('The data URI of the generated video.'),
});
export type GenerateVideoOutput = z.infer<typeof GenerateVideoOutputSchema>;

export async function generateVideo(
  input: GenerateVideoInput
): Promise<GenerateVideoOutput> {
  const { operation } = await ai.generate({
    model: googleAI.model('veo-2.0-generate-001'),
    prompt: [
      {
        text: `Create a hyper-realistic, short video bringing the following scene to life. The person in the image should be shown performing actions related to their role. The video should be dynamic and inspiring, consistent with this description: "${input.futureSelfDescription}"`,
      },
      {
        media: {
          url: input.imageDataUri,
        },
      },
    ],
    config: {
      durationSeconds: 5,
      aspectRatio: '16:9',
      personGeneration: 'allow_adult',
    },
  });

  if (!operation) {
    throw new Error('Expected the model to return an operation');
  }

  let finalOperation = operation;
  while (!finalOperation.done) {
    // Wait for 5 seconds before checking the status again.
    await new Promise(resolve => setTimeout(resolve, 5000));
    finalOperation = await ai.checkOperation(finalOperation);
  }

  if (finalOperation.error) {
    throw new Error('Failed to generate video: ' + finalOperation.error.message);
  }

  const videoPart = finalOperation.output?.message?.content.find(p => !!p.media);
  if (!videoPart || !videoPart.media) {
    throw new Error('Failed to find the generated video in the operation result');
  }
  
  // The media.url from VEO is already a data URI with base64 encoded video data.
  // No need to fetch it again.
  return {
    videoUrl: videoPart.media.url,
  };
}
