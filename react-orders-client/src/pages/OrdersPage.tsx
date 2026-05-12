import { useState, useEffect, useCallback } from 'react'
import api from '../api/client'
import Navbar from '../components/Navbar'
import OrderModal from '../components/OrderModal'
import type { Order, OrderFormData, OrderStatus } from '../types'

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending:    'bg-yellow-100 text-yellow-700 border-yellow-200',
  processing: 'bg-blue-100   text-blue-700   border-blue-200',
  completed:  'bg-green-100  text-green-700  border-green-200',
  cancelled:  'bg-red-100    text-red-700    border-red-200',
}
const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente', processing: 'En proceso', completed: 'Completada', cancelled: 'Cancelada',
}

export default function OrdersPage() {
  const [orders, setOrders]       = useState<Order[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true); setError('')
      const { data } = await api.get<Order[]>('/orders')
      setOrders(data)
    } catch { setError('No se pudieron cargar las órdenes.') }
    finally   { setLoading(false) }
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleSave = async (formData: OrderFormData) => {
    await api.post('/orders', formData)
    await fetchOrders()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Órdenes</h2>
            <p className="text-gray-400 text-sm mt-0.5">{orders.length} orden(es) registrada(s)</p>
          </div>
          <button onClick={() => setModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Orden
          </button>
        </div>

        {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error}</div>}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-gray-400 font-mono text-xs">#{order.id}</span>
                    <h3 className="font-semibold text-gray-900 truncate">{order.customerName}</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {order.items.map((item, i) => (
                      <span key={i} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${STATUS_STYLES[order.status]}`}>
                  {STATUS_LABELS[order.status]}
                </span>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <p className="font-medium">No hay órdenes todavía</p>
              </div>
            )}
          </div>
        )}
      </main>
      {modalOpen && <OrderModal onSave={handleSave} onClose={() => setModalOpen(false)} />}
    </div>
  )
}
