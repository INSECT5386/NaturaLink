export default async function handler(req, res) {
  const { query } = req.body;

  try {
    const response = await fetch('https://api-inference.huggingface.co/models/google/gemma-2-2b-it', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: query }),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from Hugging Face API' });
  }
}
