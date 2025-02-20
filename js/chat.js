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

    // TensorFlow.js 모델 로드
    async function loadToxicityModel() {
        try {
            const toxicityModel = await toxicity.load(); // 모델 로드
            console.log("모델 로드 성공!");
            return toxicityModel;
        } catch (error) {
            console.error('모델 로드 중 오류 발생:', error);
        }
    }

    // Toxicity 분석 함수
    async function analyzeToxicity(text, toxicityModel) {
        const predictions = await toxicityModel.classify([text]); // 텍스트 배열로 감싸기

        // 유해한 텍스트인지 여부를 확인
        const toxic = predictions.some(p => p.label === 'toxicity' && p.results[0].match);
        return toxic;
    }

    function sendMessage() {
        const userText = userInput.value.trim();
        if (userText === '') return;

        appendMessage(userText, 'user-message');
        userInput.value = '';
        userInput.focus(); // 입력창 포커스 유지
        scrollToBottom();

        typingIndicator.style.display = 'block'; // 타이핑 인디케이터 표시

        // TensorFlow.js 모델 로드 후 Toxicity 분석
        loadToxicityModel().then(toxicityModel => {
            analyzeToxicity(userText, toxicityModel).then(toxic => {
                if (toxic) {
                    appendMessage("이 메시지는 부적절한 내용이 포함되어 있습니다. 다시 입력해 주세요. 😞", 'ai-message');
                    typingIndicator.style.display = 'none'; // 타이핑 인디케이터 숨기기
                } else {
                    fetchChatbotResponse(userText);
                }
            });
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
        const timeoutId = setTimeout(() => {
            controller.abort(); // 30초 후 타임아웃 처리
            appendMessage('응답 시간이 초과되었습니다. 다시 시도해주세요.', 'ai-message');
            typingIndicator.style.display = 'none'; // 타이핑 인디케이터 숨기기
        }, 30000);

        fetch('https://orange-bar-f327.myageu4.workers.dev/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inputs: userText }), 
            signal: controller.signal
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
            clearTimeout(timeoutId); // 타임아웃 취소
            console.log('AI Response Data:', data);

            typingIndicator.style.display = 'none'; // 타이핑 인디케이터 숨기기

            // 응답 처리
            let aiText = data.generated_text || data[0]?.generated_text || 'AI의 응답을 받을 수 없습니다.';
            
            aiText = fixBlenderBotResponse(aiText); // 문법 수정

            // 응답 출력
            appendMessage(aiText, 'ai-message');
        })
        .catch(error => {
            clearTimeout(timeoutId); // 에러 발생시 타임아웃 취소
            console.error('에러:', error);
            typingIndicator.style.display = 'none'; // 타이핑 인디케이터 숨기기
            appendMessage('서버에서 응답을 받지 못했습니다. 다시 시도해주세요.', 'ai-message');
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
