import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Leaf, Shield, Truck, Award, ArrowRight, Star } from 'lucide-react'
import API from '../utils/api'
import ProductCard from '../components/common/ProductCard'

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    API.get('/products/featured')
      .then(r => setProducts(r.data.products))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* ── Hero ── */}
      <section
        className="relative min-h-[85vh] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600')" }}
      >
        <div className="absolute inset-0 bg-farm-green/75" />
        <div className="relative z-10 text-center text-white px-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm mb-6">
            <Leaf className="w-4 h-4 text-green-300" />
            <span>100% Organic · Direct from Farm</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Farm-Fresh<br />
            <span className="text-green-300">Cardamom</span><br />
            from Kerala
          </h1>
          <p className="text-lg text-green-100 mb-8 max-w-xl mx-auto">
            Hand-picked from our organic farm in Idukki. No middlemen — just pure
            cardamom delivered straight to your kitchen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products" className="bg-white text-farm-green font-semibold px-8 py-3 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center gap-2">
              Shop Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/about" className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-colors">
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust badges ── */}
      <section className="bg-white py-8 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: <Leaf className="w-6 h-6 text-farm-green" />, title: '100% Organic', sub: 'No pesticides ever' },
            { icon: <Shield className="w-6 h-6 text-farm-green" />, title: 'Secure Payments', sub: 'Razorpay protected' },
            { icon: <Truck className="w-6 h-6 text-farm-green" />, title: 'Fast Delivery', sub: '3–6 business days' },
            { icon: <Award className="w-6 h-6 text-farm-green" />, title: 'Premium Quality', sub: 'Hand-picked pods' },
          ].map(({ icon, title, sub }) => (
            <div key={title} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">{icon}</div>
              <p className="font-semibold text-sm text-gray-900">{title}</p>
              <p className="text-xs text-gray-500">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <span className="text-farm-green font-medium text-sm uppercase tracking-wide">Our Products</span>
          <h2 className="text-3xl font-bold text-gray-900 mt-2">Fresh from the Farm</h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Choose your pack size. All varieties hand-picked and packed fresh.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card h-64 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}

        <div className="text-center mt-10">
          <Link to="/products" className="btn-outline inline-flex items-center gap-2">
            View All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Farmer story teaser ── */}
      <section className="bg-farm-cream py-16">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <span className="text-farm-green font-medium text-sm uppercase tracking-wide">Our Story</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">
              Three generations of<br />cardamom farming
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Our family has been growing cardamom in the Idukki highlands for over 75 years.
              We use traditional farming methods combined with organic practices to bring you
              the finest quality cardamom — the same variety we grow for our own kitchen.
            </p>
            <Link to="/about" className="btn-primary inline-flex items-center gap-2">
              Read Our Story <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex-1 rounded-2xl overflow-hidden shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600"
              alt="Cardamom farm"
              className="w-full h-64 object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">What customers say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Priya M.', loc: 'Chennai', text: 'The fragrance is unbelievable! Nothing like store-bought. My chai has never tasted better.', rating: 5 },
            { name: 'Rajesh K.', loc: 'Mumbai', text: 'Ordered 250g family pack. Super fresh, arrived in 4 days well-packed. Will order again!', rating: 5 },
            { name: 'Meena S.', loc: 'Bangalore', text: 'Used for our wedding cooking. Everyone asked where we got the cardamom. Highly recommend!', rating: 5 },
          ].map(({ name, loc, text, rating }) => (
            <div key={name} className="card p-5">
              <div className="flex mb-3">
                {[...Array(rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">"{text}"</p>
              <div>
                <p className="font-semibold text-sm text-gray-900">{name}</p>
                <p className="text-xs text-gray-400">{loc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
