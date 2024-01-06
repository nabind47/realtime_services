import { Kafka } from "kafkajs";

import db from "./prisma.js";

export const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["192.168.1.64:9092"],
});

let producer = null;

async function createProducer() {
  if (producer) return producer;

  const _producer = kafka.producer();
  await _producer.connect();
  producer = _producer;

  return producer;
}

export async function produceMessage(message) {
  const producer = await createProducer();

  await producer.send({
    messages: [{ key: `message-${Date.now()}`, value: message }],
    topic: "MESSAGES",
  });
  return true;
}

export async function startMessageConsumer() {
  const consumer = kafka.consumer({ groupId: "defaut" });
  await consumer.connect();

  await consumer.subscribe({ topic: "MESSAGES", fromBeginning: true });
  await consumer.run({
    autoCommit: true,
    eachMessage: async ({ message, pause }) => {
      if (!message.value) return;

      try {
        await db.message.create({
          data: { text: message.value?.toString() },
        });
      } catch (error) {
        console.log(
          "Something went wrong while inserting into the database",
          error
        );
        pause();

        setTimeout(() => {
          consumer.resume([{ topic: "MESSAGES" }]);
        }, 60 * 1000);
      }
    },
  });
}
