import { useState, ChangeEvent, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login }   = useAuth()
  const navigate    = useNavigate()
  const [form, setForm]       = useState({ username: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await login(form.username, form.password); navigate('/orders') }
    catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } }; request?: unknown }
      if (axiosErr.response) {
        setError(axiosErr.response.data?.detail ?? 'Usuario o contraseña incorrectos')
      } else if (axiosErr.request) {
        setError('No se puede conectar al servidor. Verifica que el backend esté activo en el puerto 8000.')
      } else {
        setError('Error inesperado. Intenta de nuevo.')
      }
    }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Órdenes</h1>
          <p className="text-gray-400 text-sm mt-1">Inicia sesión para continuar</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {(['username', 'password'] as const).map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field === 'username' ? 'Usuario' : 'Contraseña'}
              </label>
              <input name={field} type={field === 'password' ? 'password' : 'text'}
                value={form[field]} onChange={handleChange} required
                placeholder={field === 'username' ? 'admin o user' : '••••••••'}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent" />
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition mt-2">
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-xl text-xs text-gray-500 space-y-1.5">
          <p className="font-semibold text-gray-600 mb-2">Usuarios disponibles:</p>
          <div className="flex justify-between">
            <span className="font-mono bg-white border border-gray-200 px-2 py-0.5 rounded">admin / admin123</span>
            <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-medium">ADMIN</span>
          </div>
          <div className="flex justify-between">
            <span className="font-mono bg-white border border-gray-200 px-2 py-0.5 rounded">user / user123</span>
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">USER</span>
          </div>
        </div>
      </div>
    </div>
  )
}
