import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Star, Users, Clock, ArrowLeft, Minus, Plus } from 'lucide-react'
import dayjs from 'dayjs'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'
import type { Session } from '@/types'

function DifficultyStars({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={18}
          className={cn(
            i < level ? 'fill-neon-orange text-neon-orange' : 'text-dark-500'
          )}
        />
      ))}
    </div>
  )
}

function DaySelector({
  selectedDate,
  onSelect,
}: {
  selectedDate: string
  onSelect: (date: string) => void
}) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = dayjs().add(i, 'day')
    return {
      date: d.format('YYYY-MM-DD'),
      label: i === 0 ? '今天' : i === 1 ? '明天' : d.format('MM/DD'),
      weekday: d.format('ddd'),
    }
  })

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {days.map((d) => (
        <button
          key={d.date}
          onClick={() => onSelect(d.date)}
          className={cn(
            'flex-shrink-0 rounded-lg border px-4 py-3 text-center transition-all',
            selectedDate === d.date
              ? 'border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan'
              : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-300'
          )}
        >
          <div className="text-xs">{d.weekday}</div>
          <div className="mt-1 text-sm font-medium">{d.label}</div>
        </button>
      ))}
    </div>
  )
}

function TimeSlotPill({
  session,
  selected,
  onClick,
}: {
  session: Session
  selected: boolean
  onClick: () => void
}) {
  const isAvailable = session.status === 'available' && session.current_bookings < session.max_players
  const isFull = session.current_bookings >= session.max_players

  return (
    <button
      onClick={isAvailable ? onClick : undefined}
      disabled={!isAvailable}
      className={cn(
        'rounded-lg border px-4 py-2 text-sm font-medium transition-all',
        !isAvailable && 'cursor-not-allowed border-gray-700 bg-dark-800 text-gray-600',
        isAvailable && !selected && 'border-neon-cyan/30 bg-neon-cyan/5 text-neon-cyan hover:border-neon-cyan/60 hover:bg-neon-cyan/10',
        isAvailable && selected && 'border-neon-cyan bg-neon-cyan/20 text-neon-cyan shadow-neon',
        isFull && 'border-gray-700 bg-dark-800 text-gray-500'
      )}
    >
      {session.start_time}
      {isFull && <span className="ml-1 text-xs">(已满)</span>}
    </button>
  )
}

export default function ThemeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { themes, sessions, loading, fetchThemes, fetchSessions, createBooking } = useStore()

  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [playerName, setPlayerName] = useState('')
  const [phone, setPhone] = useState('')
  const [playerCount, setPlayerCount] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const themeId = Number(id)
  const theme = themes.find((t) => t.id === themeId)

  useEffect(() => {
    if (themes.length === 0) fetchThemes()
  }, [fetchThemes, themes.length])

  useEffect(() => {
    fetchSessions(selectedDate, themeId)
    setSelectedSession(null)
  }, [selectedDate, themeId, fetchSessions])

  const filteredSessions = sessions.filter((s) => s.theme_id === themeId)

  const handleSubmit = async () => {
    if (!selectedSession || !playerName.trim() || !phone.trim()) return
    setSubmitting(true)
    try {
      await createBooking({
        session_id: selectedSession.id,
        player_name: playerName.trim(),
        phone: phone.trim(),
        player_count: playerCount,
      })
      setShowSuccess(true)
      localStorage.setItem('bookingPhone', phone.trim())
      setTimeout(() => {
        navigate('/my-bookings')
      }, 1500)
    } catch {
      // error is set in store
    } finally {
      setSubmitting(false)
    }
  }

  if (!theme && !loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark-900">
        <p className="text-gray-500">主题不存在</p>
      </div>
    )
  }

  if (!theme) return null

  return (
    <div className="min-h-screen bg-dark-900">
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/80 animate-fade-in">
          <div className="neon-border glass-panel p-10 text-center animate-slide-up">
            <div className="text-4xl">✅</div>
            <p className="mt-4 font-display text-xl neon-text">预约成功!</p>
            <p className="mt-2 text-sm text-gray-400">正在跳转到我的预约...</p>
          </div>
        </div>
      )}

      <div className="relative h-72 overflow-hidden">
        <img
          src={theme.cover}
          alt={theme.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/50 to-transparent" />
        <button
          onClick={() => navigate('/')}
          className="absolute left-4 top-4 flex items-center gap-2 rounded-lg border border-white/20 bg-dark-900/60 px-3 py-2 text-sm text-white backdrop-blur-sm transition-colors hover:bg-dark-900/80"
        >
          <ArrowLeft size={16} />
          返回大厅
        </button>
      </div>

      <div className="mx-auto max-w-4xl px-6 -mt-16 relative z-10">
        <div className="space-y-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">{theme.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-5">
              <DifficultyStars level={theme.difficulty} />
              <span className="flex items-center gap-1.5 text-sm text-gray-400">
                <Users size={16} className="text-neon-cyan" />
                {theme.min_players}-{theme.max_players}人
              </span>
              <span className="flex items-center gap-1.5 text-sm text-gray-400">
                <Clock size={16} className="text-neon-cyan" />
                {theme.duration}分钟
              </span>
            </div>
          </div>

          {theme.story && (
            <div className="glass-panel p-6">
              <h2 className="mb-3 font-display text-lg text-neon-cyan">剧情背景</h2>
              <p className="leading-relaxed text-gray-300">{theme.story}</p>
            </div>
          )}

          {theme.description && (
            <div className="glass-panel p-6">
              <h2 className="mb-3 font-display text-lg text-neon-cyan">主题介绍</h2>
              <p className="leading-relaxed text-gray-300">{theme.description}</p>
            </div>
          )}

          <div className="glass-panel p-6">
            <h2 className="mb-4 font-display text-lg text-neon-cyan">选择场次</h2>
            <DaySelector selectedDate={selectedDate} onSelect={setSelectedDate} />

            <div className="mt-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-neon-cyan border-t-transparent" />
                </div>
              ) : filteredSessions.length === 0 ? (
                <p className="py-8 text-center text-gray-500">当日暂无场次</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {filteredSessions.map((s) => (
                    <TimeSlotPill
                      key={s.id}
                      session={s}
                      selected={selectedSession?.id === s.id}
                      onClick={() => setSelectedSession(s)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {selectedSession && (
            <div className="glass-panel animate-slide-up p-6">
              <h2 className="mb-4 font-display text-lg text-neon-cyan">预约信息</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm text-gray-400">玩家姓名</label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="请输入姓名"
                    className="w-full rounded-lg border border-white/10 bg-dark-800 px-4 py-2.5 text-sm text-white placeholder-dark-500 outline-none transition-colors focus:border-neon-cyan/50"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-gray-400">手机号码</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="请输入手机号"
                    className="w-full rounded-lg border border-white/10 bg-dark-800 px-4 py-2.5 text-sm text-white placeholder-dark-500 outline-none transition-colors focus:border-neon-cyan/50"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-gray-400">游玩人数</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setPlayerCount((c) => Math.max(1, c - 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-dark-800 text-white transition-colors hover:border-neon-cyan/30"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center text-lg font-medium text-white">
                      {playerCount}
                    </span>
                    <button
                      onClick={() =>
                        setPlayerCount((c) => Math.min(theme.max_players, c + 1))
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-dark-800 text-white transition-colors hover:border-neon-cyan/30"
                    >
                      <Plus size={16} />
                    </button>
                    <span className="text-sm text-gray-500">
                      ({theme.min_players}-{theme.max_players}人)
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !playerName.trim() || !phone.trim()}
                  className={cn(
                    'neon-btn w-full text-center',
                    (submitting || !playerName.trim() || !phone.trim()) &&
                      'cursor-not-allowed opacity-50'
                  )}
                >
                  {submitting ? '预约中...' : '一键预约'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
