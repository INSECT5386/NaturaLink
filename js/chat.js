// AI 응답 받기
function fetchChatbotResponse(userMessage) {
    const apiUrl = "https://api-inference.huggingface.co/models/gpt2"; // GPT-2 모델 API 엔드포인트
    const apiKey = "${HUGGINGFACE_API_KEY}";  // API 키 (GitHub Secrets에서 관리)
    
    fetch(apiUrl, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: userMessage })
    })
    .then(response => response.json())
    .then(data => {
        // AI 응답 처리
        const aiMessage = data?.generated_text || "AI가 응답하지 않았어요.";  // GPT-2의 응답에서 텍스트 추출
        addMessage(aiMessage, "ai");
        
        // 타이핑 인디케이터 숨기기
        toggleTypingIndicator(false);
    })
    .catch(error => {
        console.error("Error:", error);
        const errorMessage = "AI 응답을 받는 데 실패했습니다.";
        addMessage(errorMessage, "ai");
        
        // 타이핑 인디케이터 숨기기
        toggleTypingIndicator(false);
    });
}
