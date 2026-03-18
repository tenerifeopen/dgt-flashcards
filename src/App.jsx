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
    return <div style={{ padding: 40, color: "white" }}>Загрузка...</div>;
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f172a",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      fontFamily: "Arial"
    }}>

      {/* Заголовок */}
      <h1 style={{
        color: "white",
        fontSize: "clamp(24px, 6vw, 36px)",
        fontWeight: 800,
        marginBottom: 20
      }}>
        DGT Flashcards
      </h1>

      {/* Карточка */}
      <div style={{
        width: "100%",
        maxWidth: 420,
        marginBottom: 20,
        perspective: 1000
      }}>
        <div
          onClick={() => setShow(!show)}
          style={{
            width: "100%",
            minHeight: 220,
            position: "relative",
            transformStyle: "preserve-3d",
            transition: "transform 0.5s",
            transform: show ? "rotateY(180deg)" : "rotateY(0deg)",
            cursor: "pointer"
          }}
        >

          {/* Вопрос */}
          <div style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            background: "#e5e7eb",
            borderRadius: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            fontSize: "clamp(20px, 5vw, 30px)",
            fontWeight: 700,
            textAlign: "center",
            backfaceVisibility: "hidden"
          }}>
            {cards[index].question}
          </div>

          {/* Ответ */}
          <div style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            background: "#2563eb",
            color: "white",
            borderRadius: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            fontSize: "clamp(24px, 6vw, 36px)",
            fontWeight: 800,
            textAlign: "center",
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden"
          }}>
            {cards[index].answer}
          </div>

        </div>
      </div>

      {/* Панель */}
      <div style={{
        width: "100%",
        maxWidth: 420,
        background: "#e5e7eb",
        borderRadius: 30,
        padding: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>

        <button
          onClick={() => {
            setShow(false);
            setIndex((i) => (i - 1 + cards.length) % cards.length);
          }}
          style={{
            width: 60,
            height: 50,
            borderRadius: 20,
            background: "#111827",
            color: "white",
            fontSize: 24,
            border: "none"
          }}
        >
          ←
        </button>

        <div style={{
          fontSize: 18,
          fontWeight: 600
        }}>
          {index + 1} / {cards.length}
        </div>

        <button
          onClick={() => {
            setShow(false);
            setIndex((i) => (i + 1) % cards.length);
          }}
          style={{
            width: 60,
            height: 50,
            borderRadius: 20,
            background: "#111827",
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