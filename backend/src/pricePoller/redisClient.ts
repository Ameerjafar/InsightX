import { createClient, RedisClientType } from "redis";

export class Redis {
  private client: RedisClientType;
  private subscriber: RedisClientType;

  constructor(private url: string) {
    this.client = createClient({
      url: this.url,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            return new Error("Too many retries, giving up!");
          }
          // retry after delay (ms)
          return Math.min(retries * 100, 3000);
        },
      },
    });

    this.subscriber = createClient({
      url: this.url,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            return new Error("Too many retries, giving up!");
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });
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
  async clear() {
    try {
      this.client.FLUSHDB(); 
      console.log('Redis cleared successfully');
    } catch (err) {
      console.error('Error clearing Redis:', err);
    }
  }
  async disconnect() {
    await this.subscriber.disconnect();
    await this.client.disconnect();
  }
}
