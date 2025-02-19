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
        const model = await tf.loadGraphModel('https://insect5386.github.io/NaturaLink/model/model.json');
        console.log('모델 로드 완료!');
        return model;
    }

    async function loadTokenizer() {
        // tokenizer는 모델에 맞는 방식으로 로드해야 합니다.
        // 예시로는 TensorFlow.js에서 로드할 수 있는 tokenizer가 필요합니다.
        // 이 부분은 별도의 토크나이저 로드 방식이 필요할 수 있습니다.
        return {
            encode: function(text) {
                // 입력 텍스트를 모델에 맞게 인코딩
                // 예시로 단어들을 고유한 토큰 ID로 변환
                return text.split(' ').map(word => word.charCodeAt(0));  // 단순한 예시
            },
            decode: function(ids) {
                // 토큰 ID를 텍스트로 디코딩
                return ids.map(id => String.fromCharCode(id)).join(' ');
            }
        };
    }

    async function sendMessage() {
        const userText = userInput.value.trim();
        if (userText === '') return;

        appendMessage(userText, 'user-message');
        userInput.value = '';
        userInput.focus(); // 입력창 포커스 유지
        scrollToBottom();

        typingIndicator.style.display = 'block'; // 타이핑 인디케이터 표시

        // 텍스트를 모델로 전달하여 응답을 받아옴
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
        const model = await loadModel(); // 모델 로드
        const tokenizer = await loadTokenizer(); // 토크나이저 로드

        const inputIds = tokenizer.encode(userText); // 입력 텍스트를 모델이 처리할 수 있는 형식으로 인코딩
        const inputTensor = tf.tensor([inputIds]);

        const outputTensor = model.predict(inputTensor); // 모델을 사용하여 예측

        const response = tokenizer.decode(outputTensor.dataSync()); // 예측 결과를 디코딩
        appendMessage(response, 'ai-message'); // 응답을 화면에 표시

        typingIndicator.style.display = 'none'; // 타이핑 인디케이터 숨기기
    }

    function clearChat() {
        chatlogs.innerHTML = '';
    }
});
