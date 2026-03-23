import express from "express";
import handler from "./api/tts.js";

const app = express();

app.use(express.json());

// 👉 подключаем твой tts
app.post("/api/tts", (req, res) => {
  return handler(req, res);
});

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(3000, () => {
  console.log("✅ Backend running on http://localhost:3000");
});