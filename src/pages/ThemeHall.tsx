import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Star, Users, Clock, CalendarCheck } from 'lucide-react'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'
import type { Theme } from '@/types'

function DifficultyStars({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={14}
          className={cn(
            i < level ? 'fill-neon-orange text-neon-orange' : 'text-dark-500'
          )}
        />
      ))}
    </div>
  )
}

function ThemeCard({ theme }: { theme: Theme }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/theme/${theme.id}`)}
      className="dark-card neon-border-hover cursor-pointer overflow-hidden group"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={theme.cover}
          alt={theme.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3">
          <h3 className="font-display text-lg font-bold text-white drop-shadow-lg">
            {theme.name}
          </h3>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <DifficultyStars level={theme.difficulty} />
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <Users size={14} className="text-neon-cyan" />
            {theme.min_players}-{theme.max_players}人
          </span>
          <span className="flex items-center gap-1">
            <Clock size={14} className="text-neon-cyan" />
            {theme.duration}分钟
          </span>
        </div>
      </div>
    </div>
  )
}

export default function ThemeHall() {
  const { themes, fetchThemes, loading } = useStore()
  const [search, setSearch] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<number>(0)
  const [playerFilter, setPlayerFilter] = useState<number>(0)

  useEffect(() => {
    fetchThemes()
  }, [fetchThemes])

  const filteredThemes = useMemo(() => {
    return themes.filter((t) => {
      const matchSearch = t.name.toLowerCase().includes(search.toLowerCase())
      const matchDifficulty = difficultyFilter === 0 || t.difficulty === difficultyFilter
      const matchPlayers =
        playerFilter === 0 || (t.min_players <= playerFilter && t.max_players >= playerFilter)
      return matchSearch && matchDifficulty && matchPlayers
    })
  }, [themes, search, difficultyFilter, playerFilter])

  return (
    <div className="min-h-screen bg-dark-900">
      <header className="sticky top-0 z-50 glass-panel border-b border-white/5 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="font-display text-2xl font-bold neon-text">密室逃脱</h1>
          <Link
            to="/my-bookings"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-neon-cyan transition-colors hover:bg-white/5"
          >
            <CalendarCheck size={18} />
            我的预约
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
            <input
              type="text"
              placeholder="搜索主题..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-dark-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder-dark-500 outline-none transition-colors focus:border-neon-cyan/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">难度:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setDifficultyFilter(0)}
                className={cn(
                  'rounded px-2 py-1 text-xs transition-colors',
                  difficultyFilter === 0
                    ? 'bg-neon-cyan/20 text-neon-cyan'
                    : 'text-gray-400 hover:bg-white/5'
                )}
              >
                全部
              </button>
              {[1, 2, 3, 4, 5].map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficultyFilter(d)}
                  className={cn(
                    'rounded px-2 py-1 text-xs transition-colors',
                    difficultyFilter === d
                      ? 'bg-neon-orange/20 text-neon-orange'
                      : 'text-gray-400 hover:bg-white/5'
                  )}
                >
                  {'★'.repeat(d)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">人数:</span>
            <input
              type="number"
              min={0}
              max={20}
              value={playerFilter || ''}
              onChange={(e) => setPlayerFilter(Number(e.target.value))}
              placeholder="不限"
              className="w-20 rounded-lg border border-white/10 bg-dark-800 px-3 py-2 text-sm text-white placeholder-dark-500 outline-none focus:border-neon-cyan/50"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon-cyan border-t-transparent" />
          </div>
        ) : filteredThemes.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            <p className="text-lg">未找到匹配的主题</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredThemes.map((theme) => (
              <ThemeCard key={theme.id} theme={theme} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
