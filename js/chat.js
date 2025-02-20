document.addEventListener('DOMContentLoaded', function () {
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const userInput = document.getElementById('userInput');
    const chatlogs = document.getElementById('chatlogs');
    const typingIndicator = document.getElementById('typingIndicator');
    const clearChatBtn = document.getElementById('clearChatBtn');

    let model;

    // 모델 로드
    async function loadModel() {
        model = await tf.loadLayersModel('/NaturaLink/model/model.json');  // 모델의 경로를 지정합니다.
        console.log("모델 로드 완료!");
    }

    loadModel();  // 페이지 로드 시 모델을 비동기적으로 로드

    sendMessageBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();  // 기본 엔터 동작 방지
            sendMessage();
        }
    });
    clearChatBtn.addEventListener('click', clearChat);

    // 메시지 전송
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

    // 메시지를 화면에 추가
    function appendMessage(message, type) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-bubble', type);
        messageElement.innerText = message;
        chatlogs.appendChild(messageElement);
        scrollToBottom();
    }

    // 화면 스크롤 맨 아래로
    function scrollToBottom() {
        chatlogs.scrollTop = chatlogs.scrollHeight;
    }

    // 챗봇 응답 받기
    async function fetchChatbotResponse(userText) {
        const inputTensor = tf.tensor([userText]); // 텍스트를 텐서로 변환

        try {
            const response = await model.predict(inputTensor); // 모델 예측 실행
            typingIndicator.style.display = 'none'; // 타이핑 인디케이터 숨기기

            // 모델의 출력 처리 (예시로, 출력 텍스트를 바로 사용)
            const aiText = response.dataSync()[0]; // 응답을 텍스트로 변환

            // 응답을 화면에 출력
            appendMessage(aiText, 'ai-message');
        } catch (error) {
            typingIndicator.style.display = 'none';
            console.error('에러:', error);
            appendMessage('에러가 발생했습니다. 다시 시도해주세요.', 'ai-message');
        }
    }

    // 채팅 지우기
    function clearChat() {
        chatlogs.innerHTML = '';
    }
});
