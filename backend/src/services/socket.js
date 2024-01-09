import { Redis } from "ioredis";
import { Server } from "socket.io";

import { produceMessage } from "./kafka.js";

const pub = new Redis({
  host: "localhost",
  port: 6379,
});

const sub = new Redis({
  host: "localhost",
  port: 6379,
});

class SocketService {
  constructor() {
    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
      },
    });
    sub.subscribe("MESSAGES");
  }

  get io() {
    return this._io;
  }

  initListners() {
    const io = this.io;
    io.on("connect", (socket) => {
      socket.on("event:message", async ({ message }) => {
        await pub.publish("MESSAGES", JSON.stringify(message));
      });
    });

    sub.on("message", async (channel, message) => {
      if (channel === "MESSAGES") {
        io.emit("message", message);
        await produceMessage(message);
      }
    });
  }
}

export default SocketService;
