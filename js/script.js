document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ UI 스크립트 로드 완료!");

    // 🔹 탭 메뉴 기능
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

    // 🔹 링크 복사 기능
    const copyBtn = document.getElementById("copyBtn");
    if (copyBtn) {
        copyBtn.addEventListener("click", () => {
            navigator.clipboard.writeText(window.location.href)
                .then(() => alert("🔗 링크가 복사되었습니다!"))
                .catch(err => console.error("❌ 링크 복사 실패:", err));
        });
    }

    // 🔹 풀스크린 모드 활성화
    function enableFullScreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.warn(`⚠️ 풀스크린 모드 실패: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    // 🔹 F11 키로 전체 화면 전환
    document.addEventListener("keydown", (event) => {
        if (event.key === "F11") {
            event.preventDefault();
            enableFullScreen();
        }
    });

    // 🔹 설정 버튼 클릭 시 메뉴 표시/숨김 (이 부분이 추가됨)
    const settingsButton = document.getElementById("settings-btn");
    const settingsMenu = document.getElementById("settings-menu");
    
    if (settingsButton && settingsMenu) {
        settingsButton.addEventListener("click", () => {
            if (settingsMenu.style.display === "none" || settingsMenu.style.display === "") {
                settingsMenu.style.display = "block"; // 메뉴 표시
            } else {
                settingsMenu.style.display = "none"; // 메뉴 숨김
            }
        });
    }

    // 🔹 설정 메뉴에서 전체화면 모드 활성화 버튼
    const fullScreenButton = document.getElementById("fullscreen-btn");
    if (fullScreenButton) {
        fullScreenButton.addEventListener("click", enableFullScreen);
    }
});
