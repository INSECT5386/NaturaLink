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

    // 🔹 전체화면 모드 활성화 기능 (클릭 이벤트 내에서 실행)
    function enableFullScreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
                .then(() => console.log("✅ 전체 화면 모드 실행됨!"))
                .catch((err) => {
                    console.warn(`⚠️ 전체 화면 실행 실패: ${err.message}`);
                });
        } else {
            document.exitFullscreen();
        }
    }

    // 🔹 전체 화면 버튼에 클릭 이벤트 추가
    const fullScreenButton = document.getElementById("fullscreen-btn");
    if (fullScreenButton) {
        fullScreenButton.addEventListener("click", enableFullScreen); // ✅ 클릭 이벤트만 전달
    }

    // 🔹 `enableFullScreen()`을 script.js에서 사용 가능하도록 전역 등록
    window.enableFullScreen = enableFullScreen;
});
