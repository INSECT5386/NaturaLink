export async function handler(event, context) {
    const API_KEY = process.env.HUGGINGFACE_API_KEY;

    const user_input = JSON.parse(event.body).text;
    const prompt = `User: ${user_input}\nAI:`;

    // 1. 사용자 입력을 번역하기 위해 번역 모델 호출
    const translationResponse = await fetch("https://api-inference.huggingface.co/models/Helsinki-NLP/opus-mt-en-vi", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            inputs: user_input
        })
    });

    const translationData = await translationResponse.json();
    const translatedText = translationData[0]?.translation_text || user_input;

    // 2. 번역된 텍스트를 사용하여 챗봇 모델 호출
    const response = await fetch("https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            inputs: `User: ${translatedText}\nAI:`,
            parameters: {
                max_length: 50,
                temperature: 0.5,
                top_p: 0.7,
                repetition_penalty: 1.3
            }
        })
    });

    const data = await response.json();
    const aiResponse = data[0]?.generated_text || "죄송합니다. 응답을 생성할 수 없습니다.";

    // 3. AI의 응답을 원래 언어로 번역
    const reverseTranslationResponse = await fetch("https://api-inference.huggingface.co/models/Helsinki-NLP/opus-mt-vi-en", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            inputs: aiResponse
        })
    });

    const reverseTranslationData = await reverseTranslationResponse.json();
    const finalResponse = reverseTranslationData[0]?.translation_text || aiResponse;

    return {
        statusCode: 200,
        body: JSON.stringify({ response: finalResponse })
    };
}
