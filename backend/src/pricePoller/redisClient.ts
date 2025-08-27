import { createClient, RedisClientType } from "redis";

export class Redis {
  private publisher: RedisClientType;
  private subscriber: RedisClientType;

  constructor(private url: string) {
    this.publisher = createClient({ url });
    this.subscriber = createClient({ url });
  }

  async connect() {
    await this.publisher.connect();
    await this.subscriber.connect();
    console.log("✅ Connected to Redis Pub/Sub");
  }

  async publish(channel: string, message: string) {
    await this.publisher.publish(channel, message);
    console.log(`📢 Published to [${channel}]: ${message}`);
  }

  async subscribe(channel: string, handler: (msg: string) => void) {
    await this.subscriber.subscribe(channel, (message) => {
      console.log(`📩 Received on [${channel}]: ${message}`);
      handler(message);
    });
  }
  async disconnect() {
    await this.publisher.disconnect();
    await this.subscriber.disconnect();
  }
}
