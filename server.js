require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Comment = require("./models/Comment");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch((err) => console.error("❌ Error al conectar a MongoDB:", err));

// GET
app.get("/comments", async (req, res) => {
  try {
    const comments = await Comment.find().sort({ date: -1 }); // Ordenar del más nuevo al más viejo
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST
app.post("/comments", async (req, res) => {
  try {
    const { username, message } = req.body;

    if (!username || username.trim().length === 0 || username.length > 50) {
      return res
        .status(400)
        .json({ message: "Usuario inválido o excede los 50 caracteres." });
    }
    if (!message || message.trim().length < 5 || message.length > 300) {
      return res
        .status(400)
        .json({ message: "El mensaje debe tener entre 5 y 300 caracteres." });
    }

    const newComment = new Comment({
      username: username.trim(),
      message: message.trim(),
    });

    const savedComment = await newComment.save();
    res.status(201).json(savedComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE
app.delete("/comments/:id", async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: "Comentario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Iniciar servidor
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
}

// Exportar la aplicación para que Vercel la procese como Serverless Function
module.exports = app;
