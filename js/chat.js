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
            let aiText = data.generated_text || data[0]?.generated_text || 'AI의 응답을 받을 수 없습니다.'; 
            
            // **여기에 문법 수정 함수 적용!**
            aiText = fixBlenderBotResponse(aiText);

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

    function fixBlenderBotResponse(text) {
    return text
        .replace(/\b(i)\b/g, 'I') // 단독 소문자 i -> 대문자 I
        .replace(/\b(i'm)\b/g, "I'm") // i'm -> I'm
        .replace(/\b(i've)\b/g, "I've") // i've -> I've
        .replace(/\b(i'll)\b/g, "I'll") // i'll -> I'll
        .replace(/\b(i'd)\b/g, "I'd") // i'd -> I'd
        .replace(/\bdon' t\b/g, "don't") // 공백 있는 don't -> 정상적인 don't
        .replace(/\bdoesn' t\b/g, "doesn't") // doesn' t -> doesn't
        .replace(/\bdidn' t\b/g, "didn't") // didn' t -> didn't
        .replace(/\bwasn' t\b/g, "wasn't") // wasn' t -> wasn't
        .replace(/\bweren' t\b/g, "weren't") // weren' t -> weren't
        .replace(/\bhasn' t\b/g, "hasn't") // hasn' t -> hasn't
        .replace(/\bhaven' t\b/g, "haven't") // haven' t -> haven't
        .replace(/\bhadn' t\b/g, "hadn't") // hadn' t -> hadn't
        .replace(/\bwon' t\b/g, "won't") // won' t -> won't
        .replace(/\bcan' t\b/g, "can't") // can' t -> can't
        .replace(/\b\w+’\w+\b/g, match => match.replace('’', "'")) // 스마트 따옴표 -> 일반 따옴표
        .replace(/(\s)(\d+)/g, '$1$2') // 숫자 앞 뒤 공백 제거
        .replace(/(\w+)\s{2,}(\w+)/g, '$1 $2'); // 두 개 이상의 공백 -> 한 개의 공백
    }
});
