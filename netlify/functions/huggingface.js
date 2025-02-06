export async function handler(event, context) {
    const API_KEY = process.env.HUGGINGFACE_API_KEY;
    const user_input = JSON.parse(event.body).text;

    // Step 1: 한국어 → 영어 번역
    const translateToEnglish = await fetch("https://api-inference.huggingface.co/models/Helsinki-NLP/opus-mt-ko-en", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: user_input })
    });
    const translatedText = (await translateToEnglish.json()).generated_text;

    // Step 2: BlenderBot과 대화
    const chatbotResponse = await fetch("https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: translatedText })
    });
    const chatbotText = (await chatbotResponse.json()).generated_text;

    // Step 3: 영어 → 한국어 번역
    const translateToKorean = await fetch("https://api-inference.huggingface.co/models/Helsinki-NLP/opus-mt-en-ko", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: chatbotText })
    });
    const finalText = (await translateToKorean.json()).generated_text;

    return {
        statusCode: 200,
        body: JSON.stringify({ response: finalText })
    };
}