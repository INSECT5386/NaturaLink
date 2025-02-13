const sendMessageBtn = document.getElementById('sendMessageBtn');
const clearChatBtn = document.getElementById('clearChatBtn');
const userInput = document.getElementById('userInput');
const chatlogs = document.getElementById('chatlogs');
const typingIndicator = document.getElementById('typingIndicator');

// 사용자 메시지와 AI 응답을 표시하는 함수
function displayMessage(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add(sender === 'user' ? 'user-message' : 'ai-message');
    messageDiv.textContent = message;
    chatlogs.appendChild(messageDiv);
    chatlogs.scrollTop = chatlogs.scrollHeight;  // 스크롤을 항상 맨 아래로
}

// 메시지 보내기 버튼 클릭 시
sendMessageBtn.addEventListener('click', async () => {
    const message = userInput.value.trim();
    if (message === '') return;

    // 사용자 메시지 표시
    displayMessage(message, 'user');
    userInput.value = '';  // 입력란 비우기

    // AI 응답 표시 중 indicator 보이기
    typingIndicator.style.display = 'block';

    // AI 응답을 가져오기 (Hugging Face API 호출)
    try {
        const response = await fetch('https://api-inference.huggingface.co/models/gpt2', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inputs: message })
        });

        const data = await response.json();
        const aiMessage = data[0]?.generated_text || '응답을 처리할 수 없습니다. 다시 시도해 주세요.';
        // AI 메시지 표시
        displayMessage(aiMessage, 'ai');
    } catch (error) {
        displayMessage('에러가 발생했습니다. 다시 시도해 주세요.', 'ai');
    }

    // AI 응답 후 indicator 숨기기
    typingIndicator.style.display = 'none';
});

// 대화 내용 지우기 버튼 클릭 시
clearChatBtn.addEventListener('click', () => {
    chatlogs.innerHTML = '';  // 대화 내용 비우기
});
