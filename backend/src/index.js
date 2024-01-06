import http from "http";

import { startMessageConsumer } from "./services/kafka.js";
import SocketService from "./services/socket.js";

async function init() {
  startMessageConsumer();
  const socketService = new SocketService();

  const httpServer = http.createServer();
  const PORT = process.env.PORT ? process.env.PORT : 8000;

  socketService.io.attach(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
  });

  socketService.initListners();
}

init();
