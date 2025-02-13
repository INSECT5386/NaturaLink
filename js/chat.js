const sendMessageBtn = document.getElementById('sendMessageBtn');
const userInput = document.getElementById('userInput');
const chatlogs = document.getElementById('chatlogs');
const typingIndicator = document.getElementById('typingIndicator');
const clearChatBtn = document.getElementById('clearChatBtn');

sendMessageBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') sendMessage();
});
clearChatBtn.addEventListener('click', clearChat);

function sendMessage() {
    const userText = userInput.value.trim();
    if (userText === '') return;

    appendMessage(userText, 'user-message');
    userInput.value = '';
    scrollToBottom();

    typingIndicator.style.display = 'block'; // 타이핑 인디케이터 표시

    fetchChatbotResponse(userText);
}

function appendMessage(message, type) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-bubble', type);
    messageElement.innerText = message;
    chatlogs.appendChild(messageElement);
}

function scrollToBottom() {
    chatlogs.scrollTop = chatlogs.scrollHeight;
}

function fetchChatbotResponse(userText) {
    fetch('https://127.0.0.1:5000/api/chat', { // 여기에 실제 API URL을 입력하세요
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

function clearChat() {
    chatlogs.innerHTML = '';
}
