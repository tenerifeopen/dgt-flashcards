export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  // Читаем ключи (теперь SUPABASE_KEY вместо SUPABASE_ANON_KEY)
  const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!elevenLabsApiKey) {
    return res.status(500).json({ error: 'На Vercel не найден ключ ELEVENLABS_API_KEY!' });
  }
  if (!supabaseUrl) {
    return res.status(500).json({ error: 'На Vercel не найден ключ SUPABASE_URL!' });
  }
  if (!supabaseKey) {
    return res.status(500).json({ error: 'На Vercel не найден ключ SUPABASE_KEY!' });
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Проверяем кеш в Supabase
    const { data: cached, error: dbError } = await supabase
      .from('tts_cache')
      .select('audio')
      .eq('text', text)
      .limit(1);

    // Если нашли в базе — сразу возвращаем
    if (!dbError && cached && cached.length > 0 && cached[0].audio) {
      return res.status(200).json({ audio: cached[0].audio, source: 'supabase' });
    }

    // 2. Идем в ElevenLabs
    const voiceId = 'AgBgo7TsWfKKzgbdvZja';
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
      const errorText = await response.text();
      return res.status(503).json({ error: 'ElevenLabs отклонил запрос', details: errorText });
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    // 3. Сохраняем в Supabase
    await supabase.from('tts_cache').upsert({ text: text, audio: base64Audio }, { onConflict: 'text' });

    return res.status(200).json({ audio: base64Audio, source: 'elevenlabs' });

  } catch (error) {
    return res.status(500).json({ error: 'Ошибка сервера', details: error.message });
  }
}