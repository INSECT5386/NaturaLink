document.addEventListener('DOMContentLoaded', function () {
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const userInput = document.getElementById('userInput');
    const chatlogs = document.getElementById('chatlogs');
    const typingIndicator = document.getElementById('typingIndicator');
    const clearChatBtn = document.getElementById('clearChatBtn');

    sendMessageBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();  // 기본 엔터 동작 방지
            sendMessage();
        }
    });
    clearChatBtn.addEventListener('click', clearChat);

    function sendMessage() {
        const userText = userInput.value.trim();
        if (userText === '') return;

        appendMessage(userText, 'user-message');
        userInput.value = '';
        userInput.focus(); // 입력창 포커스 유지
        scrollToBottom();

        typingIndicator.style.display = 'block'; // 타이핑 인디케이터 표시

        fetchChatbotResponse(userText);
    }

    function appendMessage(message, type) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-bubble', type);
        messageElement.innerText = message;
        chatlogs.appendChild(messageElement);
        scrollToBottom();
    }

    function scrollToBottom() {
        chatlogs.scrollTop = chatlogs.scrollHeight;
    }

    function fetchChatbotResponse(userText) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30초 타임아웃 설정

        fetch('https://orange-bar-f327.myageu4.workers.dev/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inputs: userText }), // 'inputs'로 수정
            signal: controller.signal // AbortController의 signal을 추가
        })
        .then(response => response.json())
        .then(data => {
            clearTimeout(timeoutId); // 응답이 오면 타임아웃 취소
            console.log(data); // 응답 확인을 위한 로그

            typingIndicator.style.display = 'none'; // 타이핑 인디케이터 숨기기

            const aiText = data.generated_text || 'AI의 응답을 받을 수 없습니다.'; // 응답 확인

            // 응답을 화면에 출력
            appendMessage(aiText, 'ai-message');
        })
        .catch(error => {
            clearTimeout(timeoutId); // 에러가 발생해도 타임아웃 취소
            console.error('에러:', error);
            typingIndicator.style.display = 'none';
            appendMessage('에러가 발생했습니다. 다시 시도해주세요.', 'ai-message');
        });
    }

    function clearChat() {
        chatlogs.innerHTML = '';
    }
});
