// /api/huggingface.js
const fetch = require('node-fetch'); // node-fetch 사용

export default async function handler(req, res) {
  // POST 요청만 처리
  if (req.method === 'POST') {
    try {
      const { text } = req.body;  // 클라이언트에서 보낸 텍스트

      // Hugging Face API 호출
      const response = await fetch('https://api-inference.huggingface.co/models/gpt2', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,  // 환경 변수로 API 키 사용
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: text }),  // 클라이언트에서 받은 텍스트를 입력값으로 사용
      });

      // 응답이 성공적이지 않으면 오류 처리
      if (!response.ok) {
        throw new Error(`Hugging Face API 호출 실패: ${response.statusText}`);
      }

      // Hugging Face API의 응답 데이터를 받아옴
      const data = await response.json();
      
      // 클라이언트에 데이터 반환
      res.status(200).json(data);
    } catch (error) {
      console.error('Error occurred:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  } else {
    // POST 외의 다른 요청은 허용하지 않음
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
