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

  const [anim, setAnim] = useState(""); // 👉 анимация

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

  const toggleFavorite = (e) => {
    e.stopPropagation();
    if (!current) return;

    if (favorites.includes(current.question)) {
      setFavorites(favorites.filter(f => f !== current.question));
    } else {
      setFavorites([...favorites, current.question]);
    }
  };

  const shuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setIndex(0);
    setShow(false);
  };

  // 👉 переход вправо
  const next = () => {
    if (!filteredCards.length) return;

    setAnim("left");
    setTimeout(() => {
      setIndex(i => (i + 1) % filteredCards.length);
      setShow(false);
      setAnim("");
    }, 200);
  };

  // 👉 переход влево
  const prev = () => {
    if (!filteredCards.length) return;

    setAnim("right");
    setTimeout(() => {
      setIndex(i => (i - 1 + filteredCards.length) % filteredCards.length);
      setShow(false);
      setAnim("");
    }, 200);
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
        <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 26 }}>
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
            fontSize: 22
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
                color: "white"
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
        marginTop: 10
      }}>
        <div
          onClick={() => current && setShow(!show)}
          style={{
            width: "100%",
            height: "60vh",
            borderRadius: 20,
            overflow: "hidden",
            position: "relative",

            transform:
              anim === "left"
                ? "translateX(-100%)"
                : anim === "right"
                ? "translateX(100%)"
                : "translateX(0)",

            transition: "transform 0.2s"
          }}
        >

          {current && (
            <div onClick={toggleFavorite} style={{
              position: "absolute",
              top: 14,
              right: 14,
              fontSize: 30,
              zIndex: 10,
              color: favorites.includes(current.question)
                ? "#facc15"
                : "#9ca3af"
            }}>★</div>
          )}

          <div style={{
            width: "100%",
            height: "100%",
            background: show ? "#2563eb" : "#e5e7eb",
            color: show ? "white" : "#0f172a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            fontSize: "clamp(30px, 7vw, 40px)",
            textAlign: "center"
          }}>
            {show ? current?.answer : current?.question}
          </div>

        </div>
      </div>

      {/* низ */}
      <div style={{
        width: "100%",
        maxWidth: 420,
        marginTop: 10
      }}>
        <button onClick={shuffle} style={{
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

          <button onClick={prev} style={{
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

          <button onClick={next} style={{
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