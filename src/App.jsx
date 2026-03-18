import { useState } from "react";
import { cards } from "./cards";

export default function App() {
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(false);

  return (
    <div style={{
      maxWidth: 420,
      margin: "0 auto",
      padding: "30px 20px",
      textAlign: "center",
      fontFamily: "Arial"
    }}>
      
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 5 }}>
        DGT Flashcards
      </h1>

      <p style={{ color: "#6b7280", marginBottom: 20 }}>
        Нажми на карту, чтобы увидеть ответ
      </p>

      {/* Карточка */}
      <div style={{ perspective: 1000, marginBottom: 40 }}>
        <div
          onClick={() => setShow(!show)}
          style={{
            height: 200,
            position: "relative",
            transformStyle: "preserve-3d",
            transition: "transform 0.5s",
            transform: show ? "rotateY(180deg)" : "rotateY(0deg)",
            cursor: "pointer"
          }}
        >
          {/* Вопрос */}
          <div style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            background: "#f3f4f6",
            borderRadius: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            fontWeight: 700,
            fontSize: 26,   // 👈 увеличенный текст
            color: "#1f2937"
          }}>
            {cards[index].question}
          </div>

          {/* Ответ */}
          <div style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            background: "#2563eb",
            color: "white",
            borderRadius: 20,
            transform: "rotateY(180deg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            fontWeight: 800,
            padding: 20
          }}>
            {cards[index].answer}
          </div>
        </div>
      </div>

      {/* Кнопки */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 15,
        background: "#f1f5f9",
        borderRadius: 20,
        boxShadow: "0 5px 15px rgba(0,0,0,0.08)"
      }}>

        <button
          onClick={() => { setShow(false); setIndex((i) => (i - 1 + cards.length) % cards.length); }}
          style={{
            width: 70,
            height: 50,
            borderRadius: 15,
            background: "#e5e7eb",
            border: "none",
            fontSize: 22
          }}
        >
          ←
        </button>

        <div style={{ fontWeight: 700, color: "#2563eb" }}>
          {index + 1} / {cards.length}
        </div>

        <button
          onClick={() => { setShow(false); setIndex((i) => (i + 1) % cards.length); }}
          style={{
            width: 70,
            height: 50,
            borderRadius: 15,
            background: "#2563eb",
            color: "white",
            border: "none",
            fontSize: 22,
            boxShadow: "0 5px 10px rgba(37,99,235,0.3)"
          }}
        >
          →
        </button>

      </div>

      <div style={{ marginTop: 20, fontSize: 12, color: "#9ca3af" }}>
        EXAMEN DGT 🚗
      </div>
    </div>
  );
}