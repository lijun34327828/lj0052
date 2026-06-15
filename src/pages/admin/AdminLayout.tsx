import { Outlet, Link, useLocation } from 'react-router-dom'
import { Calendar, Palette, Monitor, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/admin', label: '排期总览', icon: Calendar, end: true },
  { to: '/admin/themes', label: '主题管理', icon: Palette, end: false },
  { to: '/admin/onsite', label: '现场管控', icon: Monitor, end: false },
  { to: '/admin/stats', label: '数据统计', icon: BarChart3, end: false },
]

export default function AdminLayout() {
  const location = useLocation()

  const isActive = (item: typeof navItems[0]) => {
    if (item.end) return location.pathname === '/admin'
    return location.pathname.startsWith(item.to)
  }

  return (
    <div className="flex h-screen bg-dark-900 overflow-hidden">
      <aside className="w-60 flex-shrink-0 bg-dark-800 border-r border-white/5 flex flex-col">
        <div className="h-16 flex items-center justify-center border-b border-white/5">
          <h1 className="font-display text-neon-cyan text-lg tracking-wider neon-text">
            密室运营后台
          </h1>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-neon-cyan/10 text-neon-cyan border-l-2 border-neon-cyan shadow-neon'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                )}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-white/5">
          <div className="text-xs text-gray-500 text-center">v1.0.0</div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 flex items-center px-6 bg-dark-800/50 border-b border-white/5">
          <h2 className="font-body text-gray-300 text-sm">
            {navItems.find((i) => isActive(i))?.label ?? '管理后台'}
          </h2>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
