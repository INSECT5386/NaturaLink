export async function handler(event, context) {
    const API_KEY = process.env.HUGGINGFACE_API_KEY;

    const response = await fetch("https://api-inference.huggingface.co/models/microsoft/DialoGPT-small", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            inputs: JSON.parse(event.body).text,
            parameters: {
                max_length: 30,  // 응답 길이 축소
                temperature: 0.5, // 랜덤성 낮춤 (헛소리 방지)
                top_p: 0.7, // 더 정제된 샘플링
                repetition_penalty: 1.3 // 같은 말 반복 방지
            }
        })
    });

    const data = await response.json();

    return {
        statusCode: 200,
        body: JSON.stringify(data)
    };
}