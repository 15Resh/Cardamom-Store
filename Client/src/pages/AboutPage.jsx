import { Link } from 'react-router-dom'
import { Leaf, Award, Heart, Sprout } from 'lucide-react'

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section
        className="relative py-24 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1400')" }}
      >
        <div className="absolute inset-0 bg-farm-green/80" />
        <div className="relative z-10 text-center text-white max-w-2xl mx-auto px-4">
          <Leaf className="w-12 h-12 text-green-300 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Our Farm, Our Story</h1>
          <p className="text-green-100 text-lg">Three generations of passion, cultivated in the hills of Kerala</p>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <span className="text-farm-green font-medium text-sm uppercase tracking-wide">Since 1952</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">Started by Our Grandfather</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Our grandfather Raman planted the first cardamom seeds on this land in 1952, after learning the
              traditional cultivation methods from farmers in the Idukki highlands. He believed that the best
              cardamom could only come from soil that was respected and nurtured.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Today, we farm over 12 acres of cardamom at an altitude of 1,200 metres — the same elevation
              that gives Kerala cardamom its distinctive, intense aroma. We use zero synthetic pesticides and
              rely on traditional organic methods passed down through our family.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600" alt="Farm"
              className="w-full h-72 object-cover" />
          </div>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
          {[
            { icon: <Leaf className="w-6 h-6 text-farm-green" />, title: '100% Organic', text: 'No synthetic chemicals ever. We enrich our soil naturally with compost and farmyard manure.' },
            { icon: <Heart className="w-6 h-6 text-farm-green" />, title: 'Hand-Picked with Care', text: 'Every pod is picked by hand at peak ripeness. We never use machines that damage the crop.' },
            { icon: <Award className="w-6 h-6 text-farm-green" />, title: 'Direct from Farm', text: 'We sell directly to you — no middlemen. This means better quality and fair prices for everyone.' },
            { icon: <Sprout className="w-6 h-6 text-farm-green" />, title: 'Sustainable Farming', text: 'We preserve the biodiversity of our land and maintain natural water streams on the property.' },
          ].map(({ icon, title, text }) => (
            <div key={title} className="card p-6 flex gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">{icon}</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-farm-green text-white rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold mb-3">Taste the difference of farm-direct cardamom</h2>
          <p className="text-green-200 mb-6">Packed and shipped within 24 hours of your order. Freshness guaranteed.</p>
          <Link to="/products" className="bg-white text-farm-green font-semibold px-8 py-3 rounded-lg hover:bg-green-50 transition-colors inline-block">
            Shop Cardamom
          </Link>
        </div>
      </section>
    </div>
  )
}
