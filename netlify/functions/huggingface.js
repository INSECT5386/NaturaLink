export async function handler(event, context) {
    const API_KEY = process.env.HUGGINGFACE_API_KEY;

    const user_input = JSON.parse(event.body).text;
    const prompt = `AI: ${user_input}`;

    const response = await fetch("https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            inputs: prompt,
            parameters: {
                max_length: 150,
                temperature: 0.7,
                top_p: 0.9,
                repetition_penalty: 1.1
            }
        })
    });

    const data = await response.json();

    return {
        statusCode: 200,
        body: JSON.stringify(data)
    };
}