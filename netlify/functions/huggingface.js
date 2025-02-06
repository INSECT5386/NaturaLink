export async function handler(event, context) {
    const API_KEY = process.env.HUGGINGFACE_API_KEY;

    const response = await fetch("https://api-inference.huggingface.co/models/EleutherAI/gpt-neo-125m", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            inputs: JSON.parse(event.body).text,
            parameters: {
                max_length: 50,  // 응답 길이 제한
                temperature: 0.7, // 랜덤성 조정 (0.7로 자연스러운 응답 생성)
                top_p: 0.9, // 샘플링 방식
                repetition_penalty: 1.2 // 반복 방지
            }
        })
    });

    const data = await response.json();

    return {
        statusCode: 200,
        body: JSON.stringify(data)
    };
}