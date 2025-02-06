export async function handler(event, context) {
    const API_KEY = process.env.HUGGINGFACE_API_KEY;

    const user_input = JSON.parse(event.body).text;
    const prompt = `User: ${user_input}\nAI:`;

    const response = await fetch("https://api-inference.huggingface.co/models/facebook/blenderbot-3B", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            inputs: prompt,
            parameters: {
                max_length: 100,  // 응답 길이 증가
                temperature: 0.7,  // 창의성 증가
                top_p: 0.9,
                repetition_penalty: 1.2
            }
        })
    });

    const data = await response.json();

    return {
        statusCode: 200,
        body: JSON.stringify(data)
    };
}
