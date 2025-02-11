export async function handler(event, context) {
    try {
        // 클라이언트에서 전달된 'text' 입력을 파싱
        const user_input = JSON.parse(event.body).text;

        // 정확한 Space API URL로 변경
        const response = await fetch("https://yuchan5386-naturaai-space.hf.space/run/predict", {
            method: "POST", // POST 메서드 확인
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                data: [user_input] // 입력 데이터를 'data' 배열로 전달
            })
        });

        // API 응답 상태 확인
        if (!response.ok) {
            throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
        }

        // 응답 데이터를 파싱
        const result = await response.json();

        // 결과에서 텍스트 추출
        const generated_text = result.data ? result.data[0] : "No response from model";

        // 결과 반환
        return {
            statusCode: 200,
            body: JSON.stringify({ response: generated_text })
        };
    } catch (error) {
        // 오류 처리
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
}