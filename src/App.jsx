import { useEffect, useState } from "react";

export default function App() {
  const [screen, setScreen] = useState("menu");
  const [topics, setTopics] = useState([]);
  const [topic, setTopic] = useState(null);

  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(false);

  const [randomMode, setRandomMode] = useState(false);
  const [favorites, setFavorites] = useState([]);

  // ===== темы =====
  useEffect(() => {
    fetch("/topics.txt")
      .then(res => res.text())
      .then(text => {
        const parsed = text
          .split("\n")
          .map(l => l.split("|"))
          .filter(a => a.length === 2)
          .map(([key, title]) => ({
            key: key.trim(),
            title: title.trim()
          }));

        setTopics(parsed);

        const savedTopic = localStorage.getItem("topic");
        if (savedTopic) {
          setTopic(savedTopic);
          setScreen("cards");
        }
      });
  }, []);

  // ===== карточки =====
  useEffect(() => {
    if (!topic) return;

    setIndex(0);

    fetch(`/cards/${topic}.txt`)
      .then(res => res.text())
      .then(text => {
        const parsed = text
          .split("\n")
          .map(l => l.split("="))
          .filter(a => a.length === 2)
          .map(([q, a]) => ({
            question: q.trim(),
            answer: a.trim()
          }));

        setCards(parsed);

        const savedIndex = localStorage.getItem("index_" + topic);
        if (savedIndex !== null) setIndex(Number(savedIndex));

        const savedFav = localStorage.getItem("fav");
        setFavorites(savedFav ? JSON.parse(savedFav) : []);

        setShow(false);
      });
  }, [topic]);

  // ===== сохранение =====
  useEffect(() => {
    if (topic) {
      localStorage.setItem("index_" + topic, index);
      localStorage.setItem("fav", JSON.stringify(favorites));
    }
  }, [index, favorites, topic]);

  if (topics.length === 0) {
    return <div style={{ padding: 40 }}>Загрузка...</div>;
  }

  // ===== МЕНЮ =====
  if (screen === "menu") {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#e5e7eb",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20
      }}>
        <div style={{
          width: "100%",
          maxWidth: 420,
          background: "white",
          borderRadius: 24,
          padding: 24
        }}>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
            📚 Мои карточки
          </div>

          {topics.map(t => (
            <button
              key={t.key}
              onClick={() => {
                setTopic(t.key);
                localStorage.setItem("topic", t.key);
                setScreen("cards");
              }}
              style={{
                width: "100%",
                marginBottom: 10,
                padding: 14,
                borderRadius: 16,
                border: "none",
                background: "#2563eb",
                color: "white",
                fontSize: 16
              }}
            >
              {t.title}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return <div style={{ color: "white", padding: 40 }}>Нет карточек</div>;
  }

  const favId = topic + "_" + index;
  const isFav = favorites.includes(favId);

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
            background: randomMode ? "#16a34a" : "#334155",
            color: "white",
            border: "none",
            borderRadius: 14,
            padding: "10px 14px",
            fontSize: 18
          }}
        >
          🔀
        </button>
      </div>

      {/* назад */}
      <div
        onClick={() => setScreen("menu")}
        style={{
          alignSelf: "flex-start",
          color: "#94a3b8",
          marginBottom: 10,
          cursor: "pointer"
        }}
      >
        ← назад
      </div>

      {/* карточка */}
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
              {cards[index]?.question}

              {/* ⭐ */}
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
                  background: "transparent",
                  border: "none",
                  fontSize: 26,
                  color: isFav ? "#facc15" : "#64748b"
                }}
              >
                ⭐
              </button>
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
              {cards[index]?.answer}
            </div>

          </div>
        </div>
      </div>

      {/* панель */}
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
          }} style={{ width: 70, height: 48, borderRadius: 16 }}>
            ←
          </button>

          <div style={{ color: "white" }}>
            {index + 1} / {cards.length}
          </div>

          <button onClick={() => {
            setShow(false);
            setIndex(i => {
              if (randomMode) {
                return Math.floor(Math.random() * cards.length);
              }
              return (i + 1) % cards.length;
            });
          }} style={{ width: 70, height: 48, borderRadius: 16 }}>
            →
          </button>

        </div>
      </div>

    </div>
  );
}