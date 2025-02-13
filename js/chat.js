// 챗봇 응답을 처리하는 함수
async function fetchChatbotResponse() {
    try {
        const response = await fetch('https://insect5386.github.io/NaturaLink/chatbot-response.json');  // 수정된 URL
        const data = await response.json();
        
        // 챗봇의 응답을 화면에 추가
        const chatLogs = document.getElementById('chatlogs');
        const aiMessage = document.createElement('div');
        aiMessage.classList.add('chat-bubble', 'ai-message');
        aiMessage.textContent = data.generated_text; // 예시로 "generated_text" 필드를 가져옴
        chatLogs.appendChild(aiMessage);
    } catch (error) {
        console.error('Error fetching chatbot response:', error);
    }
}

// 사용자 입력을 처리하고 메시지 보내는 함수
document.getElementById('sendMessageBtn').addEventListener('click', async () => {
    const userInput = document.getElementById('userInput').value;

    if (userInput.trim() !== '') {
        // 사용자 메시지 화면에 추가
        const chatLogs = document.getElementById('chatlogs');
        const userMessage = document.createElement('div');
        userMessage.classList.add('chat-bubble', 'user-message');
        userMessage.textContent = userInput;
        chatLogs.appendChild(userMessage);
        
        // 사용자 입력을 보내기 전에 입력창 초기화
        document.getElementById('userInput').value = '';

        // 타이핑 인디케이터 표시
        const typingIndicator = document.getElementById('typingIndicator');
        typingIndicator.style.display = 'block';

        // 일정 시간 후 타이핑 인디케이터 숨기기
        setTimeout(() => {
            typingIndicator.style.display = 'none';
        }, 1500);

        // 챗봇 응답 받기
        await fetchChatbotResponse();
    }
});

// 대화 지우기 버튼
document.getElementById('clearChatBtn').addEventListener('click', () => {
    const chatLogs = document.getElementById('chatlogs');
    chatLogs.innerHTML = ''; // 대화 로그 초기화
});
