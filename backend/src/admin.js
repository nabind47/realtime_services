import { kafka } from "./client.js";

async function init() {
  const admin = kafka.admin();
  console.log("ADMIN CONNECTING");
  admin.connect();
  console.log("ADMIN CONNECTED");

  await admin.createTopics({
    topics: [{ topic: "rider-updates", numPartitions: 2 }],
  });

  console.log("TOPIC CREATED");

  await admin.disconnect();

  console.log("DISCONNECTING");
}
init();
