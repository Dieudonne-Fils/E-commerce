import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create or find categories
  const electronics = await prisma.category.upsert({
    where: { name: 'Electronics' },
    update: {},
    create: {
      name: 'Electronics',
      description: 'Electronic devices and accessories',
    },
  })

  const clothing = await prisma.category.upsert({
    where: { name: 'Clothing' },
    update: {},
    create: {
      name: 'Clothing',
      description: 'Fashion and apparel',
    },
  })

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

  // Create sample products
  const products = [
    {
      name: 'iPhone 15 Pro',
      description: 'Latest iPhone with titanium design and advanced camera system. Perfect for photography enthusiasts and professionals.',
      price: 999.99,
      stock: 50,
      categoryId: electronics.id,
      featured: true,
      averageRating: 4.8,
      reviewCount: 324,
    },
    {
      name: 'MacBook Pro M3',
      description: 'Powerful laptop with M3 chip for professionals. Exceptional performance for development and creative work.',
      price: 2499.99,
      stock: 25,
      categoryId: electronics.id,
      featured: true,
      averageRating: 4.9,
      reviewCount: 156,
    },
    {
      name: 'Premium Cotton T-Shirt',
      description: 'Ultra-soft organic cotton t-shirt with perfect fit. Available in multiple colors.',
      price: 29.99,
      stock: 100,
      categoryId: clothing.id,
      featured: false,
      averageRating: 4.3,
      reviewCount: 89,
    },
    {
      name: 'Designer Denim Jeans',
      description: 'Premium quality denim with sustainable materials. Classic cut with modern comfort.',
      price: 79.99,
      stock: 75,
      categoryId: clothing.id,
      featured: true,
      averageRating: 4.5,
      reviewCount: 67,
    },
    {
      name: 'Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
      price: 199.99,
      stock: 40,
      categoryId: electronics.id,
      featured: false,
      averageRating: 4.6,
      reviewCount: 203,
    },
    {
      name: 'Casual Sneakers',
      description: 'Comfortable sneakers perfect for daily wear. Made with sustainable materials.',
      price: 89.99,
      stock: 60,
      categoryId: clothing.id,
      featured: true,
      averageRating: 4.4,
      reviewCount: 142,
    },
  ]

  const createdProducts = []
  for (const product of products) {
    const createdProduct = await prisma.product.upsert({
      where: { name: product.name },
      update: product,
      create: product,
    })
    createdProducts.push(createdProduct)
  }

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
      productId: createdProducts[0].id, // iPhone
      rating: 5,
      comment: 'Amazing phone! The camera quality is exceptional and the performance is smooth.',
    },
    {
      userId: adminUser.id,
      productId: createdProducts[1].id, // MacBook
      rating: 5,
      comment: 'Perfect for development work. The M3 chip handles everything I throw at it.',
    },
    {
      userId: regularUser.id,
      productId: createdProducts[3].id, // Jeans
      rating: 4,
      comment: 'Great quality denim, fits perfectly. Will definitely buy again.',
    },
  ]

  for (const review of sampleReviews) {
    await prisma.review.create({
      data: review,
    })
  }

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