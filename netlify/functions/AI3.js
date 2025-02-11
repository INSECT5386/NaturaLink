export async function handler(event, context) {
    try {
        const user_input = JSON.parse(event.body).text;

        // 정확한 Space API URL로 변경
        const response = await fetch("https://Yuchan5386-NaturaAI-space.hf.space/run/predict", {
            method: "POST", // POST 메서드 확인
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                data: [user_input] // 입력 데이터를 'data' 배열로 전달
            })
        });

        if (!response.ok) {
            throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        const generated_text = result.data[0]; // 결과에서 텍스트 추출
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