import { useState, useEffect, FormEvent } from 'react'
import type { Order, OrderFormData, OrderStatus, OrderUpdateData } from '../types'

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'PENDING',   label: 'Pendiente'   },
  { value: 'CONFIRMED', label: 'Confirmada'  },
  { value: 'SHIPPED',   label: 'Enviada'     },
  { value: 'DELIVERED', label: 'Entregada'   },
]

interface Props {
  order?: Order | null
  onSave: (data: OrderFormData | OrderUpdateData) => Promise<void>
  onClose: () => void
}

export default function OrderModal({ order, onSave, onClose }: Props) {
  const [customerName, setCustomerName] = useState('')
  const [itemsText, setItemsText]       = useState('')
  const [orderStatus, setOrderStatus]   = useState<OrderStatus>('PENDING')
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')

  useEffect(() => {
    if (order) {
      setCustomerName(order.customerName)
      setItemsText(order.items.join(', '))
      setOrderStatus(order.status)
    } else {
      setCustomerName('')
      setItemsText('')
      setOrderStatus('PENDING')
    }
  }, [order])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const items = itemsText.split(',').map((s) => s.trim()).filter(Boolean)
    if (items.length === 0) { setError('Agrega al menos un artículo'); return }
    setError(''); setLoading(true)
    try {
      const data = order
        ? { customerName: customerName.trim(), items, status: orderStatus }
        : { customerName: customerName.trim(), items }
      await onSave(data)
      onClose()
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string | Array<{ msg: string }> } } }).response?.data?.detail
      setError(Array.isArray(detail) ? (detail[0]?.msg ?? 'Error') : (detail ?? 'Error al guardar la orden'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">{order ? 'Editar Orden' : 'Nueva Orden'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del cliente</label>
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required
              placeholder="Ej: Juan Pérez"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Artículos <span className="text-gray-400 font-normal">(separados por coma)</span>
            </label>
            <input value={itemsText} onChange={(e) => setItemsText(e.target.value)} required
              placeholder="Ej: Camiseta, Zapatos, Pantalón"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent" />
            <p className="text-xs text-gray-400 mt-1">
              {itemsText ? itemsText.split(',').filter((s) => s.trim()).length : 0} artículo(s) detectado(s)
            </p>
          </div>
          {order && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white">
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          )}
          {!order && (
            <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
              El estado se establece automáticamente como <span className="font-semibold text-yellow-600">PENDING</span>.
            </p>
          )}
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium">Cancelar</button>
            <button type="submit" disabled={loading}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition">
              {loading ? 'Guardando...' : order ? 'Actualizar' : 'Crear Orden'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
