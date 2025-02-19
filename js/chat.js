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

    async function loadModel() {
        const session = new onnx.InferenceSession();
        await session.loadModel('https://insect5386.github.io/NaturaLink/model_int8.onnx');
        console.log('ONNX 모델 로드 완료!');
        return session;
    }

    async function loadTokenizer() {
        // tokenizer는 모델에 맞는 방식으로 로드해야 합니다.
        return {
            encode: function(text) {
                return text.split(' ').map(word => word.charCodeAt(0));  // 각 문자에 대해 charCodeAt 사용
            },
            decode: function(ids) {
                return ids.map(id => String.fromCharCode(id)).join(' ');  // 문자로 복원
            }
        };
    }

    async function sendMessage() {
        const userText = userInput.value.trim();
        if (userText === '') return;

        appendMessage(userText, 'user-message');
        userInput.value = '';
        userInput.focus();
        scrollToBottom();

        typingIndicator.style.display = 'block';

        // 챗봇 응답 처리
        await fetchChatbotResponse(userText);
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

    async function fetchChatbotResponse(userText) {
        const session = await loadModel(); // ONNX 모델 로드
        const tokenizer = await loadTokenizer(); // 토크나이저 로드

        const inputIds = tokenizer.encode(userText); // 텍스트 인코딩
        console.log('Encoded Input:', inputIds); // 인코딩된 입력 출력

        // 텍스트 길이에 맞는 텐서 생성
        const inputTensor = new onnx.Tensor(new Int8Array(inputIds), 'int8', [1, inputIds.length]);
        console.log('Input Tensor Shape:', inputTensor.shape);

        try {
            // 모델 예측 실행
            const output = await session.run([inputTensor]);
            const outputTensor = output.values().next().value; // 결과 텐서 가져오기
            console.log('Output Tensor:', outputTensor.data); // 출력 텐서 로그 출력

            // 예측 결과 디코딩
            const response = tokenizer.decode(outputTensor.data);
            appendMessage(response, 'ai-message'); // 챗봇 응답 표시

        } catch (error) {
            console.error("모델 예측 중 오류 발생:", error);
        }

        typingIndicator.style.display = 'none'; // 타이핑 인디케이터 숨기기
    }

    function clearChat() {
        chatlogs.innerHTML = '';
    }
});
