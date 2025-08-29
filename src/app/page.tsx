import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/home/HeroSection'
import { Button } from '@/components/ui/Button'
import { ProductCard } from '@/components/product/ProductCard'
import { AnimatedElement, StaggeredList, CountUp, Typewriter } from '@/components/ui/AnimatedComponents'
import { Product } from '@/types'
import { TrendingUp, Award, Truck, HeadphonesIcon } from 'lucide-react'

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const response = await fetch('http://localhost:3000/api/products?featured=true&limit=4', {
      cache: 'no-store',
    })
    if (response.ok) {
      const data = await response.json()
      return data.products || []
    }
  } catch (error) {
    console.error('Failed to fetch featured products:', error)
  }
  return []
}

export default async function Home() {
  const featuredProducts = await getFeaturedProducts()
  return (
    <div>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <HeroSection />
        
        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <AnimatedElement animation="fade-in" className="text-center mb-16">
              <Typewriter 
                text="Why Choose Us?" 
                className="text-4xl font-bold text-gray-900 mb-4"
                speed={100}
              />
              <AnimatedElement animation="slide-up" delay={1000}>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Experience the best in online shopping with our premium features and exceptional service
                </p>
              </AnimatedElement>
            </AnimatedElement>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <AnimatedElement animation="scale" delay={200} className="text-center group hover-float">
                <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform animate-gradient-x">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Trending Products</h3>
                <CountUp end={1000} suffix="+" className="text-2xl font-bold text-primary-600" />
                <p className="text-gray-600 leading-relaxed mt-2">
                  Discover the latest trends and bestselling items curated just for you
                </p>
              </AnimatedElement>
              
              <AnimatedElement animation="scale" delay={400} className="text-center group hover-float">
                <div className="w-20 h-20 gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform animate-gradient-x">
                  <Award className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Premium Quality</h3>
                <CountUp end={99} suffix="%" className="text-2xl font-bold text-primary-600" />
                <p className="text-gray-600 leading-relaxed mt-2">
                  Every product is carefully selected to meet our high standards of quality
                </p>
              </AnimatedElement>
              
              <AnimatedElement animation="scale" delay={600} className="text-center group hover-float">
                <div className="w-20 h-20 gradient-success rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform animate-gradient-x">
                  <Truck className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Fast Shipping</h3>
                <CountUp end={24} suffix=" hrs" className="text-2xl font-bold text-primary-600" />
                <p className="text-gray-600 leading-relaxed mt-2">
                  Free shipping on all orders with lightning-fast delivery worldwide
                </p>
              </AnimatedElement>
              
              <AnimatedElement animation="scale" delay={800} className="text-center group hover-float">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform animate-gradient-x">
                  <HeadphonesIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">24/7 Support</h3>
                <CountUp end={50000} suffix="+" className="text-2xl font-bold text-primary-600" />
                <p className="text-gray-600 leading-relaxed mt-2">
                  Our dedicated support team is here to help you anytime, anywhere
                </p>
              </AnimatedElement>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <AnimatedElement animation="fade-in" className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Discover our handpicked selection of premium products
                </p>
              </AnimatedElement>
              
              <StaggeredList
                staggerDelay={150}
                animation="scale"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </StaggeredList>
              
              <AnimatedElement animation="bounce-in" delay={800} className="text-center mt-8">
                <Button asChild variant="outline" size="lg" className="hover-lift">
                  <Link href="/products">View All Products</Link>
                </Button>
              </AnimatedElement>
            </div>
          </section>
        )}

        {/* Call to Action Section */}
        <section className="py-20 gradient-primary text-white animate-gradient-x">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <AnimatedElement animation="fade-in">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Ready to Start Shopping?
                </h2>
              </AnimatedElement>
              <AnimatedElement animation="slide-up" delay={300}>
                <p className="text-xl mb-8 opacity-90">
                  Join thousands of satisfied customers and experience the best online shopping today
                </p>
              </AnimatedElement>
              <AnimatedElement animation="bounce-in" delay={600}>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button 
                    size="lg" 
                    className="bg-white text-primary-600 hover:bg-gray-100 btn-glow hover-lift"
                    asChild
                  >
                    <Link href="/products">Explore Products</Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-white text-white hover:bg-white hover:text-primary-600 hover-scale"
                    asChild
                  >
                    <Link href="/auth/register">Create Account</Link>
                  </Button>
                </div>
              </AnimatedElement>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}