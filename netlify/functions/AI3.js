export async function handler(event, context) {
    try {
        const user_input = JSON.parse(event.body).text;

        // Hugging Face Space API 호출
        const response = await fetch("https://Yuchan5386-NaturaAI-space.hf.space/run/predict", { // Space API URL
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                data: [user_input] // Gradio API는 "data" 배열 형식으로 입력을 받음
            })
        });

        if (!response.ok) {
            throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        const generated_text = result.data[0]; // Gradio 응답에서 생성된 텍스트 가져오기

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