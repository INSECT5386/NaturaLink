document.addEventListener("DOMContentLoaded", function () {
    // 🔹 설정 버튼 클릭 시 메뉴 표시/숨김
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

    // 🔹 전체화면 모드 활성화 기능
    function enableFullScreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.warn(`⚠️ 풀스크린 모드 실패: ${err.message}`);
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
