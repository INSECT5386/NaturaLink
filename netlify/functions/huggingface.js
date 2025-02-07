let conversationHistory = {};

export async function handler(event, context) {
    const API_KEY = process.env.HUGGINGFACE_API_KEY;
    const sessionId = JSON.parse(event.body).sessionId;  // 세션 ID 받기
    const user_input = JSON.parse(event.body).text;

    // 이전 대화 이력 가져오기
    const previousHistory = conversationHistory[sessionId] || "";

    try {
        const response = await fetch("https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-1B-Instruct", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputs: previousHistory + "\nUser: " + user_input + "\nAI:",
                parameters: {
                    max_tokens: 30,
                    temperature: 0.7,
                    top_p: 0.9,
                    repetition_penalty: 1.2
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // 새로 받은 응답을 대화 이력에 추가
        conversationHistory[sessionId] = previousHistory + "\nUser: " + user_input + "\nAI: " + data.choices[0].text;

        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
}