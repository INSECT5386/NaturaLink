document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ 챗봇 스크립트 로드 완료!");

    const API_ENDPOINTS = {
        gemma: "https://naturalink.netlify.app/.netlify/functions/huggingface",
        kogpt2: "https://naturalink.netlify.app/.netlify/functions/AI2"
    };

    const chatlogs = document.getElementById("chatlogs");
    const userInput = document.getElementById("userInput");
    const sendMessageBtn = document.getElementById("sendMessageBtn");
    const typingIndicator = document.getElementById("typingIndicator");
    const clearChatBtn = document.getElementById("clearChatBtn");
    const modelSelector = document.getElementById("modelSelector");

    if (!sendMessageBtn) return;

    let selectedModel = "gemma"; // 기본 모델: Gemma

    // ✅ 모델 선택 기능
    if (modelSelector) {
        modelSelector.addEventListener("change", function (event) {
            selectedModel = event.target.value;
            console.log(`🔄 선택된 모델: ${selectedModel}`);
        });
    }

    // ✅ LocalStorage에서 대화 기록 불러오기
    function loadChatHistory() {
        const savedChat = JSON.parse(localStorage.getItem("chatCache")) || [];
        savedChat.forEach(({ role, message }) => {
            addMessage(role, message, false);
        });
    }

    // ✅ 메시지 추가 함수
    function addMessage(role, message, animate = true) {
        const msgDiv = document.createElement("div");
        msgDiv.classList.add("chat-bubble", role === "user" ? "user-message" : "ai-message");
        msgDiv.textContent = message;

        if (animate) msgDiv.style.animation = "fadeIn 0.3s ease-in-out";
        
        chatlogs.appendChild(msgDiv);
        chatlogs.scrollTop = chatlogs.scrollHeight;
    }

    // ✅ 사용자 메시지 & API 요청 처리
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
                chatlogs.lastChild.remove(); // "생각 중..." 삭제
                addMessage("ai", data[0].generated_text);
                saveChatHistory("ai", data[0].generated_text);
            }
        } catch (error) {
            chatlogs.lastChild.remove();
            addMessage("ai", "⚠️ 네트워크 오류 발생! 다시 시도해주세요.");
        }
    }

    // ✅ 대화 기록 저장 (LocalStorage)
    function saveChatHistory(role, message) {
        const chatHistory = JSON.parse(localStorage.getItem("chatCache")) || [];
        chatHistory.push({ role, message });

        if (chatHistory.length > 50) chatHistory.shift();
        
        localStorage.setItem("chatCache", JSON.stringify(chatHistory));
    }

    // ✅ 캐싱된 응답 불러오기
    function getCachedResponse(input) {
        const cache = JSON.parse(localStorage.getItem("chatCache")) || [];
        const cachedMessage = cache.find(entry => entry.role === "ai" && entry.message.includes(input));
        return cachedMessage ? cachedMessage.message : null;
    }

    // ✅ 대화 기록 초기화
    function clearChatHistory() {
        localStorage.removeItem("chatCache");
        chatlogs.innerHTML = "";
        console.log("🗑️ 대화 기록이 삭제되었습니다.");
    }

    // ✅ 이벤트 리스너 등록
    sendMessageBtn.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") sendMessage();
    });
    
    if (clearChatBtn) {
        clearChatBtn.addEventListener("click", clearChatHistory);
    }

    // ✅ 페이지 로드 시 대화 기록 불러오기
    loadChatHistory();
});
