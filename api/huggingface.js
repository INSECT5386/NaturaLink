const fetch = require('node-fetch');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { text } = req.body; // 클라이언트에서 보낸 데이터

      const response = await fetch('https://api-inference.huggingface.co/models/gpt2', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: text }),
      });

      const data = await response.json();

      // Hugging Face API의 응답을 클라이언트로 전달
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}

