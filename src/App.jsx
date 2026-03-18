import { useEffect, useState } from "react";

export default function App() {
  const [screen, setScreen] = useState("menu");
  const [topics, setTopics] = useState([]);
  const [topic, setTopic] = useState(null);

  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(false);

  // 🔹 загрузка тем
  useEffect(() => {
    fetch("/topics.txt")
      .then(res => res.text())
      .then(text => {
        const parsed = text
          .split("\n")
          .map(line => line.split("|"))
          .filter(arr => arr.length === 2)
          .map(([key, title]) => ({
            key: key.trim(),
            title: title.trim()
          }));

        setTopics(parsed);
      });
  }, []);

  // 🔹 загрузка карточек при выборе темы
  useEffect(() => {
    if (!topic) return;

    fetch(`/cards/${topic}.txt`)
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
      });
  }, [topic]);

  // 🔹 экран загрузки
  if (topics.length === 0) {
    return <div style={{ padding: 40 }}>Загрузка...</div>;
  }

  // ==================================================
  // 📱 МЕНЮ
  // ==================================================
  if (screen === "menu") {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20
      }}>
        <div style={{
          width: "100%",
          maxWidth: 420,
          background: "white",
          borderRadius: 24,
          padding: 24,
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
        }}>
          <div style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 20
          }}>
            📚 Мои карточки
          </div>

          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            maxHeight: "60vh",
            overflowY: "auto"
          }}>
            {topics.map(t => (
              <button
                key={t.key}
                onClick={() => {
                  setTopic(t.key);
                  setScreen("cards");
                }}
                style={{
                  padding: "14px 16px",
                  borderRadius: 16,
                  border: "none",
                  background: "#2563eb",
                  color: "white",
                  fontSize: 16,
                  fontWeight: 600
                }}
              >
                {t.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==================================================
  // 🎴 КАРТОЧКИ (твоя логика)
  // ==================================================
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
        padding: "0 4px"
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
        left: 0,
        width: "100%",
        padding: "12px 16px 20px"
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
              setIndex((i) => (i - 1 + cards.length) % cards.length);
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
              setIndex((i) => (i + 1) % cards.length);
            }}
          >
            →
          </button>

        </div>
      </div>

    </div>
  );
}import { useEffect, useState } from "react";

export default function App() {
  const [screen, setScreen] = useState("menu");
  const [topics, setTopics] = useState([]);
  const [topic, setTopic] = useState(null);

  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(false);

  // 🔹 загрузка тем
  useEffect(() => {
    fetch("/topics.txt")
      .then(res => res.text())
      .then(text => {
        const parsed = text
          .split("\n")
          .map(line => line.split("|"))
          .filter(arr => arr.length === 2)
          .map(([key, title]) => ({
            key: key.trim(),
            title: title.trim()
          }));

        setTopics(parsed);
      });
  }, []);

  // 🔹 загрузка карточек при выборе темы
  useEffect(() => {
    if (!topic) return;

    fetch(`/cards/${topic}.txt`)
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
      });
  }, [topic]);

  // 🔹 экран загрузки
  if (topics.length === 0) {
    return <div style={{ padding: 40 }}>Загрузка...</div>;
  }

  // ==================================================
  // 📱 МЕНЮ
  // ==================================================
  if (screen === "menu") {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20
      }}>
        <div style={{
          width: "100%",
          maxWidth: 420,
          background: "white",
          borderRadius: 24,
          padding: 24,
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
        }}>
          <div style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 20
          }}>
            📚 Мои карточки
          </div>

          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            maxHeight: "60vh",
            overflowY: "auto"
          }}>
            {topics.map(t => (
              <button
                key={t.key}
                onClick={() => {
                  setTopic(t.key);
                  setScreen("cards");
                }}
                style={{
                  padding: "14px 16px",
                  borderRadius: 16,
                  border: "none",
                  background: "#2563eb",
                  color: "white",
                  fontSize: 16,
                  fontWeight: 600
                }}
              >
                {t.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==================================================
  // 🎴 КАРТОЧКИ (твоя логика)
  // ==================================================
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
        padding: "0 4px"
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
        left: 0,
        width: "100%",
        padding: "12px 16px 20px"
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
              setIndex((i) => (i - 1 + cards.length) % cards.length);
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
              setIndex((i) => (i + 1) % cards.length);
            }}
          >
            →
          </button>

        </div>
      </div>

    </div>
  );
}