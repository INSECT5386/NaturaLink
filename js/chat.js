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

    // toxicity 모델 로딩
    let model;
    toxicity.load().then((loadedModel) => {
        model = loadedModel;
    });

    // 유해한 언어 검증 함수
    async function isToxic(message) {
        if (!model) return false; // 모델이 로딩되지 않으면 기본적으로 안전하다고 판단
        const predictions = await model.classify([message]);
        return predictions[0].results[0].match; // 'toxicity' 레이블 검사
    }

    // 메시지 전송 함수
    async function sendMessage() {
        const userText = userInput.value.trim();
        if (userText === '') return;

        appendMessage(userText, 'user-message');
        userInput.value = '';
        userInput.focus(); // 입력창 포커스 유지
        scrollToBottom();

        typingIndicator.style.display = 'block'; // 타이핑 인디케이터 표시

        // 메시지가 유해한지 검사
        const isToxicMessage = await isToxic(userText);
        if (isToxicMessage) {
            appendMessage("불쾌한 언어를 사용할 수 없습니다.", 'ai-message');
            typingIndicator.style.display = 'none';
            return;
        }

        fetchChatbotResponse(userText);
    }

    // 메시지를 채팅창에 추가
    function appendMessage(message, type) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-bubble', type);
        messageElement.innerText = message;
        chatlogs.appendChild(messageElement);
        scrollToBottom();
    }

    // 채팅창 스크롤 하단으로 이동
    function scrollToBottom() {
        chatlogs.scrollTop = chatlogs.scrollHeight;
    }

    // 챗봇 응답 함수
    function fetchChatbotResponse(userText) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30초 타임아웃 설정

        fetch('https://orange-bar-f327.myageu4.workers.dev/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inputs: userText }), // 'inputs'로 수정
            signal: controller.signal // AbortController의 signal을 추가
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('서버 응답이 정상적이지 않습니다');
            }

            const contentType = response.headers.get('Content-Type');
            if (contentType && contentType.includes('application/json')) {
                return response.json();
            } else {
                throw new Error('응답 형식이 JSON이 아닙니다');
            }
        })
        .then(data => {
            clearTimeout(timeoutId); // 응답이 오면 타임아웃 취소
            console.log('AI Response Data:', data); // 응답 확인을 위한 로그

            typingIndicator.style.display = 'none'; // 타이핑 인디케이터 숨기기

            // 응답 구조가 다를 수 있으므로 데이터 확인 후 출력
            const aiText = data.generated_text || data[0]?.generated_text || 'AI의 응답을 받을 수 없습니다.'; 

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

    // 채팅 기록 지우기
    function clearChat() {
        chatlogs.innerHTML = '';
    }
});
