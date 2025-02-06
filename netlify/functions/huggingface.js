export async function handler(event, context) {
    const API_KEY = process.env.HUGGINGFACE_API_KEY;

    try {
        // 요청 바디가 없거나 올바른 JSON이 아닐 경우 예외 처리
        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "No input provided" })
            };
        }

        const body = JSON.parse(event.body);
        if (!body.text || typeof body.text !== "string" || body.text.trim() === "") {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Invalid input text" })
            };
        }

        const user_input = body.text.trim();

        // 대화 기록 유지 (기본적으로 최대 5개의 메시지만 유지)
        let conversation = body.conversation || [];
        conversation.push(`User: ${user_input}`);
        if (conversation.length > 5) {
            conversation.shift(); // 오래된 메시지 삭제
        }

        const prompt = conversation.join("\n") + "\nAI:";

        const response = await fetch("https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    max_length: 50,
                    temperature: 0.5,
                    top_p: 0.7,
                    repetition_penalty: 1.3
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        // 응답 메시지를 conversation에 추가
        conversation.push(`AI: ${data[0]?.generated_text || "Sorry, I couldn't generate a response."}`);

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" // CORS 설정
            },
            body: JSON.stringify({
                response: data[0]?.generated_text || "Sorry, I couldn't generate a response.",
                conversation // 대화 기록 반환
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
}
