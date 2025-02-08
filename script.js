let deferredPrompt;

window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault(); // 기본 동작 방지
    deferredPrompt = event;

    console.log("beforeinstallprompt 이벤트 발생!");

    const installButton = document.getElementById("install-button");
    if (installButton) {
        installButton.style.display = "block"; // 버튼 표시
        installButton.addEventListener("click", () => {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === "accepted") {
                    console.log("사용자가 PWA를 설치함");
                } else {
                    console.log("사용자가 설치를 취소함");
                }
                deferredPrompt = null;
                installButton.style.display = "none"; // 설치 후 버튼 숨김
            });
        });
    }
});

// 서비스 워커 등록 및 업데이트 확인
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js").then((registration) => {
        console.log("✅ 서비스 워커가 등록되었습니다.");
        
        // 새로운 서비스 워커가 감지되면 업데이트 알림
        registration.onupdatefound = () => {
            const newWorker = registration.installing;
            newWorker.onstatechange = () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                    console.log("🔄 새로운 버전이 감지되었습니다. 페이지를 새로고침하세요.");
                    showUpdateNotification();
                }
            };
        };
    }).catch(error => console.error("❌ 서비스 워커 등록 실패:", error));
}

// 업데이트 알림 표시
function showUpdateNotification() {
    const updateBanner = document.createElement("div");
    updateBanner.innerHTML = `
        <div style="position: fixed; bottom: 0; width: 100%; background: #333; color: #fff; text-align: center; padding: 10px;">
            새로운 버전이 있습니다! <button onclick="location.reload()">새로고침</button>
        </div>
    `;
    document.body.appendChild(updateBanner);
}

// PWA가 standalone 모드에서 실행될 경우 전체 화면 요청
if (window.matchMedia('(display-mode: standalone)').matches) {
    setTimeout(() => {
        document.documentElement.requestFullscreen();
    }, 1000);
}

// 탭 클릭 시 해당 콘텐츠 표시
document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", function () {
        document.querySelectorAll(".content").forEach(c => c.classList.remove("show"));
        document.getElementById(this.getAttribute("data-tab")).classList.add("show");
        document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        this.classList.add("active");
    });
});

// 링크 복사 버튼 클릭 시 링크 복사
const copyBtn = document.getElementById("copyBtn");
if (copyBtn) {
    copyBtn.addEventListener("click", () => {
        const link = window.location.href;
        navigator.clipboard.writeText(link).then(() => alert("링크가 복사되었습니다!"));
    });
}

// AI API 요청 처리
const API_URL = "https://naturalink.netlify.app/.netlify/functions/huggingface";
const sendMessageBtn = document.getElementById("sendMessageBtn");
if (sendMessageBtn) {
    sendMessageBtn.addEventListener("click", async () => {
        const userInput = document.getElementById("userInput").value.trim();
        if (userInput) {
            const chatlogs = document.getElementById("chatlogs");
            chatlogs.innerHTML += `<div class="chat-bubble user-message">You: ${userInput}</div>`;
            document.getElementById("userInput").value = "";
            chatlogs.scrollTop = chatlogs.scrollHeight;

            showTypingIndicator();
            try {
                const response = await fetch(API_URL, {
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
}

// 타이핑 인디케이터 표시
function showTypingIndicator() {
    const typingIndicator = document.getElementById("typingIndicator");
    if (typingIndicator) typingIndicator.style.display = "block";
}

// 타이핑 인디케이터 숨기기
function hideTypingIndicator() {
    const typingIndicator = document.getElementById("typingIndicator");
    if (typingIndicator) typingIndicator.style.display = "none";
}

