import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";

import { startMessageConsumer } from "./services/kafka.js";
import db from "./services/prisma.js";
import SocketService from "./services/socket.js";

dotenv.config({ path: "./env" });

async function init() {
  startMessageConsumer();
  const socketService = new SocketService();

  const app = express();
  app.use(cors({ allowedHeaders: ["*"] }));

  const httpServer = createServer(app);
  const PORT = process.env.PORT || 8000;

  // Attach Socket.io to the Express server
  socketService.io.attach(httpServer);

  // Define a simple route
  app.get("/messages", async (_, res) => {
    const messages = await db.message.findMany();
    return res.status(200).json(messages);
  });

  httpServer.listen(PORT, () => console.log(`Server is running on ${PORT}`));

  socketService.initListners();
}

init();
