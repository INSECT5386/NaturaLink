document.getElementById('sendMessageBtn').addEventListener('click', sendMessage);
document.getElementById('clearChatBtn').addEventListener('click', clearChat);

function sendMessage() {
    const userInput = document.getElementById('userInput').value;
    
    if (userInput.trim() === "") {
        return;
    }
    
    // 사용자 메시지 출력
    appendMessage(userInput, 'user');
    
    // 입력 필드 초기화
    document.getElementById('userInput').value = '';
    
    // AI 입력 중 표시
    document.getElementById('typingIndicator').style.display = 'block';

    // AI 응답 가져오기
    fetch('http://127.0.0.1:5000/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: userInput })
    })
    .then(response => response.json())
    .then(data => {
        // AI 응답 출력
        const aiResponse = data.generated_text || "응답을 받을 수 없습니다.";
        appendMessage(aiResponse, 'ai');
    })
    .catch(error => {
        console.error('Error:', error);
        appendMessage('AI 응답 오류. 다시 시도해주세요.', 'ai');
    })
    .finally(() => {
        // 입력 중 표시 숨기기
        document.getElementById('typingIndicator').style.display = 'none';
    });
}

function appendMessage(message, sender) {
    const chatlogs = document.getElementById('chatlogs');
    const messageElement = document.createElement('div');
    messageElement.classList.add(sender);
    messageElement.textContent = message;
    chatlogs.appendChild(messageElement);
}

function clearChat() {
    document.getElementById('chatlogs').innerHTML = '';
}
