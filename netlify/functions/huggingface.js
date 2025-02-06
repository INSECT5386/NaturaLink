let conversationHistory = []; // 대화 기록 저장

export async function handler(event, context) {
    const API_KEY = process.env.HUGGINGFACE_API_KEY;
    const user_input = JSON.parse(event.body).text;

    // 최근 3개의 대화만 유지
    if (conversationHistory.length > 3) {
        conversationHistory.shift();
    }
    conversationHistory.push(`User: ${user_input}`);

    // 대화 히스토리 기반 프롬프트 생성
    const prompt = conversationHistory.join("\n") + "\nAI:";

    const response = await fetch("https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            inputs: prompt,
            parameters: {
                max_length: 60,
                temperature: 0.5,
                top_p: 0.7,
                repetition_penalty: 1.3
            }
        })
    });

    const data = await response.json();
    const aiResponse = data.generated_text;

    // AI 응답을 대화 기록에 추가
    conversationHistory.push(`AI: ${aiResponse}`);

    return {
        statusCode: 200,
        body: JSON.stringify({ response: aiResponse })
    };
}