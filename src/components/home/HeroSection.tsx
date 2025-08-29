'use client'

import { Carousel } from '@/components/ui/Carousel'
import { ShoppingBag, Star, Users, Shield } from 'lucide-react'

export function HeroSection() {
  const carouselItems = [
    {
      id: '1',
      title: 'Welcome to E-Commerce',
      subtitle: 'Discover amazing products at unbeatable prices',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      cta: 'Shop Now',
      ctaLink: '/products'
    },
    {
      id: '2',
      title: 'Premium Electronics',
      subtitle: 'Latest technology and gadgets for your lifestyle',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      cta: 'Explore Tech',
      ctaLink: '/products?category=electronics'
    },
    {
      id: '3',
      title: 'Fashion Forward',
      subtitle: 'Trendy clothing and accessories for every occasion',
      image: 'https://images.unsplash.com/photo-1441984904996 -97d37714b2eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      cta: 'Shop Fashion',
      ctaLink: '/products?category=clothing'
    }
  ]

  return (
    <section className="relative overflow-hidden">
      <Carousel items={carouselItems} />
      
      {/* Stats Section */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <ShoppingBag className="w-6 h-6 mr-2" />
                <span className="text-2xl font-bold">1000+</span>
              </div>
              <p className="text-sm opacity-90">Products</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-6 h-6 mr-2" />
                <span className="text-2xl font-bold">50k+</span>
              </div>
              <p className="text-sm opacity-90">Happy Customers</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="w-6 h-6 mr-2" />
                <span className="text-2xl font-bold">4.8</span>
              </div>
              <p className="text-sm opacity-90">Average Rating</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Shield className="w-6 h-6 mr-2" />
                <span className="text-2xl font-bold">100%</span>
              </div>
              <p className="text-sm opacity-90">Secure</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}