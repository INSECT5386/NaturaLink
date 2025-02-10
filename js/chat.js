document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ 챗봇 스크립트 로드 완료!");

    const API_ENDPOINTS = {
        gemma: "https://naturalink.netlify.app/.netlify/functions/huggingface",
        kogpt2: "https://naturalink.netlify.app/.netlify/functions/AI2",
    };

    const chatlogs = document.getElementById("chatlogs");
    const userInput = document.getElementById("userInput");
    const sendMessageBtn = document.getElementById("sendMessageBtn");
    const clearChatBtn = document.getElementById("clearChatBtn");
    const modelSelector = document.getElementById("modelSelector");

    if (!sendMessageBtn) return;

    let selectedModel = "gemma"; // 기본 모델: Gemma

    if (modelSelector) {
        modelSelector.addEventListener("change", function (event) {
            selectedModel = event.target.value;
            console.log(`🔄 선택된 모델: ${selectedModel}`);
        });
    }

    function loadChatHistory() {
        const savedChat = JSON.parse(localStorage.getItem("chatCache")) || [];
        savedChat.forEach(({ role, message }) => {
            addMessage(role, message, false);
        });
    }

    function addMessage(role, message, animate = true) {
        const msgDiv = document.createElement("div");
        msgDiv.classList.add("chat-bubble", role === "user" ? "user-message" : "ai-message");
        msgDiv.textContent = message;

        if (animate) msgDiv.style.animation = "fadeIn 0.3s ease-in-out";
        
        chatlogs.appendChild(msgDiv);
        chatlogs.scrollTop = chatlogs.scrollHeight;
    }

    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        addMessage("user", message);
        saveChatHistory("user", message);
        userInput.value = "";

        addMessage("ai", "🧠 생각 중...", false);

        try {
            const cachedResponse = getCachedResponse(message);
            if (cachedResponse) {
                chatlogs.lastChild.remove();
                addMessage("ai", cachedResponse);
            } else {
                const response = await fetch(API_ENDPOINTS[selectedModel], {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: message }),
                    credentials: "omit"
                });

                const data = await response.json();
                chatlogs.lastChild.remove();
                const aiResponse = data.response || data[0]?.generated_text || "⚠️ 응답을 가져올 수 없습니다.";

                addMessage("ai", aiResponse);
                saveChatHistory("ai", aiResponse, message);
            }
        } catch (error) {
            chatlogs.lastChild.remove();
            addMessage("ai", "⚠️ 네트워크 오류 발생! 다시 시도해주세요.");
        }
    }

    function saveChatHistory(role, message, input = "") {
        const chatHistory = JSON.parse(localStorage.getItem("chatCache")) || [];
        chatHistory.push({ role, message, input });

        if (chatHistory.length > 50) chatHistory.shift();
        
        localStorage.setItem("chatCache", JSON.stringify(chatHistory));
    }

    function getCachedResponse(input) {
        const cache = JSON.parse(localStorage.getItem("chatCache")) || [];
        const cachedEntry = cache.find(entry => entry.role === "ai" && entry.input === input);
        return cachedEntry ? cachedEntry.message : null;
    }

    function clearChatHistory() {
        localStorage.removeItem("chatCache");
        chatlogs.innerHTML = "";
        console.log("🗑️ 대화 기록이 삭제되었습니다.");
    }

    sendMessageBtn.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") sendMessage();
    });
    
    if (clearChatBtn) {
        clearChatBtn.addEventListener("click", clearChatHistory);
    }

    loadChatHistory();
});
