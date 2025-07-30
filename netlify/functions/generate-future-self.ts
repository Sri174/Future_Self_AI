import type { Handler } from '@netlify/functions'

const handler: Handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}')
    const { prompt, photoDataUri } = body

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Prompt is required.' }),
      }
    }

    const imagePromptParts: any[] = [
      { text: prompt }
    ]

    // Safely add image data if provided
    if (photoDataUri) {
      const [meta, base64Data] = photoDataUri.split(',')
      const mimeMatch = meta?.match(/data:(.*);base64/)
      const mimeType = mimeMatch?.[1]

      if (mimeType && base64Data) {
        imagePromptParts.push({
          inlineData: {
            mimeType,
            data: base64Data
          }
        })
      } else {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid photoDataUri format' }),
        }
      }
    }

    // Gemini API call
    const imageResult = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${process.env.GOOGLE_GENAI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: imagePromptParts
          }
        ],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.9,
          maxOutputTokens: 2048
        }
      })
    })

    if (!imageResult.ok) {
      const errorText = await imageResult.text()
      return {
        statusCode: imageResult.status,
        body: JSON.stringify({
          error: 'Failed to generate image content',
          details: errorText
        }),
      }
    }

    const resultJson = await imageResult.json()

    return {
      statusCode: 200,
      body: JSON.stringify({ result: resultJson }),
    }
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }),
    }
  }
}

export { handler }
