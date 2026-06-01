import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Проверяем, есть ли ключи
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY || !process.env.ELEVENLABS_API_KEY) {
    console.error("❌ ОШИБКА: Нет ключей в настройках Vercel!");
    return res.status(200).json({ fallback: true, reason: "Missing env vars" });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );

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

    const normalizedText = text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

    console.log("👉 TEXT:", normalizedText);

    // 🟣 ПРОВЕРКА SUPABASE
    console.log("🔍 CHECK SUPABASE");

    const { data: existing, error: supabaseSelectError } = await supabase
      .from("tts_cache")
      .select("audio")
      .eq("text", normalizedText)
      .maybeSingle();

    if (supabaseSelectError) {
      console.error("❌ SUPABASE SELECT ERROR:", supabaseSelectError);
    }

    if (existing?.audio) {
      console.log("⚡ FROM SUPABASE");
      return res.status(200).json({
        audio: existing.audio,
        cached: true,
        source: "supabase"
      });
    }

    // 🔵 ElevenLabs
    console.log("🌐 FROM ELEVENLABS");

    try {
      const response = await fetch(
        "https://api.elevenlabs.io/v1/text-to-speech/VKNR9COjyw4jDFfruaJ3",
        {
          method: "POST",
          headers: {
            // 🔴 ИЗМЕНЕНО: Используем xi-api-key вместо Bearer
            "xi-api-key": process.env.ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg"
          },
          body: JSON.stringify({
            text: normalizedText,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.9,
              similarity_boost: 0.8,
              style: 0.1
            }
          })
        }
      );

      // Если ElevenLabs вернул ошибку
      if (!response.ok) {
        const errBody = await response.text();
        console.error("❌ ELEVENLABS API ERROR:", response.status, errBody);
        return res.status(200).json({ 
          fallback: true, 
          reason: "ElevenLabs API error" 
        });
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const base64 = buffer.toString("base64");
      const audioData = `data:audio/mpeg;base64,${base64}`;

      console.log("💾 TRY SAVE ELEVEN → SUPABASE");

      const { error: insertError } = await supabase.from("tts_cache").insert({
        text: normalizedText,
        audio: audioData
      });

      if (insertError) {
        console.error("❌ SUPABASE INSERT ERROR:", insertError);
      } else {
        console.log("✅ INSERT OK (ELEVEN)");
      }

      res.status(200).json({
        audio: audioData,
        cached: false,
        source: "elevenlabs"
      });

    } catch (elevenError) {
      console.error("🔥 ELEVENLABS CATCH ERROR:", elevenError);
      return res.status(200).json({ 
        fallback: true, 
        reason: "ElevenLabs unavailable" 
      });
    }

  } catch (err) {
    console.error("🔥 GLOBAL ERROR:", err);
    res.status(200).json({ 
      fallback: true, 
      reason: "Server error" 
    });
  }
}