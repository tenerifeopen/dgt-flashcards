import { useState, useEffect } from "react";

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

  const [anim, setAnim] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("favorites");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

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

  const current = filteredCards[index];

  const next = () => {
    setAnim("left");
    setTimeout(() => {
      setIndex(i => (i + 1) % filteredCards.length);
      setShow(false);
      setAnim("");
    }, 260);
  };

  const prev = () => {
    setAnim("right");
    setTimeout(() => {
      setIndex(i => (i - 1 + filteredCards.length) % filteredCards.length);
      setShow(false);
      setAnim("");
    }, 260);
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
        <div style={{
          color: "#ffffff",
          fontWeight: 800,
          fontSize: 28
        }}>
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
            fontSize: 24,
            fontWeight: 900,
            color: "#000"
          }}>
            📚 МОИ КАРТОЧКИ
          </h2>

          {topics.map((t, i) => (
            <button key={i}
              onClick={() => loadTopic(t.file)}
              style={{
                width: "100%",
                marginTop: 10,
                padding: 16,
                borderRadius: 12,
                border: "none",
                background: "#2563eb",
                color: "white",
                fontSize: 16
              }}>
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
      padding: "calc(env(safe-area-inset-top) + 20px) 12px 140px",
      fontFamily: "Arial"
    }}>

      {/* верх */}
      <div style={{
        width: "100%",
        maxWidth: 420,
        display: "flex",
        justifyContent: "space-between",
        color: "#94a3b8"
      }}>
        <div onClick={() => setScreen("menu")}>← назад</div>

        <button onClick={() => setOnlyFav(!onlyFav)} style={{
          width: 52,
          height: 52,
          borderRadius: 12,
          background: onlyFav ? "#facc15" : "#334155",
          fontSize: 26,
          border: "none"
        }}>★</button>
      </div>

      {/* карточка */}
      <div style={{
        width: "100%",
        maxWidth: 420,
        marginTop: 10,
        perspective: 1000
      }}>
        <div
          onClick={() => setShow(!show)}
          style={{
            width: "100%",
            height: "60vh",
            borderRadius: 20,
            position: "relative",

            transform: `
              translateX(${anim === "left" ? "-100%" : anim === "right" ? "100%" : "0"})
              rotateY(${show ? "180deg" : "0"})
            `,
            transition: "transform 0.35s ease",
            transformStyle: "preserve-3d"
          }}
        >

          {/* FRONT */}
          <div style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            background: "#e5e7eb",
            borderRadius: 20,
            backfaceVisibility: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20
          }}>
            <div style={{
              width: "100%",
              textAlign: "center",
              fontSize: "clamp(30px, 7vw, 40px)",
              fontWeight: 700
            }}>
              {current?.question}
            </div>
          </div>

          {/* BACK */}
          <div style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            background: "#2563eb",
            color: "white",
            borderRadius: 20,
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20
          }}>
            <div style={{
              width: "100%",
              textAlign: "center",
              fontSize: "clamp(30px, 7vw, 40px)",
              fontWeight: 700
            }}>
              {current?.answer}
            </div>
          </div>

          {/* ⭐ */}
          {current && (
            <div style={{
              position: "absolute",
              top: 14,
              right: 14,
              fontSize: 30,
              zIndex: 10,
              color: favorites.includes(current.question)
                ? "#facc15"
                : "#9ca3af"
            }}>
              ★
            </div>
          )}

        </div>
      </div>

      {/* низ */}
      <div style={{
        width: "100%",
        maxWidth: 420,
        marginTop: 10
      }}>
        <button style={{
          width: "100%",
          height: 70,
          borderRadius: 20,
          background: "#334155",
          border: "none",
          fontSize: 36
        }}>🔀</button>

        <div style={{
          marginTop: 10,
          height: 70,
          background: "#1e293b",
          borderRadius: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px"
        }}>

          <button onClick={prev}>←</button>

          <div style={{ color: "white" }}>
            {index + 1} / {filteredCards.length}
          </div>

          <button onClick={next}>→</button>

        </div>
      </div>
    </div>
  );
}