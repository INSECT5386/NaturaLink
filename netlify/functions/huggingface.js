export async function handler(event, context) {
    const API_KEY = process.env.HUGGINGFACE_API_KEY;

    const user_input = JSON.parse(event.body).text;
    const prompt = `너는 친절한 AI 챗봇이야. 사용자의 질문에 짧고 정확하게 대답해.\n사용자: ${user_input}\nAI:`;

    const response = await fetch("https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            inputs: prompt,
            parameters: {
                max_length: 100,
                temperature: 0.7,
                top_p: 0.9,
                repetition_penalty: 1.1
            }
        })
    });

    const data = await response.json();

    // 모델이 불필요한 부분을 생성하면 정제하는 코드
    let aiResponse = data[0]?.generated_text || "오류가 발생했습니다.";
    aiResponse = aiResponse.replace(/^AI:\s*/, "").trim(); // "AI:" 부분 제거

    return {
        statusCode: 200,
        body: JSON.stringify({ response: aiResponse })
    };
}