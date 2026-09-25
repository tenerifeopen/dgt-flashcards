import { useState, useEffect } from "react";

const topics = [
  { name: "Слова 1", file: "/cards/Слова 1.txt" },
  { name: "Слова 2", file: "/cards/Слова 2.txt" },
  { name: "Слова 3", file: "/cards/Слова 3.txt" },
  { name: "Слова 4", file: "/cards/Слова 4.txt" },
  { name: "Слова 5", file: "/cards/Слова 5.txt" },
  { name: "Слова 6", file: "/cards/Слова 6.txt" },
  { name: "Все слова", file: "/cards/Все слова.txt" },

  { name: "Словосочетания 1", file: "/cards/Словосочетания 1.txt" },
  { name: "Словосочетания 2", file: "/cards/Словосочетания 2.txt" },
  { name: "Словосочетания 3", file: "/cards/Словосочетания 3.txt" },
  { name: "Словосочетания 4", file: "/cards/Словосочетания 4.txt" },
  { name: "Словосочетания 5", file: "/cards/Словосочетания 5.txt" },
  { name: "Словосочетания 6", file: "/cards/Словосочетания 6.txt" },
  { name: "Словосочетания 7", file: "/cards/Словосочетания 7.txt" },
  { name: "Все словосочетания", file: "/cards/Все словосочетания.txt" },
  { name: "Для практического вождения", file: "/cards/Практическое вождение.txt" },
  { name: "Дополнительные карточки", file: "/cards/Дополнительные карточки.txt" }
];

export default function App() {
  const [accessStatus, setAccessStatus] = useState("checking");

  const [screen, setScreen] = useState("menu");
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [onlyFav, setOnlyFav] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  const [topicCounts, setTopicCounts] = useState({});

  const font = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

  useEffect(() => {
    const match = window.location.pathname.match(/^\/access\/([^/]+)\/?$/);

    if (!match) {
      setAccessStatus("denied");
      return;
    }

    const token = decodeURIComponent(match[1]);

    fetch("/api/access", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ token })
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Access denied");
        }

        return res.json();
      })
      .then((data) => {
        if (data.access === true) {
          setAccessStatus("granted");
        } else {
          setAccessStatus("denied");
        }
      })
      .catch(() => {
        setAccessStatus("denied");
      });
  }, []);

  useEffect(() => {
    if (accessStatus !== "granted") return;

    topics.forEach(async (t) => {
      try {
        const res = await fetch(t.file);
        const text = await res.text();
        const count = text.split("\n").filter(line => line.includes("=")).length;
        setTopicCounts(prev => ({ ...prev, [t.file]: count }));
      } catch (e) {
        console.error("Ошибка подсчета для", t.file);
      }
    });
  }, [accessStatus]);

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

  const registerActivity = () => {
    const match = window.location.pathname.match(/^\/access\/([^/]+)\/?$/);

    if (!match) return;

    const token = decodeURIComponent(match[1]);

    fetch("/api/access", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ token })
    }).catch(() => {});
  };

  const handleCardClick = () => {
    if (!show) {
      registerActivity();
    }

    setShow(!show);
  };

  const playAudioSafe = async (base64) => {
    const cleanBase64 = base64.includes(",") ? base64.split(",")[1] : base64;
    const byteCharacters = atob(cleanBase64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "audio/mpeg" });
    const url = URL.createObjectURL(blob);

    const audio = new Audio(url);
    audio.playbackRate = 0.9;

    await new Promise((resolve) => {
      audio.onloadeddata = resolve;
    });

    await audio.play();
  };

  const playGoogleSpeech = (text) => {
    if (!window.speechSynthesis) return;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);

    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;

    selectedVoice = voices.find(v => v.lang.startsWith('es') && v.name.includes('Jorge'));
    if (!selectedVoice) selectedVoice = voices.find(v => v.lang.startsWith('es') && v.name.includes('Google'));
    if (!selectedVoice) selectedVoice = voices.find(v => v.lang.startsWith('es') && v.name.includes('Microsoft'));
    if (!selectedVoice) selectedVoice = voices.find(v => v.lang.startsWith('es') && (v.name.includes('Premium') || v.name.includes('Enhanced')));
    if (!selectedVoice) selectedVoice = voices.find(v => v.lang === 'es-MX');
    if (!selectedVoice) selectedVoice = voices.find(v => v.lang === 'es-ES');
    if (!selectedVoice) selectedVoice = voices.find(v => v.lang.startsWith('es'));

    if (selectedVoice) {
      utterance.lang = selectedVoice.lang;
      utterance.voice = selectedVoice;
    } else {
      utterance.lang = "es-ES";
    }

    utterance.rate = 0.9;
    utterance.pitch = 0.9;

    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  const speak = async (e) => {
    e.stopPropagation();
    if (!current || isLoadingAudio) return;

    setIsLoadingAudio(true);

    const rawText = show ? current.answer : current.question;
    const cacheKey = `tts_${rawText.trim()}`;

    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        await playAudioSafe(cached);
        return;
      }

      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawText })
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert("ОШИБКА СЕРВЕРА: " + JSON.stringify(errorData));
        playGoogleSpeech(rawText);
        return;
      }

      const data = await res.json();

      if (data.audio) {
        try {
          localStorage.setItem(cacheKey, data.audio);
        } catch (err) {
          console.warn("Cache full");
        }

        await playAudioSafe(data.audio);
        return;
      }

      playGoogleSpeech(rawText);

    } catch (err) {
      alert("ОШИБКА ЗАПРОСА: " + err.message);
      playGoogleSpeech(rawText);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const clearBrowserCache = () => {
    if (window.confirm('Удалить весь кеш озвучки из браузера? (При следующем нажатии 🔊 голос скачается заново)')) {
      localStorage.clear();
      alert('Кеш очищен!');
    }
  };

  if (accessStatus !== "granted") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0f172a"
        }}
      />
    );
  }

  if (screen === "menu") {
    return (
      <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: font }}>
        <div style={{ color: "#A1A1A1", fontWeight: 600, fontSize: 18 }}>Roman Arakelov</div>
        <div style={{ background: "#e5e7eb", padding: 20, borderRadius: 20, width: 320 }}>
          <h2 style={{ textAlign: "center", color: "#000", fontSize: 26, fontWeight: 700 }}>📚 МОИ КАРТОЧКИ</h2>
          {topics.map((t, i) => (
            <button
              key={i}
              onClick={() => loadTopic(t.file)}
              style={{
                width: "100%",
                marginTop: 10,
                padding: "14px 18px",
                borderRadius: 12,
                border: "none",
                background: "#2563eb",
                color: "white",
                fontSize: 18,
                fontWeight: 500,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                textAlign: "left",
                gap: "10px"
              }}
            >
              <span style={{ flex: 1 }}>{t.name}</span>

              {topicCounts[t.file] !== undefined && (
                <span style={{ fontSize: 14, fontWeight: 400, color: "#1e3a8a", flexShrink: 0 }}>
                  {topicCounts[t.file]}
                </span>
              )}
            </button>
          ))}

          <button
            onClick={clearBrowserCache}
            style={{
              width: "100%",
              marginTop: 30,
              padding: 14,
              borderRadius: 12,
              border: "none",
              background: "#94a3b8",
              color: "white",
              fontSize: 16,
              fontWeight: 500
            }}
          >
            🗑️ Очистить кеш браузера
          </button>

        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 12px 160px", fontFamily: font }}>
      <div style={{ width: "100%", maxWidth: 420, display: "flex", justifyContent: "space-between", color: "#94a3b8" }}>
        <div onClick={() => setScreen("menu")}>← назад</div>
        <button
          onClick={() => setOnlyFav(!onlyFav)}
          style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            background: onlyFav ? "#facc15" : "#334155",
            fontSize: 26,
            border: "none"
          }}
        >
          ★
        </button>
      </div>

      <div style={{ width: "100%", maxWidth: 420, marginTop: 10 }}>
        <div
          onClick={handleCardClick}
          style={{
            width: "100%",
            height: "60vh",
            borderRadius: 20,
            overflow: "hidden",
            position: "relative"
          }}
        >
          <div
            onClick={toggleFavorite}
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              fontSize: 30,
              zIndex: 30,
              cursor: "pointer",
              color: favorites.includes(current?.question) ? "#facc15" : "#9ca3af"
            }}
          >
            ★
          </div>

          <button
            onClick={speak}
            disabled={isLoadingAudio}
            style={{
              position: "absolute",
              bottom: 14,
              right: 14,
              width: 70,
              height: 48,
              borderRadius: 16,
              background: isLoadingAudio ? "#64748b" : "#2563eb",
              color: "white",
              fontSize: 24,
              border: "none",
              zIndex: 30,
              cursor: isLoadingAudio ? "not-allowed" : "pointer",
              opacity: isLoadingAudio ? 0.7 : 1
            }}
          >
            {isLoadingAudio ? "⏳" : "🔊"}
          </button>

          <div
            style={{
              width: "100%",
              height: "100%",
              background: show ? "#2563eb" : "#e5e7eb",
              color: show ? "#fff" : "#000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <div
              style={{
                width: "100%",
                textAlign: "center",
                padding: 20,
                fontSize: "clamp(27px, 6vw, 40px)",
                fontWeight: show ? 700 : 500,
                lineHeight: 1.6
              }}
            >
              {show ? current?.answer : current?.question}
            </div>
          </div>
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: 420, marginTop: 12 }}>
        <button
          onClick={shuffle}
          style={{
            width: "100%",
            height: 70,
            borderRadius: 20,
            background: "#334155",
            border: "none",
            fontSize: 36
          }}
        >
          🔀
        </button>

        <div
          style={{
            marginTop: 10,
            height: 70,
            background: "#1e293b",
            borderRadius: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px"
          }}
        >
          <button
            onClick={() => {
              if (!filteredCards.length) return;
              setShow(false);
              setIndex(i => (i - 1 + filteredCards.length) % filteredCards.length);
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
            {filteredCards.length ? `${index + 1} / ${filteredCards.length}` : "0 / 0"}
          </div>

          <button
            onClick={() => {
              if (!filteredCards.length) return;
              setShow(false);
              setIndex(i => (i + 1) % filteredCards.length);
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