const fetch = require('node-fetch');
require('dotenv').config();

// 환경 변수에서 API 키 가져오기
const apiKey = process.env.HUGGINGFACE_API_KEY;

// API에 요청 보내기
async function getChatbotResponse() {
  const response = await fetch('https://api-inference.huggingface.co/models/gpt2', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: 'Hello, how can I help you today?' })
  });

  const data = await response.json();
  console.log(data);
}

getChatbotResponse();
