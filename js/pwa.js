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
            if (deferredPrompt) { // ✅ deferredPrompt가 null인지 확인
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === "accepted") {
                        console.log("✅ PWA 설치 완료");
                    } else {
                        console.log("❌ PWA 설치 취소");
                    }
                    deferredPrompt = null;
                    installButton.style.display = "none";
                });
            }
        });
    }
});

// 서비스 워커 등록 및 업데이트 감지
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/NaturaLink/service-worker.js")
        .then((registration) => {
            console.log("✅ 서비스 워커 등록 완료");
            registration.onupdatefound = () => {
                const newWorker = registration.installing;
                if (newWorker) {
                    newWorker.onstatechange = () => {
                        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                            showUpdateNotification();
                        }
                    };
                }
            };
        })
        .catch(error => console.error("❌ 서비스 워커 등록 실패:", error));
}

// 서비스 워커 업데이트 알림 표시
function showUpdateNotification() {
    const updateBanner = document.createElement("div");
    updateBanner.innerHTML = `
        <div style="position: fixed; bottom: 0; width: 100%; background: #333; color: #fff; text-align: center; padding: 10px;">
            새로운 버전이 있습니다! <button id="updateBtn">새로고침</button>
        </div>
    `;
    document.body.appendChild(updateBanner);

    document.getElementById("updateBtn").addEventListener("click", updateServiceWorker);
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
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        }
    }, 1000);
}
