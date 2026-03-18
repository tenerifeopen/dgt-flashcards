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
    return <div style={{ padding: 40 }}>Загрузка...</div>;
  }

  return (
    <div style={{
      maxWidth: 420,
      margin: "0 auto",
      padding: "30px 20px",
      textAlign: "center",
      fontFamily: "Arial"
    }}>
      
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>
        DGT Flashcards
      </h1>

      {/* Карточка */}
      <div style={{ perspective: 1000, marginBottom: 40 }}>
        <div
          onClick={() => setShow(!show)}
          style={{
            height: 200,
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
            backfaceVisibility: "hidden",
            background: "#f3f4f6",
            borderRadius: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            fontSize: 26,
            fontWeight: 700
          }}>
            {cards[index].question}
          </div>

          {/* Ответ */}
          <div style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            background: "#2563eb",
            color: "white",
            borderRadius: 20,
            transform: "rotateY(180deg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            fontWeight: 800,
            padding: 20
          }}>
            {cards[index].answer}
          </div>
        </div>
      </div>

      {/* Кнопки */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 15,
        background: "#f1f5f9",
        borderRadius: 20
      }}>
        <button
          onClick={() => {
            setShow(false);
            setIndex((i) => (i - 1 + cards.length) % cards.length);
          }}
        >
          ←
        </button>

        <div>
          {index + 1} / {cards.length}
        </div>

        <button
          onClick={() => {
            setShow(false);
            setIndex((i) => (i + 1) % cards.length);
          }}
        >
          →
        </button>
      </div>
    </div>
  );
}