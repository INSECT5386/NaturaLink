document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", function () {
        document.querySelectorAll(".content").forEach(c => c.classList.remove("show"));
        document.getElementById(this.getAttribute("data-tab")).classList.add("show");
        document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        this.classList.add("active");
    });
});

document.getElementById("copyBtn").addEventListener("click", () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link).then(() => alert("링크가 복사되었습니다!"));
});

document.getElementById("sendMessageBtn").addEventListener("click", async () => {
    const userInput = document.getElementById("userInput").value.trim();
    if (userInput) {
        const chatlogs = document.getElementById("chatlogs");
        chatlogs.innerHTML += `<div class="chat-bubble user-message">You: ${userInput}</div>`;
        document.getElementById("userInput").value = "";
        chatlogs.scrollTop = chatlogs.scrollHeight;

        showTypingIndicator();
        try {
            const response = await fetch("/.netlify/functions/huggingface", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: userInput })
            });
            const data = await response.json();
            chatlogs.innerHTML += `<div class="chat-bubble ai-message">AI: ${data[0].generated_text}</div>`;
        } catch (error) {
            chatlogs.innerHTML += `<div class="chat-bubble ai-message">AI 응답을 불러오는 데 실패했습니다.</div>`;
        }
        hideTypingIndicator();
        chatlogs.scrollTop = chatlogs.scrollHeight;
    }
});

function showTypingIndicator() {
    document.getElementById("typingIndicator").style.display = "block";
}

function hideTypingIndicator() {
    document.getElementById("typingIndicator").style.display = "none";
}
