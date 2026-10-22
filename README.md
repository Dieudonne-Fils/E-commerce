# 🛒 E-Commerce Application

A modern, feature-rich e-commerce application built with Next.js 15, TypeScript, PostgreSQL, and Prisma.

## ✨ Features

### 🛍️ **Customer Features**
- ✅ **Advanced Product Catalog** - Browse with filters, search, and sorting
- ⭐ **Product Reviews & Ratings** - Star ratings and detailed reviews
- 💝 **Wishlist System** - Save products for later
- 🛒 **Smart Shopping Cart** - Real-time updates with quantity management
- 🔐 **Secure Authentication** - JWT-based login/registration
- 👤 **User Profiles** - Personal information and order history
- 📦 **Order Tracking** - Complete order management with status updates
- 🔍 **Advanced Search** - Filter by category, price, rating, and availability
- 📱 **Responsive Design** - Mobile-first, works on all devices

### 👨‍💼 **Admin Features**
- 📊 **Admin Dashboard** - Comprehensive analytics and overview
- 📝 **Product Management** - Full CRUD operations for products
- 🏷️ **Category Management** - Organize products efficiently  
- 📈 **Sales Analytics** - Track performance and revenue
- 👥 **User Management** - Monitor customer accounts
- 🚚 **Order Management** - Update order statuses and tracking

### 🎨 **UI/UX Enhancements**
- 🌟 **Star Rating System** - Interactive product ratings
- 🎭 **Smooth Animations** - CSS transitions and hover effects
- 📱 **Mobile Navigation** - Collapsible mobile menu
- 🎨 **Modern Design** - Clean, professional interface
- 💬 **Smart Notifications** - Toast messages for user feedback
- ⚡ **Loading States** - Skeleton screens and spinners

## Tech Stack

- **Frontend:** Next.js 15, React, TypeScript
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL with Prisma ORM
- **Styling:** Tailwind CSS
- **Authentication:** JWT tokens
- **Validation:** Zod

## Getting Started

### Prerequisites

- Node.js 18+ and npm (if running locally)
- Docker and Docker Compose (recommended)

### Installation

#### Option 1: With Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd E-commerce
```

2. Start PostgreSQL with Docker:
```bash
npm run docker:db
```

3. Install dependencies and set up the database:
```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
```

4. Start the development server:
```bash
npm run dev
```

#### Option 2: Full Docker Setup

1. Clone and build everything with Docker:
```bash
git clone <repository-url>
cd E-commerce
npm run docker:build
```

#### Option 3: Local Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd E-commerce
```

2. Install dependencies:
```bash
npm install
```

3. Set up PostgreSQL locally and update `.env.local` with your database credentials

4. Set up the database:
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

5. Start the development server:
```bash
npm run dev
```

## Docker Commands

```bash
npm run docker:up      # Start all services
npm run docker:down    # Stop all services
npm run docker:build   # Build and start services
npm run docker:db      # Start only PostgreSQL
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🚀 API Endpoints

### 🔐 **Authentication**
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user  
- `GET /api/auth/me` - Get current user info

### 📦 **Products**
- `GET /api/products` - Get all products (with pagination & filters)
- `POST /api/products` - Create a new product (Admin)
- `GET /api/products/[id]` - Get product by ID
- `PUT /api/products/[id]` - Update product (Admin)
- `DELETE /api/products/[id]` - Delete product (Admin)

### ⭐ **Reviews**
- `GET /api/products/[id]/reviews` - Get product reviews
- `POST /api/products/[id]/reviews` - Add a review

### 🏷️ **Categories**
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Admin)

### 🛒 **Shopping Cart**
- `GET /api/cart` - Get user's cart items
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/[id]` - Update cart item quantity
- `DELETE /api/cart/[id]` - Remove item from cart

### 💝 **Wishlist**
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist` - Add item to wishlist
- `DELETE /api/wishlist` - Remove item from wishlist

### 📋 **Orders**
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create a new order
- `GET /api/orders/[id]` - Get order by ID
- `PATCH /api/admin/orders/[id]/status` - Update order status (Admin)

## Database Schema

The application uses the following main entities:

- **Users** - User accounts with authentication, profiles, and preferences
- **Categories** - Product categories for organization
- **Products** - Product information with ratings and stock management
- **Reviews** - Customer reviews and ratings for products
- **CartItems** - Shopping cart items with quantity tracking  
- **WishlistItems** - Saved products for later purchase
- **Orders** - Customer orders with status tracking
- **OrderItems** - Individual items within orders

### 🔄 **Key Relationships**
- Users can have multiple orders, cart items, reviews, and wishlist items
- Products belong to categories and can have multiple reviews
- Orders contain multiple order items
- Reviews link users to products with ratings

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   ├── products/       # Product pages
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components
│   ├── product/        # Product components
│   └── ui/             # UI components
├── lib/                # Utility functions
└── types/              # TypeScript type definitions
```

## Catalog Data

The SQL migrations in `prisma/migrations/` create the product catalog (4 categories, 24 products). Product images live in `public/images/products/` (photos from [Unsplash](https://unsplash.com/license)).

To rebuild your local database from scratch (drops all data, applies migrations, then runs the seed):
```bash
npm run db:reset
```

## Default Admin User

The seed script creates a default admin user:
- Email: admin@example.com
- Password: admin123

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

## License

This project is open source and available under the MIT License.