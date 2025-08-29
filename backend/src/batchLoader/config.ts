export const config = {
    dbUrl: {
     timescale:{
        url: "postgresql://ameerjafar123:HwcR9AvthV8W@ep-red-thunder-a5e56t0g-pooler.us-east-2.aws.neon.tech/neontech"
     },
     postgres: {
        url: process.env.DATABASE_URL
     }
    },
    server: {
        port: process.env.PORT || "3000",
        nodeenv: process.env.NODE_ENV || "dev",
        jwtSecret: process.env.JWT_SECRET || "secret"
    },
    redis:{
        url: process.env.REDIS_URL || "redis://localhost:6379"
    },
    ws:{
        port: process.env.WS_PORT || 8080
    },
    kafka: {
    brokerUrl: process.env.KAFKA_BROKER_URL || "localhost:9092"
  }
}