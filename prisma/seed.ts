import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.SEED_USER_EMAIL ?? 'demo@example.com'
  const name = process.env.SEED_USER_NAME ?? 'Demo User'
  const plainPassword = process.env.SEED_USER_PASSWORD ?? 'DemoPass1!'

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })

  if (existing) {
    console.log(`Seed user already exists for email: ${email}`)
    return
  }

  const passwordHash = await bcrypt.hash(plainPassword, 12)

  await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      name,
      passwordHash,
      emailVerified: true,
    },
  })

  console.log(`Seed user created: ${email}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
