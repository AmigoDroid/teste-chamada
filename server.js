import express from "express";
import fs from "fs";
import cors from "cors";
import { createSignalingServer } from "./signaling.js";

const app = express();
app.use(cors());
app.use(express.json());

const USERS_FILE = "./users.json";

function loadUsers() {
  return JSON.parse(fs.readFileSync(USERS_FILE));
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// CADASTRO
app.post("/register", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Nome obrigatório" });

  let users = loadUsers();
  if (users.find(u => u.name === name)) {
    return res.status(400).json({ error: "Usuário já existe" });
  }

  users.push({ name });
  saveUsers(users);

  res.json({ success: true });
});

// LOGIN (só verifica se existe)
app.post("/login", (req, res) => {
  const { name } = req.body;
  let users = loadUsers();

  if (!users.find(u => u.name === name)) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }

  res.json({ success: true });
});

// LISTAR USUÁRIOS
app.get("/users", (req, res) => {
  res.json(loadUsers());
});

const server = app.listen(3002, () => {
  console.log("HTTP rodando na porta 3002");
});

// Iniciar WebSocket (sinalização)
createSignalingServer(server);
