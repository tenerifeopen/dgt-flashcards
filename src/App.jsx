//Test 123
import { useEffect, useState } from "react";

export default function App() {
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(false);

  const [favorites, setFavorites] = useState([]);
  const [randomMode, setRandomMode] = useState(false);

  useEffect(() => {
    fetch("/cards/speed.txt")
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

    const saved = localStorage.getItem("fav");
    setFavorites(saved ? JSON.parse(saved) : []);
  }, []);

  useEffect(() => {
    localStorage.setItem("fav", JSON.stringify(favorites));
  }, [favorites]);

  if (cards.length === 0) {
    return <div style={{ color: "white", padding: 40 }}>Загрузка...</div>;
  }

  const favId = index;
  const isFav = favorites.includes(favId);

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

      {/* верх */}
      <div style={{
        width: "100%",
        maxWidth: 420,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{ color: "#94a3b8", fontSize: 14 }}>
          tenerifeopen
        </div>

        <button
          onClick={() => setRandomMode(!randomMode)}
          style={{
            width: 50,
            height: 50,
            borderRadius: 14,
            background: randomMode ? "#16a34a" : "#334155",
            color: "white",
            border: "none",
            fontSize: 20
          }}
        >
          🔀
        </button>
      </div>

      {/* назад */}
      <div
        onClick={() => location.reload()}
        style={{
          alignSelf: "flex-start",
          color: "#94a3b8",
          marginBottom: 10,
          cursor: "pointer"
        }}
      >
        ← назад
      </div>

      {/* КАРТОЧКА + ⭐ ВНЕ ЕЁ */}
      <div style={{
        width: "100%",
        maxWidth: 420,
        position: "relative"
      }}>

        {/* ⭐ ВАЖНО — ВНЕ flip */}
        <button
          onClick={(e) => {
            e.stopPropagation();

            if (isFav) {
              setFavorites(favorites.filter(f => f !== favId));
            } else {
              setFavorites([...favorites, favId]);
            }
          }}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 44,
            height: 44,
            borderRadius: 12,
            border: "none",
            fontSize: 22,
            background: "#ffffffcc",
            color: isFav ? "#facc15" : "#64748b",
            zIndex: 100
          }}
        >
          ⭐
        </button>

        <div style={{
          width: "100%",
          height: 340,
          perspective: 1000
        }}>
          <div
            onClick={() => setShow(!show)}
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
              transformStyle: "preserve-3d",
              transition: "0.5s",
              transform: show ? "rotateY(180deg)" : "rotateY(0deg)"
            }}
          >

            {/* вопрос */}
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
              fontSize: "clamp(22px, 6vw, 28px)",
              fontWeight: 700,
              textAlign: "center",
              backfaceVisibility: "hidden"
            }}>
              {cards[index].question}
            </div>

            {/* ответ */}
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
              fontSize: "clamp(24px, 7vw, 32px)",
              fontWeight: 800,
              textAlign: "center",
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
        padding: "12px 16px 20px",
        background: "linear-gradient(to top, #0f172a, transparent)"
      }}>
        <div style={{
          maxWidth: 420,
          margin: "0 auto",
          height: 70,
          background: "#1e293b",
          borderRadius: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px"
        }}>

          <button
            onClick={() => {
              setShow(false);
              setIndex(i => (i - 1 + cards.length) % cards.length);
            }}
            style={{
              width: 70,
              height: 48,
              borderRadius: 16,
              background: "#020617",
              color: "white",
              fontSize: 26,
              border: "none"
            }}
          >
            ←
          </button>

          <div style={{ color: "white" }}>
            {index + 1} / {cards.length}
          </div>

          <button
            onClick={() => {
              setShow(false);
              setIndex(i => {
                if (randomMode) {
                  return Math.floor(Math.random() * cards.length);
                }
                return (i + 1) % cards.length;
              });
            }}
            style={{
              width: 70,
              height: 48,
              borderRadius: 16,
              background: "#2563eb",
              color: "white",
              fontSize: 26,
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