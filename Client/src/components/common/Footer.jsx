import { Link } from 'react-router-dom'
import { Leaf, Phone, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-farm-green text-white mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 font-bold text-xl mb-3">
            <Leaf className="w-5 h-5 text-green-300" />
            <span>Cardamom Farm</span>
          </div>
          <p className="text-green-200 text-sm leading-relaxed">
            Premium green cardamom grown organically in the lush hills of Kerala.
            Direct from our family farm to your kitchen.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="font-semibold text-green-300 mb-4 uppercase tracking-wide text-xs">Quick Links</h3>
          <div className="flex flex-col gap-2 text-sm text-green-100">
            <Link to="/products" className="hover:text-white transition-colors">Shop Cardamom</Link>
            <Link to="/about"    className="hover:text-white transition-colors">Our Story</Link>
            <Link to="/orders"   className="hover:text-white transition-colors">Track Order</Link>
            <Link to="/login"    className="hover:text-white transition-colors">Login / Register</Link>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold text-green-300 mb-4 uppercase tracking-wide text-xs">Contact</h3>
          <div className="flex flex-col gap-3 text-sm text-green-100">
            <a href="tel:+919876543210" className="flex items-center gap-2 hover:text-white transition-colors">
              <Phone className="w-4 h-4" /> +91 98765 43210
            </a>
            <a href="mailto:info@cardamomfarm.com" className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail className="w-4 h-4" /> info@cardamomfarm.com
            </a>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Idukki District, Kerala, India - 685 515</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-green-700 text-center py-4 text-xs text-green-300">
        © {new Date().getFullYear()} Cardamom Farm. All rights reserved. | Made with love in Kerala 🌿
      </div>
    </footer>
  )
}
