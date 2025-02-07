export async function handler(event, context) {
    const API_KEY = process.env.HUGGINGFACE_API_KEY;

    const user_input = JSON.parse(event.body).text;
    const prompt = `사용자: ${user_input}\nAI:`;

    const response = await fetch("https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            inputs: prompt,
            parameters: {
                max_length: 150,
                temperature: 0.7,
                top_p: 0.9,
                repetition_penalty: 1.2
            }
        })
    });

    const data = await response.json();

    let aiResponse = data[0]?.generated_text || "오류가 발생했습니다.";
    aiResponse = aiResponse.replace(/^AI:\s*/, "").trim(); // 불필요한 "AI:" 부분 제거

    return {
        statusCode: 200,
        body: JSON.stringify({ response: aiResponse })
    };
}