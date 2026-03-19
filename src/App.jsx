import { useEffect, useState } from "react";

const topics = [
  { name: "Дороги", file: "/roads.txt" },
  { name: "Транспорт", file: "/vehicles.txt" },
  { name: "Скорость", file: "/speed.txt" },
  { name: "Слова и выражения", file: "/words.txt" },
  { name: "Знаки", file: "/signs.txt" },
  { name: "Парковка", file: "/parking.txt" }
];
export default function App() {
  const [screen, setScreen] = useState("menu");
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(false);
  const [favorites, setFavorites] = useState([]);

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

  const toggleFavorite = () => {
    const current = cards[index].question;
    if (favorites.includes(current)) {
      setFavorites(favorites.filter(f => f !== current));
    } else {
      setFavorites([...favorites, current]);
    }
  };

  const shuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setIndex(0);
    setShow(false);
  };

  // ===== МЕНЮ =====
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

  // ===== КАРТОЧКИ =====
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f172a",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "20px 12px 110px",
      fontFamily: "Arial",
      boxSizing: "border-box"
    }}>

      {/* ШАПКА */}
      <div style={{
        width: "100%",
        maxWidth: 420,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "#94a3b8",
        marginBottom: 10
      }}>
        <div onClick={() => setScreen("menu")} style={{ cursor: "pointer" }}>
          ← назад
        </div>

        <div>tenerifeopen</div>

        {/* 🔀 */}
        <button
          onClick={shuffle}
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            border: "none",
            background: "#334155",
            color: "white",
            fontSize: 20
          }}
        >
          🔀
        </button>
      </div>

      {/* КОНТЕЙНЕР */}
      <div style={{
        width: "100%",
        maxWidth: 420,
        padding: "0 4px",
        boxSizing: "border-box"
      }}>

        {/* КАРТОЧКА */}
        <div style={{
          width: "100%",
          height: "calc(100vh - 240px)",
          maxHeight: 420,
          minHeight: 220,
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

            {/* ⭐ */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite();
              }}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                fontSize: 24,
                zIndex: 2
              }}
            >
              {favorites.includes(cards[index].question) ? "⭐" : "☆"}
            </div>

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
              boxSizing: "border-box",
              fontSize: "clamp(22px, 6vw, 28px)",
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
              boxSizing: "border-box",
              fontSize: "clamp(24px, 7vw, 32px)",
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

      </div>

      {/* НИЖНЯЯ ПАНЕЛЬ */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
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

          <button onClick={() => {
            setShow(false);
            setIndex((i) => (i - 1 + cards.length) % cards.length);
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
            {index + 1} / {cards.length}
          </div>

          <button onClick={() => {
            setShow(false);
            setIndex((i) => (i + 1) % cards.length);
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
  );
}