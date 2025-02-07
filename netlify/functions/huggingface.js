export async function handler(event, context) {
    const API_KEY = process.env.HUGGINGFACE_API_KEY;

    const user_input = JSON.parse(event.body).text;
    const response = await fetch("https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: user_input })
    });

    const data = await response.json();

    return {
        statusCode: 200,
        body: JSON.stringify(data)
    };
}