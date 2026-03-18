import { useEffect, useState } from "react";

export default function App() {
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    fetch("/cards.txt")
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
      });
  }, []);

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
      justifyContent: "flex-start",
      padding: "30px 16px",
      fontFamily: "Arial"
    }}>

      {/* 🔝 ШАПКА */}
      <div style={{
        color: "#94a3b8",
        fontSize: 14,
        marginBottom: 25
      }}>
        tenerifeopen
      </div>

      {/* 📦 КАРТОЧКА */}
      <div style={{
        width: "100%",
        maxWidth: 420,
        height: "min(42vh, 320px)",
        perspective: 1000,
        marginBottom: 25
      }}>
        <div
          onClick={() => setShow(!show)}
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            transformStyle: "preserve-3d",
            transition: "transform 0.5s",
            transform: show ? "rotateY(180deg)" : "rotateY(0deg)",
            cursor: "pointer"
          }}
        >

          {/* ВОПРОС */}
          <div style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            background: "#e5e7eb",
            borderRadius: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            fontSize: "clamp(24px, 6vw, 30px)",
            fontWeight: 700,
            color: "#111827",
            textAlign: "center",
            lineHeight: 1.3,
            wordBreak: "break-word",
            backfaceVisibility: "hidden"
          }}>
            {cards[index].question}
          </div>

          {/* ОТВЕТ */}
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
            padding: 20,
            fontSize: "clamp(26px, 7vw, 34px)",
            fontWeight: 800,
            textAlign: "center",
            lineHeight: 1.3,
            wordBreak: "break-word",
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden"
          }}>
            {cards[index].answer}
          </div>

        </div>
      </div>

      {/* 🔘 КНОПКИ (ОТДЕЛЬНО!) */}
      <div style={{
        width: "100%",
        maxWidth: 420,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>

        <button
          onClick={() => {
            setShow(false);
            setIndex((i) => (i - 1 + cards.length) % cards.length);
          }}
          style={{
            width: 70,
            height: 48,
            borderRadius: 16,
            background: "#1e293b",
            color: "white",
            fontSize: 24,
            border: "none"
          }}
        >
          ←
        </button>

        <div style={{
          color: "#cbd5f5",
          fontSize: 16
        }}>
          {index + 1} / {cards.length}
        </div>

        <button
          onClick={() => {
            setShow(false);
            setIndex((i) => (i + 1) % cards.length);
          }}
          style={{
            width: 70,
            height: 48,
            borderRadius: 16,
            background: "#1e293b",
            color: "white",
            fontSize: 24,
            border: "none"
          }}
        >
          →
        </button>

      </div>

    </div>
  );
}