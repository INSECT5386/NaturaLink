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

    // 🔹 F11 키로 전체 화면 전환 (setting.js의 enableFullScreen() 호출)
    document.addEventListener("keydown", (event) => {
        if (event.key === "F11") {
            event.preventDefault();
            if (typeof window.enableFullScreen === "function") {
                window.enableFullScreen();
            } else {
                console.warn("⚠️ 전체 화면 함수가 정의되지 않음.");
            }
        }
    });
});
