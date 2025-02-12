async function fetchAIResponse(userInput) {
    try {
        const response = await fetch("https://workers-playground-throbbing-sky-0062.shinnara-yuchan.workers.dev/", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: userInput })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching AI response:", error);
        return { reply: "오류가 발생했습니다. 다시 시도해주세요!" };
    }
}

// HTML 버튼과 연결된 함수
async function sendMessage() {
    const inputElement = document.getElementById("userInput");
    const responseElement = document.getElementById("response");

    const userInput = inputElement.value;
    if (!userInput) return;

    const aiResponse = await fetchAIResponse(userInput);
    responseElement.textContent = aiResponse.reply || "응답이 없습니다.";
}
