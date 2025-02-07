export async function handler(event, context) {
    const API_KEY = process.env.HUGGINGFACE_API_KEY;

    const user_input = JSON.parse(event.body).text;
    const prompt = `User: ${user_input}\nAI: 한국어로 대답해 주세요.`; // 한국어로 대답하라는 요청 추가

    const response = await fetch("https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-1B-Instruct", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            inputs: prompt,
            parameters: {
                max_length: 50,
                temperature: 0.5,
                top_p: 0.7,
                repetition_penalty: 1.3
            }
        })
    });

    const data = await response.json();

    return {
        statusCode: 200,
        body: JSON.stringify(data)
    };
}