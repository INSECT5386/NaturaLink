document.addEventListener("DOMContentLoaded", function () {
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
            navigator.clipboard.writeText(window.location.href)
                .then(() => alert("🔗 링크가 복사되었습니다!"))
                .catch(err => console.error("❌ 링크 복사 실패:", err));
        });
    }
});
