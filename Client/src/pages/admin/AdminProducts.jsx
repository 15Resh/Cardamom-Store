import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import API from '../../utils/api'
import AdminLayout from '../../components/admin/AdminLayout'
import toast from 'react-hot-toast'

const EMPTY = {
  name: '', description: '', shortDescription: '', price: '', originalPrice: '',
  weight: '', stock: '', features: '', isActive: true, isFeatured: false,
  images: [{ url: '', alt: '' }]
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)  // false | 'add' | 'edit'
  const [form, setForm]         = useState(EMPTY)
  const [saving, setSaving]     = useState(false)
  const [editId, setEditId]     = useState(null)

  const load = () => {
    setLoading(true)
    API.get('/admin/products')
      .then(r => setProducts(r.data.products))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal('add') }

  const openEdit = (p) => {
    setForm({
      ...p,
      features: p.features?.join(', ') || '',
      images: p.images?.length ? p.images : [{ url: '', alt: '' }]
    })
    setEditId(p._id)
    setModal('edit')
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return
    try {
      await API.delete(`/products/${id}`)
      toast.success('Product deleted')
      load()
    } catch { toast.error('Failed to delete') }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        price:         Number(form.price),
        originalPrice: Number(form.originalPrice) || 0,
        stock:         Number(form.stock),
        features:      form.features ? form.features.split(',').map(s => s.trim()).filter(Boolean) : [],
        images:        form.images.filter(img => img.url)
      }
      if (modal === 'edit') {
        await API.put(`/products/${editId}`, payload)
        toast.success('Product updated!')
      } else {
        await API.post('/products', payload)
        toast.success('Product added!')
      }
      setModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    }
    setSaving(false)
  }

  const upd = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const updImg = (e) => setForm(f => ({ ...f, images: [{ url: e.target.value, alt: f.name }] }))

  const inputCls = 'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-farm-green'

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} products</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Products table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-farm-green border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left">Product</th>
                <th className="px-6 py-4 text-left">Weight</th>
                <th className="px-6 py-4 text-left">Price</th>
                <th className="px-6 py-4 text-left">Stock</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map(p => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 rounded-lg overflow-hidden flex-shrink-0">
                        {p.images?.[0]?.url && (
                          <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover"
                            onError={e => e.target.style.display = 'none'} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{p.name}</p>
                        {p.isFeatured && <span className="text-xs text-yellow-600 font-medium">⭐ Featured</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{p.weight}</td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-farm-green">₹{p.price}</span>
                    {p.originalPrice > p.price && (
                      <span className="text-xs text-gray-400 line-through ml-1.5">₹{p.originalPrice}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={p.stock > 10 ? 'text-green-600' : p.stock > 0 ? 'text-yellow-600' : 'text-red-600'}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)}
                        className="p-1.5 text-gray-400 hover:text-farm-green hover:bg-green-50 rounded-lg transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p._id, p.name)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{modal === 'edit' ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 mb-1 block">Product Name *</label>
                  <input name="name" required value={form.name} onChange={upd} className={inputCls} placeholder="e.g. Premium Green Cardamom 100g" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Weight *</label>
                  <input name="weight" required value={form.weight} onChange={upd} className={inputCls} placeholder="e.g. 100g" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Stock *</label>
                  <input name="stock" type="number" required min="0" value={form.stock} onChange={upd} className={inputCls} placeholder="100" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Price (₹) *</label>
                  <input name="price" type="number" required min="0" value={form.price} onChange={upd} className={inputCls} placeholder="249" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Original Price (₹)</label>
                  <input name="originalPrice" type="number" min="0" value={form.originalPrice} onChange={upd} className={inputCls} placeholder="299" />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Short Description</label>
                <input name="shortDescription" value={form.shortDescription} onChange={upd} className={inputCls} placeholder="One-line tagline" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Full Description *</label>
                <textarea name="description" required rows={3} value={form.description} onChange={upd} className={inputCls} placeholder="Detailed description..." />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Image URL</label>
                <input value={form.images[0]?.url || ''} onChange={updImg} className={inputCls} placeholder="https://..." />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Features (comma-separated)</label>
                <input name="features" value={form.features} onChange={upd} className={inputCls} placeholder="100% Organic, Hand-picked, No Preservatives" />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.isFeatured}
                    onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))}
                    className="w-4 h-4 rounded accent-farm-green" />
                  Featured product
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.isActive}
                    onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded accent-farm-green" />
                  Active (visible)
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-farm-green text-white py-2.5 rounded-lg text-sm font-medium hover:bg-farm-light disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving
                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
                    : <><Check className="w-4 h-4" /> {modal === 'edit' ? 'Update' : 'Add'} Product</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
