export async function handler(event, context) {
    const API_KEY = process.env.HUGGINGFACE_API_KEY;

    const response = await fetch("https://api-inference.huggingface.co/models/facebook/opt-1.3b", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            inputs: JSON.parse(event.body).text,
            parameters: {
                max_length: 50, // 출력 길이 제한
                temperature: 0.7, // 랜덤성 조절 (0.5~0.8 추천)
                top_p: 0.9 // 상위 확률 샘플링 (0.8~0.95 추천)
            }
        })
    });

    const data = await response.json();

    return {
        statusCode: 200,
        body: JSON.stringify(data)
    };
}