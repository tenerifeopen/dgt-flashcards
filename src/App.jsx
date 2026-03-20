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
    setDragX(e.touches[0].clientX - startX.current);
  };

  const handleTouchEnd = () => {
    if (Math.abs(dragX) > 60) {
      setDragX(dragX > 0 ? 400 : -400);

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
        <div style={{ color: "#e2e8f0", fontWeight: 700 }}>
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
                color: "white"
              }}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>
    );
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
        color: "#94a3b8"
      }}>
        <div onClick={() => setScreen("menu")} style={{ fontSize: 18 }}>
          ← назад
        </div>

        <button onClick={() => setOnlyFav(!onlyFav)} style={{
          width: 52,
          height: 52,
          borderRadius: 12,
          background: onlyFav ? "#facc15" : "#334155",
          fontSize: 26,
          border: "none"
        }}>
          ★
        </button>
      </div>

      {/* карточка */}
      <div style={{
        width: "100%",
        maxWidth: 420,
        marginTop: 10
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
            top: 14,
            right: 14,
            fontSize: 30,
            zIndex: 10,
            color: favorites.includes(filteredCards[index]?.question)
              ? "#facc15"
              : "#9ca3af"
          }}>
            ★
          </div>

          {/* ВОПРОС */}
          {!show ? (
            <div style={{
              width: "100%",
              height: "100%",
              background: "#e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
              textAlign: "center",
              fontSize: "clamp(26px, 6vw, 36px)",
              fontWeight: 700,
              color: "#0f172a",
              lineHeight: 1.5,
              overflowWrap: "break-word",
              wordBreak: "break-word"
            }}>
              <div style={{ maxWidth: "100%" }}>
                {filteredCards[index]?.question}
              </div>
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
              padding: 20,
              textAlign: "center",
              fontSize: "clamp(28px, 6vw, 38px)",
              fontWeight: 800,
              lineHeight: 1.5,
              overflowWrap: "break-word"
            }}>
              <div style={{ maxWidth: "100%" }}>
                {filteredCards[index]?.answer}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* низ */}
      <div style={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        padding: "20px 16px 24px"
      }}>
        <div style={{
          maxWidth: 420,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 14
        }}>

          {/* 🔀 */}
          <button onClick={shuffle} style={{
            width: "100%",
            height: 70,
            borderRadius: 20,
            background: "#334155",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36
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