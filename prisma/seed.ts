import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const reviewers = [
  { email: 'emma@example.com', name: 'Emma Martin' },
  { email: 'lucas@example.com', name: 'Lucas Bernard' },
  { email: 'chloe@example.com', name: 'Chloe Nguyen' },
  { email: 'noah@example.com', name: 'Noah Thompson' },
  { email: 'sofia@example.com', name: 'Sofia Rossi' },
  { email: 'liam@example.com', name: 'Liam Walker' },
]

const reviewComments: Record<number, string[]> = {
  5: [
    'Absolutely love it. The quality is even better than the photos.',
    'Exactly what I was looking for. Arrived quickly and well packaged.',
    'Great value for the price, I already ordered a second one.',
    'Beautifully made and feels built to last. Highly recommend.',
  ],
  4: [
    'Really good overall. Slightly different from what I pictured, but I am happy with it.',
    'Solid quality and looks great. Delivery took a couple of extra days.',
    'Very nice, does exactly what it says. Would buy again.',
  ],
  3: [
    'Decent, but not quite as premium as I hoped for the price.',
    'It does the job. The colour is a bit different from the pictures.',
  ],
}

// Small stable string hash so the generated reviews are identical on every run
const hash = (value: string) => value.split('').reduce((total, char) => (total * 31 + char.charCodeAt(0)) >>> 0, 7)

// Categories and products come from the SQL migrations (prisma/migrations).
// This seed only creates dev accounts and sample reviews: credentials must never ship in a migration.
async function main() {
  // Create or find admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  })

  // Create or find regular user for testing
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: await bcrypt.hash('user123', 12),
      name: 'John Doe',
      role: 'USER',
    },
  })

  // Add some sample reviews
  const sampleReviews = [
    {
      userId: regularUser.id,
      productId: 'prod_iphone_15_pro',
      rating: 5,
      comment: 'Amazing phone! The camera quality is exceptional and the performance is smooth.',
    },
    {
      userId: adminUser.id,
      productId: 'prod_macbook_pro_m3',
      rating: 5,
      comment: 'Perfect for development work. The M3 chip handles everything I throw at it.',
    },
    {
      userId: regularUser.id,
      productId: 'prod_designer_denim_jeans',
      rating: 4,
      comment: 'Great quality denim, fits perfectly. Will definitely buy again.',
    },
  ]

  const reviewerPassword = await bcrypt.hash('reviewer123', 12)
  const reviewerUsers = []
  for (const reviewer of reviewers) {
    reviewerUsers.push(
      await prisma.user.upsert({
        where: { email: reviewer.email },
        update: {},
        create: { ...reviewer, password: reviewerPassword, role: 'USER' },
      })
    )
  }

  // 1 to 4 reviews per product, picked deterministically so every run produces the same catalog
  const products = await prisma.product.findMany({ select: { id: true }, orderBy: { id: 'asc' } })
  for (const product of products) {
    const seed = hash(product.id)
    for (let index = 0; index < (seed % 4) + 1; index++) {
      const roll = hash(`${product.id}:${index}`) % 10
      const rating = roll < 6 ? 5 : roll < 9 ? 4 : 3
      const comments = reviewComments[rating]
      sampleReviews.push({
        userId: reviewerUsers[(seed + index) % reviewerUsers.length].id,
        productId: product.id,
        rating,
        comment: comments[roll % comments.length],
      })
    }
  }

  for (const review of sampleReviews) {
    await prisma.review.upsert({
      where: { userId_productId: { userId: review.userId, productId: review.productId } },
      update: {},
      create: review,
    })
  }

  // Same aggregates the reviews API maintains when a customer posts a review
  await prisma.$executeRaw`
    UPDATE "products" SET
      "averageRating" = COALESCE((SELECT AVG("rating") FROM "reviews" WHERE "productId" = "products"."id"), 0),
      "reviewCount" = (SELECT COUNT(*) FROM "reviews" WHERE "productId" = "products"."id")
  `

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })