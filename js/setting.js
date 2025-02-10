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

    // 🔹 전체화면 모드 활성화 기능
    function enableFullScreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.warn(`⚠️ 전체 화면 모드 실패: ${err.message}`);
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

    // 🔹 권한 확인 (Permissions API)
    if ("permissions" in navigator) {
        navigator.permissions.query({ name: "fullscreen" })
            .then(permissionStatus => {
                console.log("🔍 전체 화면 권한 상태:", permissionStatus.state);
            })
            .catch(error => {
                console.warn("⚠️ Permissions API 지원되지 않음:", error);
            });
    } else {
        console.warn("⚠️ 이 브라우저는 Permissions API를 지원하지 않습니다.");
    }
});
