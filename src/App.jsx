import { useState } from "react";

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
  { name: "Знаки", file: "/cards/Знаки.txt" },

  // старые оставил
  { name: "Дороги", file: "/cards/roads.txt" },
  { name: "Транспорт", file: "/cards/vehicles.txt" },
  { name: "Скорость", file: "/cards/speed.txt" },
  { name: "Знаки (старые)", file: "/cards/signs.txt" },
  { name: "Парковка", file: "/cards/parking.txt" }
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
      })
      .catch(() => {
        alert("Ошибка загрузки файла");
      });
  };

  const toggleFavorite = (e) => {
    e.stopPropagation();
    const q = cards[index].question;

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
      fontFamily: "Arial",
      boxSizing: "border-box"
    }}>

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

        <button onClick={shuffle} style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          border: "none",
          background: "#334155",
          color: "white",
          fontSize: 20
        }}>
          🔀
        </button>
      </div>

      <div style={{
        width: "100%",
        maxWidth: 420,
        padding: "0 4px",
        boxSizing: "border-box"
      }}>
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

            <div onClick={toggleFavorite} style={{
              position: "absolute",
              top: 10,
              right: 10,
              fontSize: 26,
              zIndex: 5
            }}>
              {favorites.includes(cards[index].question) ? "⭐" : "☆"}
            </div>

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
            setIndex(i => (i - 1 + cards.length) % cards.length);
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
            setIndex(i => (i + 1) % cards.length);
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