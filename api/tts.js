import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY || !process.env.OPENAI_API_KEY) {
    console.error("❌ ОШИБКА: Нет ключей в настройках Vercel!");
    return res.status(200).json({ fallback: true, reason: "Missing env vars" });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );

  try {
    let rawText = req.body?.text;
    let normalizedText = req.body?.normalizedText;

    if (!rawText) {
      return res.status(400).json({ error: "No text provided" });
    }

    // Если фронтенд не прислал нормализованный, сделаем это тут
    if (!normalizedText) {
      normalizedText = rawText.trim().toLowerCase().replace(/\s+/g, " ");
    }

    console.log("👉 RAW TEXT FOR OPENAI:", rawText);
    console.log("👉 NORMALIZED FOR CACHE:", normalizedText);

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

    // 🔵 OPENAI
    console.log("🌐 FROM OPENAI");

    try {
      const response = await fetch(
        "https://api.openai.com/v1/audio/speech",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "tts-1-hd", 
            // 🔴 ИЗМЕНЕНО: Отправляем оригинальный текст с большими буквами и ударами!
            input: rawText, 
            voice: "shimmer", // 🔴 Голос Shimmer - очень четкий
            response_format: "mp3",
            speed: 0.95 // Чуть медленнее для ясности
          })
        }
      );

      if (!response.ok) {
        const errBody = await response.text();
        console.error("❌ OPENAI API ERROR:", response.status, errBody);
        return res.status(200).json({ 
          fallback: true, 
          reason: "OpenAI API error" 
        });
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const base64 = buffer.toString("base64");
      const audioData = `data:audio/mpeg;base64,${base64}`;

      console.log("💾 TRY SAVE OPENAI → SUPABASE");

      // 🔴 ИЗМЕНЕНО: Сохраняем в базу по нормализованному ключу
      const { error: insertError } = await supabase.from("tts_cache").insert({
        text: normalizedText,
        audio: audioData
      });

      if (insertError) {
        console.error("❌ SUPABASE INSERT ERROR:", insertError);
      } else {
        console.log("✅ INSERT OK (OPENAI)");
      }

      res.status(200).json({
        audio: audioData,
        cached: false,
        source: "openai"
      });

    } catch (openaiError) {
      console.error("🔥 OPENAI CATCH ERROR:", openaiError);
      return res.status(200).json({ 
        fallback: true, 
        reason: "OpenAI unavailable" 
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