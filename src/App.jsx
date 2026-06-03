export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;

  // Если ключа нет в Vercel, сервер сразу вернет эту ошибку
  if (!elevenLabsApiKey) {
    return res.status(500).json({ error: 'ELEVENLABS_API_KEY is missing in Vercel!' });
  }

  try {
    const voiceId = 'VKNR9COjyw4jDFfruaJ3';
    const modelId = 'eleven_multilingual_v2';
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': elevenLabsApiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text: text,
        model_id: modelId,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    if (!response.ok) {
      // Если ElevenLabs отверг ключ, мы увидим почему
      const errorText = await response.text();
      return res.status(503).json({ error: 'ElevenLabs rejected request', details: errorText });
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    return res.status(200).json({ audio: base64Audio });

  } catch (error) {
    return res.status(500).json({ error: 'Server crashed', details: error.message });
  }
}