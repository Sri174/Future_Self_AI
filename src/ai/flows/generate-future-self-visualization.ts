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
  gender: z.enum(['male', 'female']).nullable().describe("The user's selected gender for personalization."),
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
  prompt: `You are an expert career counselor and motivational writer. Your task is to create an inspiring, vivid description of a student's future self that perfectly matches their suggested profession and work environment.

**Student Profile:**
- **Interests:** {{{interests}}}
- **Mindset:** {{{mindset}}}
- **Suggested Profession:** {{{suggestedProfession}}}

**Instructions:**
1. **Professional Context:** Write about them actively working in their **{{{suggestedProfession}}}** role, describing the specific environment, tools, and activities authentic to this profession.

2. **Environment Alignment:** The description MUST match the professional environment:
   - If "Environmental Scientist" or "Marine Biologist" → Describe them working in nature, field research, outdoor settings
   - If "Landscape Architect" → Describe them working outdoors with design plans, not in an office
   - If "Software Developer" → Office/tech environment is appropriate
   - If "Teacher" → Classroom or educational setting
   - If "Doctor" → Hospital/clinic setting
   - If "Artist" → Studio or creative workspace
   - If "Social Worker" → Community center, helping people in community settings
   - Avoid generic office descriptions unless the profession specifically requires it

3. **Mindset Integration:** Reflect their {{{mindset}}} mindset in how they approach their work and interact with their environment.

4. **Specific Details:** Include profession-specific tools, responsibilities, and achievements that someone in {{{suggestedProfession}}} would actually have.

5. **Inspiring Tone:** Make it motivational and forward-looking, showing them thriving and making an impact in their chosen field.

Write a compelling 2-3 sentence description that vividly portrays them succeeding in their specific professional environment.`,
});

const generateFutureSelfVisualizationFlow = ai.defineFlow(
  {
    name: 'generateFutureSelfVisualizationFlow',
    inputSchema: GenerateFutureSelfVisualizationInputSchema,
    outputSchema: GenerateFutureSelfVisualizationOutputSchema,
  },
  async input => {
    // Generate text description first to ensure consistency
    const textResult = await textGenerationPrompt(input);

    if (!textResult.output) {
        throw new Error("Text generation failed.");
    }

    const imageGenPromptParts: any[] = [];
    if (input.photoDataUri) {
      imageGenPromptParts.push({ media: { url: input.photoDataUri } });
      imageGenPromptParts.push({
        text: `You are an expert AI image generator. Your task is to create a photorealistic, inspiring, and highly-detailed image of a person's future self that perfectly matches their suggested profession and work environment.

        **Analysis Results:**
        - **Interests:** ${input.interests}
        - **Mindset:** ${input.mindset}
        - **Suggested Profession:** ${input.suggestedProfession}

        **Critical Instructions:**
        1.  **Preserve Identity:** Meticulously preserve the person's distinct facial features, likeness, ethnicity, and estimated age. The generated person MUST be clearly and unmistakably identifiable as the person in the original photo.

        2.  **Professional Environment Match:** Generate a high-fidelity image showing them actively working in their **${input.suggestedProfession}** role with profession-specific environment:
            - **Social Work/Community roles** (Social Worker, Community Organizer, Counselor): Community center, office with clients, meeting room, or helping people in community settings - NO medical equipment like stethoscopes
            - **Healthcare roles** (Doctor, Nurse, Medical professional): Hospital, clinic, or medical facility with medical equipment like stethoscopes, medical charts
            - **Environmental/Nature roles** (Environmental Scientist, Marine Biologist, Landscape Architect): Show them outdoors in natural settings, field research, with nature-specific tools
            - **Education roles** (Teacher, Professor): Classroom, laboratory, or educational environment with students or educational materials
            - **Creative roles** (Artist, Designer, Architect): Studio, workshop, or creative workspace with art supplies, design tools
            - **Technology roles** (Software Developer, Engineer): Modern office or tech workspace with computers, coding environment
            - **Leadership roles**: Show them in action leading teams or projects in their specific field context

        3.  **Authentic Professional Details:** Include ONLY the specific tools, equipment, and activities that someone in ${input.suggestedProfession} would actually use:
            - **Social Worker**: Files, documents, meeting with clients, community center setting, casual professional attire - NEVER medical equipment
            - **Doctor/Medical**: Stethoscope, medical charts, hospital/clinic setting, medical coat
            - **Teacher**: Books, whiteboard, classroom materials, educational setting
            - **Artist**: Paintbrushes, canvas, art supplies, studio setting
            - **Software Developer**: Computer, coding environment, tech office
            - **Environmental Scientist**: Field equipment, outdoor research tools, nature setting
            - Display appropriate professional attire for the specific field
            - Show them engaged in typical activities of THIS EXACT profession only

        4.  **Mindset Reflection:** The overall composition and mood should reflect their ${input.mindset} mindset through lighting, posture, and environmental elements.

        5.  **Leadership and Success:** Show them in a position of competence and leadership within their field, demonstrating expertise and making a positive impact.

        6.  **Final Style:** Professional, candid-style photograph that looks realistic and inspiring, clearly showing them thriving in their specific career environment.`,
      });
    } else {
        imageGenPromptParts.push({
            text: `You are an expert AI image generator. Your task is to create a photorealistic, inspiring, and highly-detailed image of a person's future self that perfectly matches their suggested profession and work environment.

            **Analysis Results:**
            - **Interests:** ${input.interests}
            - **Mindset:** ${input.mindset}
            - **Suggested Profession:** ${input.suggestedProfession}
            - **Gender:** ${input.gender || 'unspecified'}

            **Critical Instructions:**
            1.  **Professional Environment Match:** Generate a high-fidelity image showing a ${input.gender || 'person'} actively working in their **${input.suggestedProfession}** role with profession-specific environment:
                - **Social Work/Community roles** (Social Worker, Community Organizer, Counselor): Community center, office with clients, meeting room, or helping people in community settings - NO medical equipment like stethoscopes
                - **Healthcare roles** (Doctor, Nurse, Medical professional): Hospital, clinic, or medical facility with medical equipment like stethoscopes, medical charts
                - **Environmental/Nature roles** (Environmental Scientist, Marine Biologist, Landscape Architect): Show them outdoors in natural settings, field research, with nature-specific tools
                - **Education roles** (Teacher, Professor): Classroom, laboratory, or educational environment with students or educational materials
                - **Creative roles** (Artist, Designer, Architect): Studio, workshop, or creative workspace with art supplies, design tools
                - **Technology roles** (Software Developer, Engineer): Modern office or tech workspace with computers, coding environment
                - **Leadership roles**: Show them in action leading teams or projects in their field

            2.  **Anonymity:** **DO NOT show the person's face clearly.** Use back view, side profile, or creative angles that conceal facial identity while still showing them engaged in their profession.

            3.  **Authentic Professional Details:** Include ONLY the specific tools, equipment, and activities that someone in ${input.suggestedProfession} would actually use:
                - **Social Worker**: Files, documents, meeting with clients, community center setting, casual professional attire - NEVER medical equipment
                - **Doctor/Medical**: Stethoscope, medical charts, hospital/clinic setting, medical coat
                - **Teacher**: Books, whiteboard, classroom materials, educational setting
                - **Artist**: Paintbrushes, canvas, art supplies, studio setting
                - **Software Developer**: Computer, coding environment, tech office
                - **Environmental Scientist**: Field equipment, outdoor research tools, nature setting
                - Display appropriate professional attire for the specific field
                - Show them engaged in typical activities of THIS EXACT profession only

            4.  **Body Representation:** Full-body or upper-body shot showing them actively working, not just abstract elements or distant figures.

            5.  **Mindset Reflection:** The overall composition and mood should reflect their ${input.mindset} mindset through lighting, posture, and environmental elements.

            6.  **Leadership and Success:** Show them in a position of competence and leadership within their field, demonstrating expertise and making a positive impact.

            7.  **Final Style:** Professional, candid-style photograph that looks realistic and inspiring, clearly showing them thriving in their specific career environment.`,
        });
    }

    const imageResult = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: imageGenPromptParts,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!imageResult.media || !imageResult.media.url) {
      throw new Error("Image generation failed.");
    }

    return {
        generatedImage: imageResult.media.url,
        futureSelfDescription: textResult.output.futureSelfDescription,
    };
  }
);
