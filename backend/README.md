## Database Connection

```yml
postgres:
  image: postgres:10.3
  restart: always
  environment:
    - POSTGRES_USER=f2d
    - POSTGRES_PASSWORD=f2df2d
    - POSTGRES_DB=f2db
  volumes:
    - postgres:/var/lib/postgresql/data
  ports:
    - "5432:5432"

volumes:
  postgres:
```

```sh
npx prisma init --datasource-provider postgresql
```

```sh
DATABASE_URL="postgresql://f2d:f2df2d@localhost:5432/f2db?schema=public"
```

> [Prisma Postgresql](https://www.prisma.io/docs/orm/overview/databases/postgresql)

## Redis Connection

```yml
redis:
  image: redis:latest
  container_name: redis
  restart: always
  volumes:
    - redis_volume_data:/data
  ports:
    - 6379:6379
redis_insight:
  image: redislabs/redisinsight:latest
  container_name: redis_insight
  restart: always
  ports:
    - 8001:8001
  volumes:
    - redis_insight_volume_data:/db

volumes:
  redis_volume_data:
  redis_insight_volume_data:
```

```js
import { Redis } from "ioredis";

const client = new Redis({
  host: "localhost",
  port: 6379,
});

client.on("connect", () => {
  console.log("Connected to Redis");
});

client.get("name", (err, result) => {
  if (err) {
    console.error(err);
  } else {
    console.log(result);
  }
});
```

> [ioredis](https://www.npmjs.com/package/ioredis)

## Kafka

```yml
zookeeper:
  image: zookeeper
  ports:
    - "2181:2181"
kafka:
  image: confluentinc/cp-kafka
  ports:
    - "9092:9092"
  environment:
    KAFKA_ZOOKEEPER_CONNECT: "192.168.1.64:2181"
    KAFKA_ADVERTISED_LISTENERS: "PLAINTEXT://192.168.1.64:9092"
    KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
  depends_on:
    - zookeeper
```

```ts
import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["192.168.1.64:9092"],
});
```

```js
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
```

```js
import readline from "readline";

import { kafka } from "./client.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function init() {
  const producer = kafka.producer();

  console.log("Connecting Producer");
  await producer.connect();
  console.log("Producer Connected Successfully");

  rl.setPrompt("> ");
  rl.prompt();

  rl.on("line", async function (line) {
    const [riderName, location] = line.split(" ");
    await producer.send({
      topic: "rider-updates",
      messages: [
        {
          partition: location.toLowerCase() === "north" ? 0 : 1,
          key: "location-update",
          value: JSON.stringify({ name: riderName, location }),
        },
      ],
    });
  }).on("close", async () => {
    await producer.disconnect();
  });
}

init();
```

```js
import { kafka } from "./client.js";

const group = process.argv[2];

async function init() {
  const consumer = kafka.consumer({ groupId: group });
  await consumer.connect();

  await consumer.subscribe({ topics: ["rider-updates"], fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
      console.log(
        `${group}: [${topic}]: PART:${partition}:`,
        message.value.toString()
      );
    },
  });
}

init();
```
