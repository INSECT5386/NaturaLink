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
        // 예시로는 단어들을 고유한 토큰 ID로 변환
        return {
            encode: function(text) {
                return text.split(' ').map(word => word.charCodeAt(0));
            },
            decode: function(ids) {
                return ids.map(id => String.fromCharCode(id)).join(' ');
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
        const inputTensor = new onnx.Tensor(new Int32Array(inputIds), 'int32', [1, inputIds.length]); // 데이터 타입을 'int32'로 수정

        const output = await session.run([inputTensor]); // 모델 예측
        const outputTensor = output.values().next().value; // 결과 텐서 가져오기

        const response = tokenizer.decode(outputTensor.data); // 예측 결과 디코딩
        appendMessage(response, 'ai-message'); // 챗봇 응답 표시

        typingIndicator.style.display = 'none'; // 타이핑 인디케이터 숨기기
    }

    function clearChat() {
        chatlogs.innerHTML = '';
    }
});
