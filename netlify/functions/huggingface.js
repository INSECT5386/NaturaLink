export async function handler(event, context) {
    const API_KEY = process.env.HUGGINGFACE_API_KEY;

    const user_input = JSON.parse(event.body).text;
    const prompt = `사용자: ${user_input}\nAI:`; // 한국어 프롬프트 적용

    const response = await fetch("https://api-inference.huggingface.co/models/quantumaikr/KoreanLM", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            inputs: prompt,
            parameters: {
                max_length: 100, // 더 긴 응답 가능
                temperature: 0.7, // 창의적인 답변 유도
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