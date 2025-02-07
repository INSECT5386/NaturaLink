export async function handler(event, context) {
    const API_KEY = process.env.HUGGINGFACE_API_KEY;

    const user_input = JSON.parse(event.body).text;
    const prompt = `${user_input}`;

    const response = await fetch("https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            inputs: prompt,
            parameters: {
                max_length: 100,  // 200 → 100 (너무 길면 이상한 응답 가능)
                temperature: 0.5, // 0.7 → 0.5 (더 논리적인 응답 유도)
                top_p: 0.8,       // 0.9 → 0.8 (좀 더 안정적인 답변)
                repetition_penalty: 1.1 // 1.2 → 1.1 (중복 방지)
            }
        })
    });

    const data = await response.json();

    // 모델 응답에서 실제 텍스트만 반환
    const output_text = data.length > 0 ? data[0].generated_text : "응답을 불러오는 데 실패했습니다.";

    return {
        statusCode: 200,
        body: JSON.stringify({ response: output_text })
    };
}