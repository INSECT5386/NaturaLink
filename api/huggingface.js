// api/huggingface.js

const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const API_KEY = process.env.HUGGINGFACE_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ error: "API 키가 설정되지 않았습니다." });
    }

    try {
        // body가 없으면 오류 발생할 수 있으므로, 파싱 전 체크
        if (!req.body || !req.body.text) {
            return res.status(400).json({ error: "잘못된 요청: 'text' 필드가 필요합니다." });
        }

        const user_input = req.body.text;

        const response = await fetch("https://api-inference.huggingface.co/models/google/gemma-2-2b-it", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputs: user_input,
                parameters: {
                    max_tokens: 100,
                    temperature: 0.1,
                    top_p: 0.9,
                    repetition_penalty: 1.2
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error("Error:", error);  // 더 나은 디버깅을 위해 에러 출력
        return res.status(500).json({ error: error.message });
    }
};
