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
      justifyContent: "center", // ✅ ВАЖНО (было space-between)
      padding: "20px 16px",
      fontFamily: "Arial"
    }}>

      {/* Контейнер */}
      <div style={{
        width: "100%",
        maxWidth: 420,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20
      }}>

        {/* Заголовок */}
        <h1 style={{
          color: "white",
          fontSize: "clamp(24px, 6vw, 36px)",
          fontWeight: 800,
          margin: 0
        }}>
          DGT Flashcards
        </h1>

        {/* Карточка */}
        <div style={{
          width: "100%",
          height: "min(50vh, 380px)", // 🔥 уменьшили
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
              borderRadius: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
              fontSize: "clamp(26px, 7vw, 36px)",
              fontWeight: 800,
              textAlign: "center",
              lineHeight: 1.2,
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
              borderRadius: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
              fontSize: "clamp(32px, 8vw, 42px)",
              fontWeight: 900,
              textAlign: "center",
              lineHeight: 1.2,
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
          background: "#e5e7eb",
          borderRadius: 28,
          padding: "14px 16px",
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
              width: 75,
              height: 50,
              borderRadius: 22,
              background: "#0f172a",
              color: "white",
              fontSize: 28,
              border: "none"
            }}
          >
            ←
          </button>

          <div style={{
            fontSize: 20,
            fontWeight: 700
          }}>
            {index + 1} / {cards.length}
          </div>

          <button
            onClick={() => {
              setShow(false);
              setIndex((i) => (i + 1) % cards.length);
            }}
            style={{
              width: 75,
              height: 50,
              borderRadius: 22,
              background: "#0f172a",
              color: "white",
              fontSize: 28,
              border: "none"
            }}
          >
            →
          </button>

        </div>

      </div>

    </div>
  );
}