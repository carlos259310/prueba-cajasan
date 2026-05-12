import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import type { Product, ProductFormData } from '../types'

interface Props {
  product: Product | null
  onSave: (data: ProductFormData) => Promise<void>
  onClose: () => void
}

interface FormState {
  name: string
  category: string
  price: string
  stock: string
}

const EMPTY: FormState = { name: '', category: '', price: '', stock: '' }

export default function ProductModal({ product, onSave, onClose }: Props) {
  const [form, setForm]     = useState<FormState>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  useEffect(() => {
    setForm(product
      ? { name: product.name, category: product.category, price: String(product.price), stock: String(product.stock) }
      : EMPTY
    )
  }, [product])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await onSave({ name: form.name.trim(), category: form.category.trim(), price: parseFloat(form.price), stock: parseInt(form.stock, 10) })
      onClose()
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string | Array<{ msg: string }> } } }).response?.data?.detail
      setError(Array.isArray(detail) ? (detail[0]?.msg ?? 'Error') : (detail ?? 'Error al guardar'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">{product ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{error}</div>}
          {(['name', 'category'] as const).map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                {field === 'name' ? 'Nombre' : 'Categoría'}
              </label>
              <input name={field} value={form[field]} onChange={handleChange} required
                placeholder={field === 'name' ? 'Ej: Laptop Pro' : 'Ej: Electrónica'}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
              <input name="price" type="number" step="0.01" min="0.01" value={form.price} onChange={handleChange} required
                placeholder="0.00"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} required
                placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium">Cancelar</button>
            <button type="submit" disabled={loading}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition">
              {loading ? 'Guardando...' : product ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
