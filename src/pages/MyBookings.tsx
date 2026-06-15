import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, CalendarX, ArrowLeft, Users, Clock } from 'lucide-react'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'
import type { Booking } from '@/types'

const statusConfig: Record<
  Booking['status'],
  { label: string; className: string }
> = {
  pending: {
    label: '待确认',
    className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  },
  confirmed: {
    label: '已确认',
    className: 'bg-neon-cyan/15 text-neon-cyan border-neon-cyan/30',
  },
  cancelled: {
    label: '已取消',
    className: 'bg-neon-red/15 text-neon-red border-neon-red/30',
  },
  no_show: {
    label: '未到店',
    className: 'bg-neon-orange/15 text-neon-orange border-neon-orange/30',
  },
}

function BookingCard({
  booking,
  onCancel,
}: {
  booking: Booking
  onCancel: (id: number) => void
}) {
  const config = statusConfig[booking.status]
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed'

  return (
    <div className="dark-card overflow-hidden">
      <div className="flex gap-4 p-4">
        {booking.theme_cover && (
          <img
            src={booking.theme_cover}
            alt={booking.theme_name}
            className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
          />
        )}
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-display text-base font-bold text-white">
              {booking.theme_name || `场次 #${booking.session_id}`}
            </h3>
            <span
              className={cn(
                'rounded-full border px-2.5 py-0.5 text-xs font-medium',
                config.className
              )}
            >
              {config.label}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
            {booking.date && (
              <span className="flex items-center gap-1">
                <CalendarX size={14} />
                {booking.date}
              </span>
            )}
            {booking.start_time && (
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {booking.start_time} - {booking.end_time}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users size={14} />
              {booking.player_count}人
            </span>
          </div>
          <div className="text-xs text-gray-500">
            预约人: {booking.player_name} | {booking.phone}
          </div>
          {canCancel && (
            <button
              onClick={() => onCancel(booking.id)}
              className="neon-btn-danger mt-1 px-4 py-1.5 text-xs"
            >
              取消预约
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MyBookings() {
  const { bookings, loading, fetchBookings, cancelBooking } = useStore()
  const [phone, setPhone] = useState('')
  const [searched, setSearched] = useState(false)

  const handleSearch = () => {
    if (!phone.trim()) return
    fetchBookings(phone.trim())
    setSearched(true)
  }

  const handleCancel = async (id: number) => {
    await cancelBooking(id)
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <header className="sticky top-0 z-50 glass-panel border-b border-white/5 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-gray-400 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} />
            返回
          </Link>
          <h1 className="font-display text-xl font-bold neon-text">我的预约</h1>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8 flex gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="输入手机号查询预约"
              className="w-full rounded-lg border border-white/10 bg-dark-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder-dark-500 outline-none transition-colors focus:border-neon-cyan/50"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={!phone.trim()}
            className={cn(
              'neon-btn',
              !phone.trim() && 'cursor-not-allowed opacity-50'
            )}
          >
            查询
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon-cyan border-t-transparent" />
          </div>
        ) : searched && bookings.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-dark-700">
              <CalendarX size={32} className="text-dark-500" />
            </div>
            <p className="text-lg text-gray-500">暂无预约记录</p>
            <p className="mt-1 text-sm text-gray-600">输入手机号查询您的预约</p>
          </div>
        ) : !searched ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-dark-700">
              <Search size={32} className="text-dark-500" />
            </div>
            <p className="text-lg text-gray-500">输入手机号查询预约</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={handleCancel}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
