export async function handler(event, context) {
    try {
        const user_input = JSON.parse(event.body).text;

        // 네 AI 모델 호출 (Python API)
        const response = await fetch("https://naturaLink.netlify.app/.netlify/functions/my_ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: user_input })
        });

        // API 호출 실패 시 오류 처리
        if (!response.ok) {
            throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
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
