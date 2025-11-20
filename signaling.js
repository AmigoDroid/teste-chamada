import { WebSocketServer } from "ws";

export function createSignalingServer(server) {
  const wss = new WebSocketServer({ server });

  let clients = {}; // { username: ws }

  wss.on("connection", ws => {
    ws.on("message", message => {
      const data = JSON.parse(message);

      // Registrar usuário no WebSocket
      if (data.type === "register") {
        clients[data.name] = ws;
        return;
      }

      // Enviar mensagens (offer, answer, ice)
      if (data.to && clients[data.to]) {
        clients[data.to].send(JSON.stringify(data));
      }
    });

    ws.on("close", () => {
      for (let name in clients) {
        if (clients[name] === ws) delete clients[name];
      }
    });
  });

  console.log("WebSocket de sinalização ativo");
}
