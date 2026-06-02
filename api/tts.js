import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Разрешаем только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  // Инициализация Supabase
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;

  if (!supabaseUrl || !supabaseKey || !elevenLabsApiKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Проверяем кеш в Supabase
    const { data: cached, error: dbError } = await supabase
      .from('tts_cache')
      .select('audio')
      .eq('text', text)
      .single();

    if (cached && cached.audio) {
      // Если нашли в базе — сразу возвращаем
      return res.status(200).json({ audio: cached.audio, source: 'supabase' });
    }

    // 2. Если в базе нет — идем в ElevenLabs
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
      // Если ElevenLabs выдал ошибку (лимит, нет доступа и тд)
      const errorData = await response.json();
      console.error('ElevenLabs API Error:', errorData);
      return res.status(503).json({ error: 'ElevenLabs unavailable', details: errorData });
    }

    // 3. Конвертируем аудио из ElevenLabs в base64
    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    // 4. Сохраняем в Supabase для будущего кеша
    await supabase
      .from('tts_cache')
      .upsert({ text: text, audio: base64Audio }, { onConflict: 'text' });

    // 5. Возвращаем на фронтенд
    return res.status(200).json({ audio: base64Audio, source: 'elevenlabs' });

  } catch (error) {
    console.error('Server TTS Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}