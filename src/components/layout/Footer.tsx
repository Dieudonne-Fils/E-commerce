import Link from 'next/link'
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">E-Commerce</h3>
            <p className="text-gray-400 leading-relaxed">
              Your trusted partner for quality products and exceptional service. 
              We bring you the best shopping experience with secure payments and fast delivery.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <nav className="flex flex-col space-y-2">
              <Link href="/products" className="text-gray-400 hover:text-white transition-colors">
                All Products
              </Link>
              <Link href="/categories" className="text-gray-400 hover:text-white transition-colors">
                Categories
              </Link>
              <Link href="/deals" className="text-gray-400 hover:text-white transition-colors">
                Special Deals
              </Link>
              <Link href="/new-arrivals" className="text-gray-400 hover:text-white transition-colors">
                New Arrivals
              </Link>
              <Link href="/wishlist" className="text-gray-400 hover:text-white transition-colors">
                My Wishlist
              </Link>
            </nav>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Customer Service</h4>
            <nav className="flex flex-col space-y-2">
              <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                Contact Us
              </Link>
              <Link href="/shipping" className="text-gray-400 hover:text-white transition-colors">
                Shipping Info
              </Link>
              <Link href="/returns" className="text-gray-400 hover:text-white transition-colors">
                Returns & Exchanges
              </Link>
              <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                FAQ
              </Link>
              <Link href="/size-guide" className="text-gray-400 hover:text-white transition-colors">
                Size Guide
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Get in Touch</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400">support@ecommerce.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <span className="text-gray-400">
                  123 Commerce Street<br />
                  New York, NY 10001
                </span>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="mt-6">
              <h5 className="font-semibold mb-3">Stay Updated</h5>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-md text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                />
                <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-r-md transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-gray-400">
                © 2024 E-Commerce. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Terms of Service
                </Link>
                <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Cookie Policy
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-400">
              <span className="text-sm">Made with</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-sm">by E-Commerce Team</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-gray-800 py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center space-x-8 opacity-60">
            <div className="text-xs text-center">
              <div className="font-semibold">🔒</div>
              <div>SSL Secure</div>
            </div>
            <div className="text-xs text-center">
              <div className="font-semibold">📦</div>
              <div>Free Shipping</div>
            </div>
            <div className="text-xs text-center">
              <div className="font-semibold">↩️</div>
              <div>30-Day Returns</div>
            </div>
            <div className="text-xs text-center">
              <div className="font-semibold">⭐</div>
              <div>Best Quality</div>
            </div>
            <div className="text-xs text-center">
              <div className="font-semibold">🚚</div>
              <div>Fast Delivery</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}