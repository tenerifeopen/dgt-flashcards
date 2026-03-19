import { useEffect, useState } from "react";

const topics = [
  { name: "Дороги", file: "/cards/roads.txt" },
  { name: "Транспорт", file: "/cards/transport.txt" },
  { name: "Скорость", file: "/cards/speed.txt" },
  { name: "Слова", file: "/cards/words.txt" }
];

export default function App() {
  const [screen, setScreen] = useState("menu");
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
        setScreen("cards");
      });
  };

  if (screen === "menu") {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0f172a",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial"
      }}>
        <div style={{
          background: "#e5e7eb",
          padding: 20,
          borderRadius: 20,
          width: 320
        }}>
          <h2 style={{ textAlign: "center" }}>📚 Мои карточки</h2>

          {topics.map((t, i) => (
            <button
              key={i}
              onClick={() => loadTopic(t.file)}
              style={{
                width: "100%",
                marginTop: 10,
                padding: 14,
                borderRadius: 12,
                border: "none",
                background: "#2563eb",
                color: "white",
                fontSize: 16
              }}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return <div style={{ color: "white", padding: 40 }}>Загрузка...</div>;
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f172a",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "20px 12px 110px",
      fontFamily: "Arial"
    }}>

      {/* назад */}
      <div
        onClick={() => setScreen("menu")}
        style={{
          color: "#94a3b8",
          marginBottom: 10,
          cursor: "pointer"
        }}
      >
        ← назад
      </div>

      {/* карточка */}
      <div style={{
        width: "100%",
        maxWidth: 420
      }}>
        <div style={{
          width: "100%",
          height: 300,
          perspective: 1000
        }}>
          <div
            onClick={() => setShow(!show)}
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
              transformStyle: "preserve-3d",
              transition: "transform 0.5s",
              transform: show ? "rotateY(180deg)" : "rotateY(0deg)"
            }}
          >
            <div style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              background: "#e5e7eb",
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 700,
              textAlign: "center",
              padding: 20,
              backfaceVisibility: "hidden"
            }}>
              {cards[index].question}
            </div>

            <div style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              background: "#2563eb",
              color: "white",
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: 800,
              textAlign: "center",
              padding: 20,
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden"
            }}>
              {cards[index].answer}
            </div>
          </div>
        </div>
      </div>

      {/* панель */}
      <div style={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        padding: 20
      }}>
        <div style={{
          maxWidth: 420,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          background: "#1e293b",
          borderRadius: 20,
          padding: 10
        }}>
          <button onClick={() => {
            setShow(false);
            setIndex(i => (i - 1 + cards.length) % cards.length);
          }}>←</button>

          <div style={{ color: "white" }}>
            {index + 1} / {cards.length}
          </div>

          <button onClick={() => {
            setShow(false);
            setIndex(i => (i + 1) % cards.length);
          }}>→</button>
        </div>
      </div>

    </div>
  );
}