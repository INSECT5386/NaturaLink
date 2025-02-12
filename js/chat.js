document.addEventListener("DOMContentLoaded", function() {
    // AI 탭 클릭 시 Gradio 앱 로드
    const aiTab = document.querySelector('.tab[data-tab="ai"]');
    aiTab.addEventListener("click", function() {
        // 이미 Gradio 앱이 로드된 경우 로드하지 않음
        if (!document.getElementById("gradio-container").hasChildNodes()) {
            loadGradioApp();
        }
    });

    // Gradio 앱 로드 함수
    function loadGradioApp() {
        // script를 비동기적으로 로드
        const script = document.createElement("script");
        script.type = "module";
        script.src = "https://gradio.s3-us-west-2.amazonaws.com/5.15.0/gradio.js";

        // script 로드 완료 후 gradio-app을 삽입
        script.onload = function() {
            const gradioApp = document.createElement("gradio-app");
            gradioApp.setAttribute("src", "https://yuchan5386-naturaai-space.hf.space");
            gradioApp.setAttribute("id", "gradio-app");

            // Gradio 앱을 gradio-container에 삽입
            document.getElementById("gradio-container").appendChild(gradioApp);
        };

        // script를 head에 추가
        document.head.appendChild(script);
    }
});
