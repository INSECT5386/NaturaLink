export async function handler(event, context) {
    const API_KEY = process.env.HUGGINGFACE_API_KEY;

    try {
        const user_input = JSON.parse(event.body).text;

        const response = await fetch("https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-1B-Instruct", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputs: user_input,
                parameters: {
                    max_tokens: 45,  // max_tokens 대신 max_length 사용
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

        return {
            statusCode: 200,
            body: JSON.stringify({ text: data[0]?.generated_text || "응답을 가져오지 못했습니다." })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
}