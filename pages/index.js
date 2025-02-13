import { useState } from 'react';

export default function Home() {
  const [text, setText] = useState('');
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null);

  const fetchFromHuggingFace = async () => {
    try {
      const response = await fetch('/api/huggingface', {
        method: 'POST',  // 'POST' 메서드 사용
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),  // 입력된 텍스트를 보냄
      });

      if (!response.ok) {
        throw new Error('Error calling the API');
      }

      const data = await response.json();
      setResponseData(data);  // 응답 데이터 저장
    } catch (error) {
      setError(error.message);  // 오류 처리
    }
  };

  return (
    <div>
      <h1>Hugging Face API 호출</h1>
      <textarea
        placeholder="텍스트를 입력하세요..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={fetchFromHuggingFace}>API 호출</button>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {responseData && (
        <div>
          <h2>응답 데이터:</h2>
          <pre>{JSON.stringify(responseData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
