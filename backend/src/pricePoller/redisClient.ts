import { createClient, RedisClientType } from "redis";

export class Redis {
  private client: RedisClientType;
  private subscriber: RedisClientType;

  constructor(private url: string) {
    this.client = createClient({ url });
    this.subscriber = createClient({ url });
  }

  async connect() {
    await this.client.connect();
    await this.subscriber.connect();
    console.log("✅ Connected to Redis Queue + Pub/Sub");
  }

  async enqueue(queueName: string, message: string) {
    await this.client.lPush(queueName, message);
    console.log(`📤 Enqueued to [${queueName}]: ${message}`);
  }

  async dequeue(queueName: string): Promise<string | null> {
    const result = await this.client.brPop(queueName, 0); 
    if (result) {
      console.log(`📥 Dequeued from [${queueName}]: ${result.element}`);
      return result.element;
    }
    return null;
  }
  async publish(channel: string, message: string) {
    await this.client.publish(channel, message);
    console.log(`📢 Published to [${channel}]: ${message}`);
  }
  async subscribe(channel: string, handler: (message: string) => void) {
    await this.subscriber.subscribe(channel, (message) => {
      console.log(`🔔 Received from [${channel}]: ${message}`);
      handler(message);
    });
  }

  async disconnect() {
    await this.subscriber.disconnect();
    await this.client.disconnect();
  }
}
