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
  suggestedProfession: z.string().describe("The AI-suggested profession for the student."),
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
  prompt: `Based on the following interests, mindset, and suggested profession, generate a short, inspiring, and dynamic description of what this student's future could look like.

Interests: {{{interests}}}
Mindset: {{{mindset}}}
Suggested Profession: {{{suggestedProfession}}}
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
        text: `You are an expert AI image generator. Your task is to create a photorealistic, inspiring, and highly-detailed image of a person's future self based on a psychometric analysis and a suggested profession.

        **Analysis Results:**
        - **Interests:** ${input.interests}
        - **Mindset:** ${input.mindset}
        - **Suggested Profession:** ${input.suggestedProfession}

        **Instructions:**
        1.  **Analyze the User's Photo:** Meticulously preserve the person's distinct facial features, likeness, ethnicity, and estimated age. The generated person MUST be clearly and unmistakably identifiable as the person in the original photo.
        2.  **Create the Scene:** Generate a high-fidelity image that vividly portrays the person in the context of their **Suggested Profession: ${input.suggestedProfession}**.
        3.  **Environment and Attire:** The environment, attire, and any tools or objects present MUST be specific and authentic to this profession. For example, if the profession is 'Landscape Architect', show them outdoors with design plans, not in an office with a computer. If the profession is 'Marine Biologist', show them on a research vessel or underwater. AVOID generic office settings with computers unless the profession is explicitly 'Software Developer' or similar.
        4.  **Reflect the Mindset:** The overall mood and style of the image should reflect their mindset (${input.mindset}). For example, a 'Creative' mindset could have a more artistic and dynamic composition. A 'Calm' mindset could be reflected in a serene environment.
        5.  **Final Image Style:** The final image must be a professional, candid-style photograph that looks realistic and inspiring, suggesting a successful and fulfilling future career.`,
      });
    } else {
        imageGenPromptParts.push({
            text: `You are an expert AI image generator. Your task is to create a photorealistic, inspiring, and highly-detailed image of a person's future self based on a psychometric analysis.

            **Analysis Results:**
            - **Interests:** ${input.interests}
            - **Mindset:** ${input.mindset}
            - **Suggested Profession:** ${input.suggestedProfession}

            **Instructions:**
            1.  **Create the Scene:** Generate a high-fidelity image that vividly portrays a person in the context of their **Suggested Profession: ${input.suggestedProfession}**.
            2.  **Anonymity:** **DO NOT show the person's face.** The image should be from the back, or otherwise conceal their facial identity.
            3.  **Environment and Attire:** The environment, attire, and any tools or objects present MUST be specific and authentic to this profession. For example, if the profession is 'Landscape Architect', show them outdoors with design plans, not in an office with a computer. If the profession is 'Marine Biologist', show them on a research vessel or underwater. AVOID generic office settings with computers unless the profession is explicitly 'Software Developer' or similar.
            4.  **Representation:** The image should be a full-body or upper-body shot, not just abstract elements.
            5.  **Reflect the Mindset:** The overall mood and style of the image should reflect their mindset (${input.mindset}).
            6.  **Final Image Style:** The final image must be realistic and inspiring, with a professional and candid style, suggesting a successful and fulfilling future career.`,
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
