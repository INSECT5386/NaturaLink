export async function handler(event, context) {
    const API_KEY = process.env.HUGGINGFACE_API_KEY;

    const response = await fetch("https://api-inference.huggingface.co/models/EleutherAI/gpt-neo-2.7B", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: JSON.parse(event.body).text })
    });

    const data = await response.json();
    return {
        statusCode: 200,
        body: JSON.stringify(data)
    };
}