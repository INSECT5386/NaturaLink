document.addEventListener("DOMContentLoaded", function () {
    const API_URL = "https://naturalink.netlify.app/.netlify/functions/huggingface";
    const chatlogs = document.getElementById("chatlogs");
    const userInput = document.getElementById("userInput");
    const sendMessageBtn = document.getElementById("sendMessageBtn");
    const typingIndicator = document.getElementById("typingIndicator");

    if (!sendMessageBtn) return;

    sendMessageBtn.addEventListener("click", async () => {
        const message = userInput.value.trim();
        if (!message) return;

        addUserMessage(message);
        userInput.value = "";
        chatlogs.scrollTop = chatlogs.scrollHeight;

        showTypingIndicator();

        try {
            const cachedResponse = getCachedResponse(message);
            if (cachedResponse) {
                addAIMessage(cachedResponse);
            } else {
                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: message }),
                    credentials: "omit"
                });
                const data = await response.json();
                addAIMessage(data[0].generated_text);
                cacheResponse(message, data[0].generated_text);
            }
        } catch (error) {
            addAIMessage("⚠️ 네트워크 오류 발생! 다시 시도해주세요.");
        }

        hideTypingIndicator();
        chatlogs.scrollTop = chatlogs.scrollHeight;
    });

    function addUserMessage(message) {
        chatlogs.innerHTML += `<div class="chat-bubble user-message">You: ${message}</div>`;
    }

    function addAIMessage(message) {
        chatlogs.innerHTML += `<div class="chat-bubble ai-message">AI: ${message}</div>`;
    }

    function showTypingIndicator() {
        typingIndicator.style.display = "block";
    }

    function hideTypingIndicator() {
        typingIndicator.style.display = "none";
    }

    function cacheResponse(input, response) {
        const cache = JSON.parse(localStorage.getItem("chatCache")) || {};
        cache[input] = response;
        localStorage.setItem("chatCache", JSON.stringify(cache));
    }

    function getCachedResponse(input) {
        const cache = JSON.parse(localStorage.getItem("chatCache")) || {};
        return cache[input] || null;
    }
});
