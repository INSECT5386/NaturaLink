export async function handler(event, context) {
    const user_input = JSON.parse(event.body).text;

    // Python AI 모델을 호출하는 API (예제)
    const response = await fetch("https://naturaLink.netlify.app/.netlify/functions/my_ai
", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: user_input })
    });

    const data = await response.json();
    return {
        statusCode: 200,
        body: JSON.stringify(data)
    };
}
