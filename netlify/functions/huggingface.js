export async function handler(event, context) {
    const API_KEY = process.env.HUGGINGFACE_API_KEY;

    const response = await fetch("https://api-inference.huggingface.co/models/facebook/opt-350m", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            inputs: JSON.parse(event.body).text,
            parameters: {
                max_length: 50,  // 출력 길이 제한 (짧은 문장 생성)
                temperature: 0.7, // 랜덤성 조절 (낮추면 더 일관된 문장 생성)
                top_p: 0.9 // 샘플링 방식 최적화
            }
        })
    });

    const data = await response.json();

    return {
        statusCode: 200,
        body: JSON.stringify(data)
    };
}