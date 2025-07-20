import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { IkigaiData } from '../types';

// This function will be deployed as a serverless function (e.g., on Vercel)
// It's an API route that the frontend will call.

// The API key is securely accessed from environment variables on the server
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// We are using a Request handler format common in serverless environments
export async function POST(req: Request) {
    try {
        const data: IkigaiData = await req.json();

        const model = 'gemini-2.5-flash';
        const systemInstruction = `Eres un coach de vida experto en la filosofía Ikigai. Tu propósito es ayudar a los usuarios a encontrar su propósito de vida analizando sus propias reflexiones. Sé empático, inspirador y constructivo. Basa tu análisis únicamente en las respuestas del usuario. Formatea tu respuesta en HTML, usando encabezados (<h3>) para las secciones y párrafos (<p>) para el texto. Utiliza <strong> para resaltar las ideas clave. No uses markdown.`;

        const prompt = `
            Analiza las siguientes reflexiones de un usuario para ayudarle a descubrir su Ikigai. Sintetiza la información, encuentra patrones y conexiones entre las áreas, y ofrécele una perspectiva clara sobre cuál podría ser su propósito de vida.

            <h3>Mi Pasión (lo que amo):</h3>
            <p>${data.passion}</p>

            <h3>Mi Vocación (en lo que soy bueno):</h3>
            <p>${data.vocation}</p>

            <h3>Mi Misión (lo que el mundo necesita):</h3>
            <p>${data.mission}</p>
            
            <h3>Mi Profesión (por lo que me pueden pagar):</h3>
            <p>${data.profession}</p>

            Basado en esto, genera un resumen de mi posible Ikigai. Comienza con una sección titulada 'Síntesis de tu Ikigai' con un párrafo inspirador. Luego, crea una sección 'Puntos Clave de Conexión' con una lista de viñetas HTML (<ul><li>) que conecten mis pasiones, talentos y oportunidades. Finalmente, concluye con una sección 'Tu Ikigai Potencial' que resuma la idea central en una o dos frases potentes.
        `;
        
        const stream = await ai.models.generateContentStream({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
                topP: 1,
                topK: 32,
            }
        });

        // Create a new ReadableStream to pipe the AI response through
        const readableStream = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    const text = chunk.text;
                    if (text) {
                        controller.enqueue(new TextEncoder().encode(text));
                    }
                }
                controller.close();
            },
        });

        return new Response(readableStream, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });

    } catch (error) {
        console.error("Error in serverless function:", error);
        return new Response(JSON.stringify({ error: "Failed to process request on the server." }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
