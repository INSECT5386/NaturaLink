export async function handler(event, context) {
    const API_KEY = process.env.HUGGINGFACE_API_KEY;

    const user_input = JSON.parse(event.body).text;
    const prompt = `User: ${user_input}\nAI:`;

    const response = await fetch("https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            inputs: prompt,
            parameters: {
                max_length: 100,  // 대답의 길이를 길게 설정
                temperature: 0.5, // 창의성 낮추기 (정확성을 높임)
                top_p: 0.9,
                repetition_penalty: 1.1, // 반복 방지
                top_k: 50 // 더 적은 후보 선택으로 품질 향상
            }
        })
    });

    const data = await response.json();

    // 응답에서 AI가 적절하게 대화가 가능한지 확인
    const ai_response = data?.choices?.[0]?.text?.trim() || "죄송합니다, 이해하지 못했습니다.";
    
    return {
        statusCode: 200,
        body: JSON.stringify({ response: ai_response })  // 응답을 더 명확하게 출력
    };
}