import { fetch } from 'undici';  // undici에서 fetch 가져오기

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { text } = req.body;

      const response = await fetch('https://api-inference.huggingface.co/models/gpt2', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: text }),
      });

      if (!response.ok) {
        throw new Error(`Hugging Face API 호출 실패: ${response.statusText}`);
      }

      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Error occurred:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
