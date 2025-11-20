import { WebSocketServer } from "ws";

export function createSignalingServer(server) {
  const wss = new WebSocketServer({ server });

  // { username: websocket }
  let clients = {};

  wss.on("connection", ws => {
    let currentUser = null;

    ws.on("message", raw => {
      let data;
      try {
        data = JSON.parse(raw);
      } catch (e) {
        console.log("JSON inválido recebido:", raw);
        return;
      }

      // 📌 Registrar usuário
      if (data.type === "register") {
        currentUser = data.name;
        clients[currentUser] = ws;
        console.log(`Usuário conectado: ${currentUser}`);
        return;
      }

      // 📌 Se for iniciar chamada → avisa o outro usuário
      if (data.type === "offer") {
        const target = data.to;
        if (clients[target]) {
          // 🔔 EVENTO QUE O SEU APP ESPERA
          clients[target].send(
            JSON.stringify({
              type: "incoming_call",
              from: currentUser
            })
          );

          // Envia a offer normalmente
          clients[target].send(JSON.stringify(data));
        }
        return;
      }

      // 📌 Repassa answer, ice, etc.
      if (data.to && clients[data.to]) {
        clients[data.to].send(JSON.stringify(data));
      }
    });

    ws.on("close", () => {
      if (currentUser && clients[currentUser]) {
        delete clients[currentUser];
        console.log(`Usuário desconectado: ${currentUser}`);
      }
    });
  });

  console.log("WebSocket de sinalização ativo");
}
