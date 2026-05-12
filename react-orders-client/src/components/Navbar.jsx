import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  return (
    <nav className="bg-emerald-700 text-white px-6 py-4 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-2">
        <svg className="w-6 h-6 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h1 className="text-lg font-bold">Orders API Demo</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-emerald-200 text-sm">
          Hola, <span className="font-semibold text-white capitalize">{user?.username}</span>
        </span>
        <button
          onClick={logout}
          className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-1.5 rounded-lg text-sm font-medium transition"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  )
}
