// /api/huggingface.js
import { fetch } from 'undici';

export default async function handler(req, res) {
  // 요청 메서드가 POST인지 확인
  if (req.method === 'POST') {
    try {
      const { text } = req.body;  // 클라이언트에서 보낸 텍스트

      // Hugging Face API 호출
      const response = await fetch('https://api-inference.huggingface.co/models/gpt2', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,  // 환경 변수에서 API 키 가져오기
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: text }),  // Hugging Face API에 보낼 데이터
      });

      if (!response.ok) {
        throw new Error(`Hugging Face API 호출 실패: ${response.statusText}`);
      }

      const data = await response.json();  // 응답 데이터를 JSON으로 변환
      res.status(200).json(data);  // 클라이언트에 응답 전송
    } catch (error) {
      console.error('Error occurred:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  } else {
    // POST가 아닌 요청은 405로 응답
    res.status(405).json({ error: '허용되지 않는 메서드' });
  }
}
