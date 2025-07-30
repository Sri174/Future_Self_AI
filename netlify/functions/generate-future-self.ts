const axios = require("axios");

// Replace with your actual model endpoint (text + image if supported)
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent";

exports.handler = async (event) => {
  try {
    const { profession, name } = JSON.parse(event.body);

    if (!profession || !name) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing 'name' or 'profession' in request body." }),
      };
    }

    const prompt = `
You are an AI career visualizer. Based on the student's answer "${profession}", generate a detailed description of what ${name} will look like in 10 years in that career.
Respond in this JSON format:
{
  "name": "${name}",
  "profession": "${profession}",
  "description": "Detailed futuristic career life of the student",
  "style": "Hyperrealistic digital painting",
  "environment": "Office, studio, lab, or field depending on profession"
}
`;

    const response = await axios.post(
      GEMINI_API_URL + `?key=${process.env.GOOGLE_GENAI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
            role: "user",
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const generatedText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // CORS for frontend
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ message: "Success", data: generatedText }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: error.message || "Internal server error",
      }),
    };
  }
};
