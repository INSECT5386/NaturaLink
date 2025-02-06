export async function handler(event, context) {
    const API_KEY = process.env.HUGGINGFACE_API_KEY;
    const user_input = JSON.parse(event.body).text;

    const response = await fetch("https://api-inference.huggingface.co/models/skt/ko-gpt-trinity-1.2B-v0.5", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            inputs: user_input,
            parameters: {
                max_length: 50,
                temperature: 0.7,
                top_p: 0.8,
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