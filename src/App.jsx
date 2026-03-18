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
      justifyContent: "space-between",
      padding: "50px 16px 20px",
      boxSizing: "border-box",
      fontFamily: "Arial"
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

      {/* Центральный блок */}
      <div style={{
        width: "100%",
        maxWidth: 420,
        display: "flex",
        flexDirection: "column",
        gap: 20
      }}>

        {/* Карточка */}
        <div style={{
          width: "100%",
          height: "min(55vh, 420px)", // ✅ фикс высоты
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
              fontSize: "clamp(26px, 7vw, 40px)", // 🔥 УВЕЛИЧИЛ
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
              fontSize: "clamp(30px, 8vw, 44px)", // 🔥 ЕЩЁ КРУПНЕЕ
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
          padding: "16px 18px",
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
              width: 80,
              height: 55,
              borderRadius: 22,
              background: "#0f172a",
              color: "white",
              fontSize: 30,
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
              width: 80,
              height: 55,
              borderRadius: 22,
              background: "#0f172a",
              color: "white",
              fontSize: 30,
              border: "none"
            }}
          >
            →
          </button>

        </div>

      </div>

      <div style={{ height: 10 }} />

    </div>
  );
}