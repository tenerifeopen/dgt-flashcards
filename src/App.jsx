import { useState } from "react";

export default function App() {
  const cards = [
    { question: "¿Cómo se considera a una persona que empuja un ciclomotor?", answer: "Peatón" },
    { question: "Velocidad máxima: Turismo en carretera convencional", answer: "90 km/h" },
    { question: "Velocidad máxima: Pick-up en autovía", answer: "120 km/h" },
    { question: "Límite: Calle con plataforma única", answer: "20 km/h" },
    { question: "Velocidad máxima: Vehículo mixto en autopista", answer: "100 km/h" },
    { question: "Distancia de seguridad", answer: "2 - 3 seg" },
    { question: "Velocidad máxima: Autobús en convencional", answer: "80 km/h" },
    { question: "Límite: Vía urbana 2+ carriles por sentido", answer: "50 km/h" },
    { question: "Velocidad máxima: Ciclomotor", answer: "45 km/h" },
    { question: "Velocidad máxima: Calle residencial (S-28)", answer: "20 km/h" },
    { question: "¿Puede un мопед ехать по автомагистрали?", answer: "No" },
    { question: "Adelantamiento: ¿+20 km/h permitido?", answer: "No" },
    { question: "Velocidad mínima: Autopista / Autovía", answer: "60 km/h" },
    { question: "Velocidad máxima: Camión en convencional", answer: "80 km/h" },
    { question: "Velocidad máxima: VMP", answer: "25 km/h" },
    { question: "Reducción Mercancías Peligrosas", answer: "-10 km/h" },
    { question: "Límite: Vía urbana 1 carril por sentido", answer: "30 km/h" },
    { question: "Velocidad máxima: Turismo con remolque en autovía", answer: "90 km/h" },
    { question: "¿Línea amarilla continua?", answer: "Prohibido parar/estacionar" },
    { question: "¿Línea amarilla discontinua?", answer: "Prohibido estacionar" },
    { question: "Alcohol: Novel", answer: "0.15 mg/l" },
    { question: "Alcohol: General", answer: "0.25 mg/l" },
    { question: "ITV: Turismo > 10 años", answer: "Anual" },
    { question: "Chaleco reflectante: ¿Cuándo?", answer: "Vía interurbana" },
    { question: "Velocidad máxima: Motocicleta en convencional", answer: "90 km/h" },
    { question: "Uso de móvil con soporte", answer: "Permitido" },
    { question: "Luz V-16", answer: "Luz de emergencia" },
    { question: "Velocidad mínima: Convencional", answer: "45 km/h" },
    { question: "Tractor con remolque: Máxima", answer: "25 km/h" },
    { question: "Señal S-3", answer: "Vía para autos" },
    { question: "¿Adelantar por la derecha en autopista?", answer: "No" },
    { question: "¿Prioridad en glorietas?", answer: "El de dentro" }
  ];

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