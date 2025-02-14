function fetchChatbotResponse(userText) {
    fetch('https://orange-bar-f327.myageu4.workers.dev/', { // Cloudflare Workers API URL
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: userText }),
    })
    .then(response => response.json())
    .then(data => {
        typingIndicator.style.display = 'none'; // 타이핑 인디케이터 숨기기
        const aiText = data.response || 'AI의 응답을 받을 수 없습니다.';
        appendMessage(aiText, 'ai-message');
        scrollToBottom();
    })
    .catch(error => {
        typingIndicator.style.display = 'none';
        appendMessage('에러가 발생했습니다. 다시 시도해주세요.', 'ai-message');
        scrollToBottom();
    });
}
