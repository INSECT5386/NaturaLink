let deferredPrompt;

// PWA 설치 이벤트 감지
window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    console.log("📲 PWA 설치 가능!");

    const installButton = document.getElementById("install-button");
    if (installButton) {
        installButton.style.display = "block";
        installButton.addEventListener("click", () => {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                console.log(choiceResult.outcome === "accepted" ? "✅ PWA 설치 완료" : "❌ PWA 설치 취소");
                deferredPrompt = null;
                installButton.style.display = "none";
            });
        });
    }
});

// 서비스 워커 등록 및 업데이트 감지
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js").then((registration) => {
        console.log("✅ 서비스 워커 등록 완료");
        registration.onupdatefound = () => {
            const newWorker = registration.installing;
            newWorker.onstatechange = () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                    showUpdateNotification();
                }
            };
        };
    }).catch(error => console.error("❌ 서비스 워커 등록 실패:", error));
}

// 서비스 워커 업데이트 알림 표시
function showUpdateNotification() {
    const updateBanner = document.createElement("div");
    updateBanner.innerHTML = `
        <div style="position: fixed; bottom: 0; width: 100%; background: #333; color: #fff; text-align: center; padding: 10px;">
            새로운 버전이 있습니다! <button onclick="updateServiceWorker()">새로고침</button>
        </div>
    `;
    document.body.appendChild(updateBanner);
}

// 서비스 워커 업데이트 및 새로고침
function updateServiceWorker() {
    if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ action: "skipWaiting" });
    }
}

// 서비스 워커 메시지 리스너
navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data.action === "reload") {
        window.location.reload();
    }
});

// PWA 전체 화면 모드 적용
if (window.matchMedia('(display-mode: standalone)').matches) {
    setTimeout(() => {
        document.documentElement.requestFullscreen();
    }, 1000);
}

// 탭 메뉴 기능
const tabs = document.querySelectorAll(".tab");
const contents = document.querySelectorAll(".content");

tabs.forEach(tab => {
    tab.addEventListener("click", function () {
        tabs.forEach(t => t.classList.remove("active"));
        contents.forEach(c => c.classList.remove("show"));
        this.classList.add("active");
        document.getElementById(this.getAttribute("data-tab")).classList.add("show");
    });
});

// 링크 복사 기능
const copyBtn = document.getElementById("copyBtn");
if (copyBtn) {
    copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(window.location.href).then(() => alert("🔗 링크가 복사되었습니다!"));
    });
}

// 챗봇 API 요청 최적화
const API_URL = "https://naturalink.netlify.app/.netlify/functions/huggingface";
const sendMessageBtn = document.getElementById("sendMessageBtn");
const chatlogs = document.getElementById("chatlogs");
const userInput = document.getElementById("userInput");

if (sendMessageBtn) {
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
}

// 사용자 메시지 추가
function addUserMessage(message) {
    chatlogs.innerHTML += `<div class="chat-bubble user-message">You: ${message}</div>`;
}

// AI 메시지 추가
function addAIMessage(message) {
    chatlogs.innerHTML += `<div class="chat-bubble ai-message">AI: ${message}</div>`;
}

// 타이핑 인디케이터 표시
function showTypingIndicator() {
    document.getElementById("typingIndicator").style.display = "block";
}

// 타이핑 인디케이터 숨기기
function hideTypingIndicator() {
    document.getElementById("typingIndicator").style.display = "none";
}

// 챗봇 응답 캐싱
function cacheResponse(input, response) {
    const cache = JSON.parse(localStorage.getItem("chatCache")) || {};
    cache[input] = response;
    localStorage.setItem("chatCache", JSON.stringify(cache));
}

// 캐싱된 응답 조회
function getCachedResponse(input) {
    const cache = JSON.parse(localStorage.getItem("chatCache")) || {};
    return cache[input] || null;
}
