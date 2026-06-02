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
  { name: "Ловушки", file: "/cards/Ловушки.txt" },
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

  const font = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

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

  const playAudioSafe = async (base64) => {
    const byteCharacters = atob(base64.split(",")[1]);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "audio/mpeg" });
    const url = URL.createObjectURL(blob);

    const audio = new Audio(url);

    await new Promise((resolve) => {
      audio.onloadeddata = resolve;
    });

    await audio.play();
  };

  // 🔉 ОЗВУЧКА ГУГЛ (АГРЕССИВНЫЙ ФИКС ДЛЯ АЙФОНА)
  const playGoogleSpeech = (text) => {
    if (!window.speechSynthesis) return;

    // Айфон часто сбрасывает голос, если делать cancel и speak без паузы
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;
    
    // 1. Ищем Jorge
    selectedVoice = voices.find(v => v.lang.startsWith('es') && v.name.includes('Jorge'));
    // 2. Гугл
    if (!selectedVoice) selectedVoice = voices.find(v => v.lang.startsWith('es') && v.name.includes('Google'));
    // 3. Microsoft
    if (!selectedVoice) selectedVoice = voices.find(v => v.lang.startsWith('es') && v.name.includes('Microsoft'));
    // 4. Premium/Enhanced
    if (!selectedVoice) selectedVoice = voices.find(v => v.lang.startsWith('es') && (v.name.includes('Premium') || v.name.includes('Enhanced')));
    // 5. es-MX (Мексиканский - часто мужской на айфоне)
    if (!selectedVoice) selectedVoice = voices.find(v => v.lang === 'es-MX');
    // 6. es-ES
    if (!selectedVoice) selectedVoice = voices.find(v => v.lang === 'es-ES');
    // 7. Любой испанский
    if (!selectedVoice) selectedVoice = voices.find(v => v.lang.startsWith('es'));

    if (selectedVoice) {
      // ВАЖНО: Сначала lang, потом voice! Айфон так лучше понимает.
      utterance.lang = selectedVoice.lang;
      utterance.voice = selectedVoice;
    } else {
      utterance.lang = "es-ES";
    }

    utterance.rate = 0.9;     
    utterance.pitch = 0.9;    

    // ФИКС SAFARI: Даем айфону 100 миллисекунд на "переваривание" отмены,
    // иначе он злится и ставит женский голос по умолчанию.
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  const speak = async (e) => {
    e.stopPropagation();
    if (!current) return;

    const rawText = show ? current.answer : current.question;

    const text = rawText
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

    const cacheKey = `tts_${text}`;

    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        await playAudioSafe(cached);
        return;
      }

      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });

      if (!res.ok) {
        playGoogleSpeech(rawText);
        return;
      }

      const data = await res.json();

      if (data.audio) {
        try { localStorage.setItem(cacheKey, data.audio); } catch (err) { console.warn("Cache full"); }
        await playAudioSafe(data.audio);
        return;
      }

      if (data.fallback) {
        playGoogleSpeech(rawText);
        return;
      }

      throw new Error("Unexpected response");

    } catch (err) {
      playGoogleSpeech(rawText);
    }
  };

  if (screen === "menu") {
    return (
      <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: font }}>
        <div style={{ color: "#A1A1A1", fontWeight: 600, fontSize: 18 }}>Roman Arakelov</div>
        <div style={{ background: "#e5e7eb", padding: 20, borderRadius: 20, width: 320 }}>
          <h2 style={{ textAlign: "center", color: "#000", fontSize: 26, fontWeight: 700 }}>📚 МОИ КАРТОЧКИ</h2>
          {topics.map((t, i) => (
            <button key={i} onClick={() => loadTopic(t.file)} style={{ width: "100%", marginTop: 10, padding: 18, borderRadius: 12, border: "none", background: "#2563eb", color: "white", fontSize: 18, fontWeight: 500 }}>
              {t.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 12px 160px", fontFamily: font }}>
      <div style={{ width: "100%", maxWidth: 420, display: "flex", justifyContent: "space-between", color: "#94a3b8" }}>
        <div onClick={() => setScreen("menu")}>← назад</div>
        <button onClick={() => setOnlyFav(!onlyFav)} style={{ width: 52, height: 52, borderRadius: 12, background: onlyFav ? "#facc15" : "#334155", fontSize: 26, border: "none" }}>★</button>
      </div>

      <div style={{ width: "100%", maxWidth: 420, marginTop: 10 }}>
        <div onClick={() => setShow(!show)} style={{ width: "100%", height: "60vh", borderRadius: 20, overflow: "hidden", position: "relative" }}>
          <div onClick={toggleFavorite} style={{ position: "absolute", top: 14, right: 14, fontSize: 30, zIndex: 30, cursor: "pointer", color: favorites.includes(current?.question) ? "#facc15" : "#9ca3af" }}>★</div>
          <button onClick={speak} style={{ position: "absolute", bottom: 14, right: 14, width: 70, height: 48, borderRadius: 16, background: "#2563eb", color: "white", fontSize: 24, border: "none", zIndex: 30 }}>🔊</button>
          <div style={{ width: "100%", height: "100%", background: show ? "#2563eb" : "#e5e7eb", color: show ? "#fff" : "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "100%", textAlign: "center", padding: 20, fontSize: "clamp(27px, 6vw, 40px)", fontWeight: show ? 700 : 500, lineHeight: 1.6 }}>
              {show ? current?.answer : current?.question}
            </div>
          </div>
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: 420, marginTop: 12 }}>
        <button onClick={shuffle} style={{ width: "100%", height: 70, borderRadius: 20, background: "#334155", border: "none", fontSize: 36 }}>🔀</button>
        <div style={{ marginTop: 10, height: 70, background: "#1e293b", borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
          <button onClick={() => { if (!filteredCards.length) return; setShow(false); setIndex(i => (i - 1 + filteredCards.length) % filteredCards.length); }} style={{ width: 70, height: 48, borderRadius: 16, background: "#020617", color: "white", fontSize: 26, border: "none" }}>←</button>
          <div style={{ color: "white" }}>{filteredCards.length ? `${index + 1} / ${filteredCards.length}` : "0 / 0"}</div>
          <button onClick={() => { if (!filteredCards.length) return; setShow(false); setIndex(i => (i + 1) % filteredCards.length); }} style={{ width: 70, height: 48, borderRadius: 16, background: "#2563eb", color: "white", fontSize: 26, border: "none" }}>→</button>
        </div>
      </div>
    </div>
  );
}