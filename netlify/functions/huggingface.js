export async function handler(event, context) {
    const API_KEY = process.env.HUGGINGFACE_API_KEY;

    const user_input = JSON.parse(event.body).text;
    const prompt = `${user_input}`;

    const response = await fetch("https://api-inference.huggingface.co/models/TinyLlama/TinyLlama-1.1B-Chat", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            inputs: prompt,
            parameters: {
                max_length: 100,
                temperature: 0.5,
                top_p: 0.8,
                repetition_penalty: 1.1
            }
        })
    });

    const data = await response.json();
    const output_text = data.length > 0 ? data[0].generated_text : "응답을 불러오는 데 실패했습니다.";

    return {
        statusCode: 200,
        body: JSON.stringify({ response: output_text })
    };
}