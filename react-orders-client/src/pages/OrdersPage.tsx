import { useState, useEffect, useCallback } from 'react'
import api from '../api/client'
import Navbar from '../components/Navbar'
import OrderModal from '../components/OrderModal'
import type { Order, OrderFormData, OrderStatus, OrderUpdateData } from '../types'

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  CONFIRMED: 'bg-blue-100   text-blue-700   border-blue-200',
  SHIPPED:   'bg-purple-100 text-purple-700 border-purple-200',
  DELIVERED: 'bg-green-100  text-green-700  border-green-200',
}
const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente', CONFIRMED: 'Confirmada', SHIPPED: 'Enviada', DELIVERED: 'Entregada',
}

export default function OrdersPage() {
  const [orders, setOrders]         = useState<Order[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [modalOpen, setModalOpen]   = useState(false)
  const [editOrder, setEditOrder]   = useState<Order | null>(null)
  const [search, setSearch]         = useState('')

  const filtered = search.trim()
    ? orders.filter((o) =>
        String(o.id).includes(search.trim()) ||
        o.customerName.toLowerCase().includes(search.trim().toLowerCase())
      )
    : orders

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true); setError('')
      const { data } = await api.get<Order[]>('/orders')
      setOrders(data)
    } catch { setError('No se pudieron cargar las órdenes.') }
    finally   { setLoading(false) }
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleSave = async (data: OrderFormData | OrderUpdateData) => {
    if (editOrder) await api.patch(`/orders/${editOrder.id}/status`, { status: (data as OrderUpdateData).status })
    else           await api.post('/orders', data)
    await fetchOrders()
  }

  const openCreate = () => { setEditOrder(null); setModalOpen(true) }
  const openEdit   = (o: Order) => { setEditOrder(o); setModalOpen(true) }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Órdenes</h2>
            <p className="text-gray-400 text-sm mt-0.5">{filtered.length} de {orders.length} orden(es)</p>
          </div>
          <button onClick={openCreate}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Orden
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por ID o nombre de cliente..."
            className="w-full max-w-sm border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
          />
        </div>

        {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error}</div>}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => (
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
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                  <button onClick={() => openEdit(order)}
                    className="text-emerald-600 hover:text-emerald-800 font-medium text-xs transition">
                    Editar
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <p className="font-medium">{search ? 'Sin resultados para esa búsqueda' : 'No hay órdenes todavía'}</p>
              </div>
            )}
          </div>
        )}
      </main>
      {modalOpen && (
        <OrderModal
          order={editOrder}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
