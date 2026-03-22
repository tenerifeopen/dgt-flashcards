export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let text;

    if (typeof req.body === "string") {
      text = JSON.parse(req.body).text;
    } else {
      text = req.body?.text;
    }

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    const response = await fetch(
      "https://api.elevenlabs.io/v1/text-to-speech/8lbMAldPdNgaVy6tKwSs",
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          "Accept": "audio/mpeg" // 🔥 ВАЖНО
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2", // 🔥 вернуть модель
          voice_settings: {
            stability: 0.4,
            similarity_boost: 0.8
          }
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: err });
    }

    const buffer = await response.arrayBuffer();

    // ❗ защита от "пустого звука"
    if (buffer.byteLength < 1000) {
      return res.status(500).json({ error: "Empty audio from ElevenLabs" });
    }

    const base64 = Buffer.from(buffer).toString("base64");

    res.status(200).json({
      audio: `data:audio/mpeg;base64,${base64}`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "TTS error" });
  }
}