import { useState, useRef } from "react";

const topics = [
  { name: "Слова и выражения", file: "/cards/words.txt" },
  { name: "Документы", file: "/cards/Документы.txt" },
  { name: "Дороги и скорость", file: "/cards/Дороги и скорость.txt" },
  { name: "Знаки и правила", file: "/cards/Знаки и правила.txt" },
  { name: "Манёвры", file: "/cards/Манёвры.txt" },
  { name: "Нормы движения", file: "/cards/Нормы движения.txt" },
  { name: "Определения участников движения", file: "/cards/Определения участников движения.txt" },
  { name: "Особые полосы", file: "/cards/Особые полосы.txt" },
  { name: "Перевозка грузов и детей", file: "/cards/Перевозка грузов и детей.txt" },
  { name: "Права и баллы", file: "/cards/Права и баллы.txt" },
  { name: "Скорости", file: "/cards/Скорости.txt" },
  { name: "Транспортные средства", file: "/cards/Транспортные средства.txt" },
  { name: "Фары и освещение", file: "/cards/Фары и освещение.txt" },
  { name: "Экстренные ситуации", file: "/cards/Экстренные ситуации.txt" },
  { name: "Знаки", file: "/cards/Знаки.txt" }
];

export default function App() {
  const [screen, setScreen] = useState("menu");
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [onlyFav, setOnlyFav] = useState(false);

  const [dragX, setDragX] = useState(0);
  const startX = useRef(0);

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

  const filteredCards = onlyFav
    ? cards.filter(c => favorites.includes(c.question))
    : cards;

  const toggleFavorite = (e) => {
    e.stopPropagation();
    const q = filteredCards[index].question;

    if (favorites.includes(q)) {
      setFavorites(favorites.filter(f => f !== q));
    } else {
      setFavorites([...favorites, q]);
    }
  };

  const shuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setIndex(0);
    setShow(false);
  };

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    const move = e.touches[0].clientX - startX.current;
    setDragX(move);
  };

  const handleTouchEnd = () => {
    if (Math.abs(dragX) > 60) {
      setDragX(dragX > 0 ? 500 : -500);

      setTimeout(() => {
        setIndex(i =>
          dragX < 0
            ? (i + 1) % filteredCards.length
            : (i - 1 + filteredCards.length) % filteredCards.length
        );
        setDragX(0);
        setShow(false);
      }, 200);
    } else {
      setDragX(0);
    }
  };

  if (screen === "menu") {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0f172a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial"
      }}>
        <div style={{ marginBottom: 6, color: "#e2e8f0", fontWeight: 700 }}>
          Arakelov Roman
        </div>

        <div style={{
          background: "#e5e7eb",
          padding: 20,
          borderRadius: 20,
          width: 320
        }}>
          <h2 style={{
            textAlign: "center",
            color: "#020617",
            fontWeight: 800
          }}>
            📚 МОИ КАРТОЧКИ
          </h2>

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

  if (filteredCards.length === 0) {
    return <div style={{ color: "white", padding: 40 }}>Нет карточек</div>;
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

      {/* верх */}
      <div style={{
        width: "100%",
        maxWidth: 420,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "#94a3b8",
        marginBottom: 10
      }}>
        <div onClick={() => setScreen("menu")} style={{
          cursor: "pointer",
          fontSize: 18,
          fontWeight: 600
        }}>
          ← назад
        </div>

        <button onClick={() => {
          setOnlyFav(!onlyFav);
          setIndex(0);
        }} style={{
          width: 52,
          height: 52,
          borderRadius: 12,
          border: "none",
          background: onlyFav ? "#facc15" : "#334155",
          color: "white",
          fontSize: 26
        }}>★</button>
      </div>

      {/* карточка */}
      <div style={{
        width: "100%",
        maxWidth: 420,
        padding: "0 6px"
      }}>
        <div
          onClick={() => setShow(!show)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            width: "100%",
            height: "calc(100vh - 260px)",
            maxHeight: 420,
            minHeight: 220,
            borderRadius: 20,
            overflow: "hidden",
            transform: `translateX(${dragX}px)`,
            transition: dragX === 0 ? "0.3s" : "none"
          }}
        >

          {/* ⭐ */}
          <div onClick={toggleFavorite} style={{
            position: "absolute",
            top: 12,
            right: 12,
            fontSize: 28,
            zIndex: 10,
            color: favorites.includes(filteredCards[index].question)
              ? "#facc15"
              : "#9ca3af"
          }}>
            ★
          </div>

          {!show ? (
            <div style={{
              width: "100%",
              height: "100%",
              background: "#e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
              fontSize: "clamp(30px, 7vw, 40px)",
              fontWeight: 700,
              textAlign: "center",
              lineHeight: 1.6,
              color: "#111827",   // темнее текст
              wordBreak: "break-word"
            }}>
              {filteredCards[index].question}
            </div>
          ) : (
            <div style={{
              width: "100%",
              height: "100%",
              background: "#2563eb",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
              fontSize: "clamp(32px, 7vw, 42px)",
              fontWeight: 800,
              textAlign: "center",
              lineHeight: 1.6,
              wordBreak: "break-word"
            }}>
              {filteredCards[index].answer}
            </div>
          )}

        </div>
      </div>

      {/* низ */}
      <div style={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        padding: "16px 16px 24px" // ← увеличен отступ (3мм примерно)
      }}>
        <div style={{
          maxWidth: 420,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 12
        }}>

          {/* 🔀 */}
          <button onClick={shuffle} style={{
            width: "100%",
            height: 60,
            borderRadius: 18,
            background: "#334155",
            color: "white",
            fontSize: 30, // увеличен значок
            border: "none"
          }}>
            🔀
          </button>

          {/* стрелки */}
          <div style={{
            height: 70,
            background: "#1e293b",
            borderRadius: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px"
          }}>

            <button onClick={() => {
              setShow(false);
              setIndex(i => (i - 1 + filteredCards.length) % filteredCards.length);
            }} style={{
              width: 70,
              height: 48,
              borderRadius: 16,
              background: "#020617",
              color: "white",
              fontSize: 26,
              border: "none"
            }}>←</button>

            <div style={{ color: "white" }}>
              {index + 1} / {filteredCards.length}
            </div>

            <button onClick={() => {
              setShow(false);
              setIndex(i => (i + 1) % filteredCards.length);
            }} style={{
              width: 70,
              height: 48,
              borderRadius: 16,
              background: "#2563eb",
              color: "white",
              fontSize: 26,
              border: "none"
            }}>→</button>

          </div>

        </div>
      </div>

    </div>
  );
}