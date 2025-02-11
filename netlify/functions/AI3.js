const fetch = require("node-fetch");

module.exports.handler = async function (event, context) {
    try {
        // 클라이언트에서 전달된 'text' 입력을 파싱
        const { text } = JSON.parse(event.body);

        if (!text) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "No text provided" })
            };
        }

        // Hugging Face Inference API URL (GPT-2 Large)
        const response = await fetch("https://api-inference.huggingface.co/models/openai-community/gpt2-large", {
            method: "POST",
            headers: {
                "Authorization": "Bearer YOUR_HF_API_TOKEN",  // 🚨 Hugging Face API 토큰 필요
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputs: text,   // GPT-2는 'inputs' 형식으로 입력을 받아야 함
                parameters: {
                    max_length: 100,
                    temperature: 0.7
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        const generated_text = result[0]?.generated_text || "응답 없음";

        return {
            statusCode: 200,
            body: JSON.stringify({ response: generated_text })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
