document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ 설정 스크립트 로드 완료!");

    // 🔹 전체화면 모드 활성화 기능
    function enableFullScreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
                .then(() => console.log("✅ 전체 화면 모드 실행됨!"))
                .catch((err) => {
                    console.warn(`⚠️ 전체 화면 실행 실패: ${err.message}`);
                });
        }
    }

    // 🔹 페이지 로드 시 자동으로 전체 화면 실행
    setTimeout(() => {
        enableFullScreen();
    }, 500); // ✅ 약간의 딜레이 후 실행 (브라우저 안정성 확보)

    // 🔹 `enableFullScreen()`을 script.js에서도 사용 가능하도록 전역 등록
    window.enableFullScreen = enableFullScreen;
});
