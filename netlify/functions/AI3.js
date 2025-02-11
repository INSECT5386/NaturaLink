export async function handler(event, context) {
    try {
        // 클라이언트에서 전달된 'text' 입력을 파싱
        const { text } = JSON.parse(event.body);
        
        if (!text) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "No text provided" })
            };
        }

        // 정확한 Space API URL로 변경
        const response = await fetch("https://yuchan5386-naturaai-space.hf.space/run/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                data: [text] // 입력 데이터를 'data' 배열로 전달
            })
        });

        if (!response.ok) {
            throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        const generated_text = result.data ? result.data[0] : "Model response was empty";

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
}