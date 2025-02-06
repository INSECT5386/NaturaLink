export async function handler(event, context) {
    const API_KEY = process.env.HUGGINGFACE_API_KEY;

    const response = await fetch("https://api-inference.huggingface.co/models/distilgpt2", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            inputs: JSON.parse(event.body).text,
            parameters: {
                max_length: 50,  // 응답 길이 제한 (헛소리 방지)
                temperature: 0.5, // 랜덤성 줄이기 (낮을수록 논리적인 문장)
                top_p: 0.9, // 샘플링 방식 최적화
                repetition_penalty: 1.2 // 같은 단어 반복 방지
            }
        })
    });

    const data = await response.json();

    return {
        statusCode: 200,
        body: JSON.stringify(data)
    };
}