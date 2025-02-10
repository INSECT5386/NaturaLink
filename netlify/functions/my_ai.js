export async function handler(event, context) {
    try {
        const user_input = JSON.parse(event.body).text;

        // API 호출 전 URL을 콘솔에 출력
        const apiUrl = "https://naturaLink.netlify.app/.netlify/functions/my_ai";
        console.log("📢 API 요청 URL:", apiUrl);

        // 네 AI 모델 호출 (Python API)
        const response = await fetch(apiUrl, {
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
        console.error("❌ 오류 발생:", error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
}
