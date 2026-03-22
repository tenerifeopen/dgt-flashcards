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
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: text
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return res.status(500).json({ error });
    }

    const audio = await response.arrayBuffer();

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(Buffer.from(audio));

  } catch (err) {
    res.status(500).json({ error: "TTS error" });
  }
}