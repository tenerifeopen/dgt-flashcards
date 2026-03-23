import fs from "fs";
import path from "path";
import crypto from "crypto";

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

    // ✅ НОРМАЛИЗАЦИЯ (чтобы совпадали ключи)
    const normalizedText = text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

    // ✅ УНИКАЛЬНОЕ ИМЯ ФАЙЛА
    const hash = crypto
      .createHash("md5")
      .update(normalizedText)
      .digest("hex");

    const cacheDir = path.join(process.cwd(), "cache");
    const filePath = path.join(cacheDir, `${hash}.mp3`);

    // ✅ СОЗДАЕМ ПАПКУ ЕСЛИ НЕТ
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir);
    }

    // ✅ 1. ПРОВЕРКА КЭША
    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      const base64 = fileBuffer.toString("base64");

      return res.status(200).json({
        audio: `data:audio/mpeg;base64,${base64}`,
        cached: true
      });
    }

    // ✅ 2. ЗАПРОС В ELEVENLABS
    const response = await fetch(
      "https://api.elevenlabs.io/v1/text-to-speech/VKNR9COjyw4jDFfruaJ3",
      {
        method: "POST",
        headers: {
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

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: err });
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    if (buffer.byteLength < 1000) {
      return res.status(500).json({ error: "Empty audio" });
    }

    // ✅ 3. СОХРАНЯЕМ В КЭШ
    fs.writeFileSync(filePath, buffer);

    const base64 = buffer.toString("base64");

    res.status(200).json({
      audio: `data:audio/mpeg;base64,${base64}`,
      cached: false
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "TTS error" });
  }
}