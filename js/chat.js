// 환경 변수에서 API 키를 가져옴
const apiKey = process.env.HUGGINGFACE_API_KEY; // GitHub Secrets에서 가져온 API 키

// 챗봇 응답을 처리하는 함수
async function fetchChatbotResponse() {
    try {
        const response = await fetch('https://api-inference.huggingface.co/models/gpt2', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,  // Authorization 헤더에 API 키 포함
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ inputs: 'Hello, how can I help you today?' }) // 사용자가 보낸 입력을 전송
        });

        const data = await response.json(); // 응답 데이터 처리
        console.log('Chatbot Response:', data); // 콘솔에 응답 데이터 출력

        // 받은 텍스트 길이 체크 (예시: 1000자 이상이면 일부만 표시)
        let aiText = data[0].generated_text;
        if (aiText.length > 1000) {
            aiText = aiText.substring(0, 1000) + '...'; // 1000자까지만 표시
        }

        // 챗봇의 응답을 화면에 추가
        const chatLogs = document.getElementById('chatlogs');
        const aiMessage = document.createElement('div');
        aiMessage.classList.add('chat-bubble', 'ai-message');
        aiMessage.textContent = aiText;
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
