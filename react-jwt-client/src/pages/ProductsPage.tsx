import { useState, useEffect, useCallback } from 'react'
import api from '../api/client'
import Navbar from '../components/Navbar'
import ProductModal from '../components/ProductModal'
import type { Product, ProductFormData } from '../types'

export default function ProductsPage() {
  const [products, setProducts]   = useState<Product[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [search, setSearch]       = useState('')

  const filtered = search.trim()
    ? products.filter((p) =>
        String(p.id).includes(search.trim()) ||
        p.name.toLowerCase().includes(search.trim().toLowerCase()) ||
        p.category.toLowerCase().includes(search.trim().toLowerCase())
      )
    : products

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true); setError('')
      const { data } = await api.get<Product[]>('/products')
      setProducts(data)
    } catch { setError('No se pudo cargar la lista de productos.') }
    finally   { setLoading(false) }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleSave = async (formData: ProductFormData) => {
    if (editProduct) await api.put(`/products/${editProduct.id}`, formData)
    else             await api.post('/products', formData)
    await fetchProducts()
  }

  const openCreate = () => { setEditProduct(null); setModalOpen(true) }
  const openEdit   = (p: Product) => { setEditProduct(p); setModalOpen(true) }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Inventario de Productos</h2>
            <p className="text-gray-400 text-sm mt-0.5">{filtered.length} de {products.length} producto(s)</p>
          </div>
          <button onClick={openCreate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Producto
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por ID, nombre o categoría..."
            className="w-full max-w-sm border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
        </div>

        {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error}</div>}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['ID', 'Nombre', 'Categoría', 'Precio', 'Stock', 'Acciones'].map((h, i) => (
                    <th key={h} className={`px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider ${i >= 3 ? 'text-right' : 'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-indigo-50/40 transition-colors">
                    <td className="px-5 py-4 text-gray-400 font-mono text-xs">#{p.id}</td>
                    <td className="px-5 py-4 font-semibold text-gray-900">{p.name}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-gray-800">${p.price.toFixed(2)}</td>
                    <td className="px-5 py-4 text-right">
                      <span className={`font-semibold ${p.stock === 0 ? 'text-red-500' : p.stock < 15 ? 'text-amber-500' : 'text-green-600'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => openEdit(p)} className="text-indigo-600 hover:text-indigo-800 font-medium text-xs transition">
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <p className="font-medium">{search ? 'Sin resultados para esa búsqueda' : 'No hay productos todavía'}</p>
              </div>
            )}
          </div>
        )}
      </main>
      {modalOpen && <ProductModal product={editProduct} onSave={handleSave} onClose={() => setModalOpen(false)} />}
    </div>
  )
}
