document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ 설정 스크립트 로드 완료!");

    // 🔹 설정 버튼 클릭 시 메뉴 표시/숨김
    const settingsButton = document.getElementById("settings-btn");
    const settingsMenu = document.getElementById("settings-menu");

    if (settingsButton && settingsMenu) {
        settingsButton.addEventListener("click", () => {
            settingsMenu.classList.toggle("hidden");
        });
    }

    // 🔹 전체화면 모드 활성화 기능 (사용자 액션 필요)
    function enableFullScreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
                .then(() => console.log("✅ 전체 화면 모드 실행됨!"))
                .catch((err) => {
                    console.warn(`⚠️ 전체 화면 실행 실패: ${err.message}`);
                });
        }
    }

    // 🔹 전체 화면 버튼 이벤트 추가 (클릭 & 터치 대응)
    const fullScreenButton = document.getElementById("fullscreen-btn");
    if (fullScreenButton) {
        fullScreenButton.addEventListener("click", enableFullScreen);
        fullScreenButton.addEventListener("pointerdown", enableFullScreen); // ✅ 터치 디바이스 대응
    }

    // 🔹 `enableFullScreen()`을 script.js에서도 사용 가능하도록 전역 등록
    window.enableFullScreen = enableFullScreen;
});
