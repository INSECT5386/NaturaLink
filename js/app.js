async function sendMessageToAPI(userMessage) {
    const response = await fetch('https://natura-link.vercel.app/api/huggingface', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: userMessage })
    });
    const data = await response.json();
    return data;
}

// 예시: 챗봇에 메시지 보내기
sendMessageToAPI("안녕하세요!").then(response => {
    console.log(response);  // 챗봇의 응답 출력
});
