import { IkigaiData } from '../types';

/**
 * Calls our secure backend API endpoint to generate the Ikigai summary.
 * The backend handles the communication with the Gemini API.
 * This function returns an async generator that yields text chunks from the stream.
 */
export async function* generateIkigaiSummaryStream(data: IkigaiData): AsyncGenerator<string> {
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred' }));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
            throw new Error("The response from the server was empty.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            yield decoder.decode(value, { stream: true });
        }
    } catch (error) {
        console.error("Error fetching summary from our API:", error);
        throw new Error("Failed to get summary from the server.");
    }
}
