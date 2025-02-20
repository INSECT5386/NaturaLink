document.addEventListener('DOMContentLoaded', function () {
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const userInput = document.getElementById('userInput');
    const chatlogs = document.getElementById('chatlogs');
    const typingIndicator = document.getElementById('typingIndicator');
    const clearChatBtn = document.getElementById('clearChatBtn');
    const loadingIndicator = document.getElementById('loadingIndicator'); // 로딩 인디케이터

    let toxicityModel;

    // 모델 로딩 시작
    loadingIndicator.style.display = 'block'; // 로딩 화면 표시
    toxicity.load().then(model => {
        toxicityModel = model;
        loadingIndicator.style.display = 'none'; // 로딩 완료 후 화면 숨기기
    }).catch(error => {
        console.error('Toxicity 모델 로드 실패:', error);
        loadingIndicator.style.display = 'none'; // 실패 시 로딩 화면 숨기기
    });

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

        // toxicity 모델이 로드되었는지 확인
        if (toxicityModel) {
            isToxic(userText); // 유해성 검사
        } else {
            fetchChatbotResponse(userText); // 모델이 로드되지 않았다면 바로 챗봇 응답
        }
    }

    function isToxic(message) {
        toxicityModel.classify([message]).then(predictions => {
            const toxicPredictions = predictions.filter(prediction => prediction.results[0].match);
            if (toxicPredictions.length > 0) {
                appendMessage('이 메시지는 부적절합니다.', 'ai-message');
                typingIndicator.style.display = 'none'; // 타이핑 인디케이터 숨기기
            } else {
                fetchChatbotResponse(message); // 유해하지 않으면 챗봇 응답
            }
        });
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
            body: JSON.stringify({ inputs: userText }),
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
            console.log('AI Response Data:', data);

            typingIndicator.style.display = 'none'; // 타이핑 인디케이터 숨기기

            const aiText = data.generated_text || data[0]?.generated_text || 'AI의 응답을 받을 수 없습니다.'; 
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
