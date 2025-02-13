export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");  // CORS 해결
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const response = await fetch("https://api-inference.huggingface.co/models/google/gemma-2b", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ inputs: req.body.input })
        });

        if (!response.ok) {
            throw new Error(`Hugging Face API 오류: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        res.status(200).json(result);
    } catch (error) {
        console.error("서버 오류:", error);
        res.status(500).json({ error: error.message });
    }
}
