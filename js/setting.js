document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ 설정 스크립트 로드 완료!");

    // 🔹 설정 버튼 클릭 시 메뉴 표시/숨김
    const settingsButton = document.getElementById("settings-btn");
    const settingsMenu = document.getElementById("settings-menu");

    if (settingsButton && settingsMenu) {
        settingsButton.addEventListener("click", () => {
            settingsMenu.classList.toggle("hidden"); // ✅ 클래스 기반 토글
        });
    }

    // 🔹 전체화면 모드 활성화 기능 (사용자 클릭 시에만 실행 가능)
    function enableFullScreen(event) {
        event.preventDefault(); // ✅ 기본 동작 방지 (일부 브라우저 대응)
        
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
                .then(() => console.log("✅ 전체 화면 모드 실행!"))
                .catch((err) => {
                    console.warn(`⚠️ 전체 화면 실행 실패: ${err.message}`);
                });
        } else {
            document.exitFullscreen();
        }
    }

    // 🔹 설정 메뉴에서 전체화면 모드 활성화 버튼
    const fullScreenButton = document.getElementById("fullscreen-btn");
    if (fullScreenButton) {
        fullScreenButton.addEventListener("click", enableFullScreen);
    }
});
