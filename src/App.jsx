import { useState } from "react";

const API_KEY = "19cfe51a800efaf9ecddfdd880654a8ae0eea92f1eaf1529215afc8832b5ca00";
const VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // можно оставить (Bella)

const topics = [
  { name: "Слова и выражения", file: "/cards/words.txt" }
];

export default function App() {
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(false);

  const loadTopic = (file) => {
    fetch(file)
      .then(res => res.text())
      .then(text => {
        const parsed = text
          .split("\n")
          .map(line => line.split("="))
          .filter(arr => arr.length === 2)
          .map(([q, a]) => ({
            question: q.trim(),
            answer: a.trim()
          }));

        setCards(parsed);
        setIndex(0);
        setShow(false);
      });
  };

  const current = cards[index];

  // 🔊 РАБОЧАЯ ОЗВУЧКА
  const speak = async (e) => {
    e.stopPropagation();
    if (!current) return;

    const text = show ? current.answer : current.question;

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
        {
          method: "POST",
          headers: {
            "xi-api-key": API_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            text: text,
            model_id: "eleven_multilingual_v2"
          })
        }
      );

      if (!response.ok) {
        console.log("Ошибка API", await response.text());
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const audio = new Audio(url);
      audio.play();

    } catch (err) {
      console.log("Ошибка", err);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f172a",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontFamily: "Arial"
    }}>

      <button onClick={() => loadTopic("/cards/words.txt")}>
        Загрузить
      </button>

      {current && (
        <div
          onClick={() => setShow(!show)}
          style={{
            width: 300,
            height: 300,
            background: show ? "#2563eb" : "#e5e7eb",
            color: show ? "white" : "black",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 20,
            marginTop: 20,
            textAlign: "center",
            padding: 20
          }}
        >
          {show ? current.answer : current.question}

          <button
            onClick={speak}
            style={{
              position: "absolute",
              bottom: 20,
              right: 20
            }}
          >
            🔊
          </button>
        </div>
      )}

    </div>
  );
}