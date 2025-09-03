import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
prisma.$connect()
  .then(() => {
    console.log('✅ Database connected successfully')
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error)
  })
process.on('beforeExit', async () => {
  console.log('🔄 Disconnecting from database...')
  await prisma.$disconnect()
  console.log('✅ Database disconnected')
})

process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...')
  await prisma.$disconnect()
  console.log('✅ Database disconnected')
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...')
  await prisma.$disconnect()
  console.log('✅ Database disconnected')
  process.exit(0)
})
