import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-indigo-600 text-white px-6 py-4 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-2">
        <svg className="w-6 h-6 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
        </svg>
        <h1 className="text-lg font-bold tracking-wide">FastAPI JWT Demo</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-indigo-200 text-sm">
          Hola,{' '}
          <span className="font-semibold text-white capitalize">{user?.username}</span>
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
