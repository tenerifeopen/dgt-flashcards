import fs from "fs";
import path from "path";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
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

    const hash = crypto
      .createHash("md5")
      .update(normalizedText)
      .digest("hex");

    const cacheDir = path.join(process.cwd(), "cache");
    const filePath = path.join(cacheDir, `${hash}.mp3`);

    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir);
    }

    // 🟣 ПРОВЕРКА SUPABASE
    console.log("🔍 CHECK SUPABASE");

    const { data: existing } = await supabase
      .from("tts_cache")
      .select("audio")
      .eq("text", normalizedText)
      .single();

    if (existing?.audio) {
      console.log("⚡ FROM SUPABASE");
      return res.status(200).json({
        audio: existing.audio,
        cached: true,
        source: "supabase"
      });
    }

    // 🟡 FS
    if (fs.existsSync(filePath)) {
      console.log("📁 FROM FS");

      const fileBuffer = fs.readFileSync(filePath);
      const base64 = fileBuffer.toString("base64");
      const audioData = `data:audio/mpeg;base64,${base64}`;

      console.log("💾 TRY SAVE FS → SUPABASE");

      const { error } = await supabase.from("tts_cache").insert({
        text: normalizedText,
        audio: audioData
      });

      if (error) {
        console.error("❌ INSERT ERROR:", error);
      } else {
        console.log("✅ INSERT OK (FS)");
      }

      return res.status(200).json({
        audio: audioData,
        cached: true,
        source: "fs"
      });
    }

    // 🔵 ElevenLabs
    console.log("🌐 FROM ELEVENLABS");

    const response = await fetch(
      "https://api.elevenlabs.io/v1/text-to-speech/VKNR9COjyw4jDFfruaJ3",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.ELEVENLABS_API_KEY}`,
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

    const buffer = Buffer.from(await response.arrayBuffer());

    const base64 = buffer.toString("base64");
    const audioData = `data:audio/mpeg;base64,${base64}`;

    fs.writeFileSync(filePath, buffer);

    console.log("💾 TRY SAVE ELEVEN → SUPABASE");

    const { error } = await supabase.from("tts_cache").insert({
      text: normalizedText,
      audio: audioData
    });

    if (error) {
      console.error("❌ INSERT ERROR:", error);
    } else {
      console.log("✅ INSERT OK (ELEVEN)");
    }

    res.status(200).json({
      audio: audioData,
      cached: false,
      source: "elevenlabs"
    });

  } catch (err) {
    console.error("🔥 GLOBAL ERROR:", err);
    res.status(500).json({ error: "TTS error" });
  }
}