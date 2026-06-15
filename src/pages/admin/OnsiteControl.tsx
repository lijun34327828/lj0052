import { useState, useEffect, useMemo } from 'react'
import dayjs from 'dayjs'
import { AlertTriangle, X, SprayCan, Wrench } from 'lucide-react'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'
import type { Booking, Room, PropItem } from '@/types'

export default function OnsiteControl() {
  const { bookings, rooms, fetchBookings, fetchRooms, updateRoom, updatePropCondition } = useStore()
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchBookings()
    fetchRooms()
  }, [fetchBookings, fetchRooms])

  const upcomingAlerts = useMemo(() => {
    const now = dayjs()
    return bookings.filter((b) => {
      if (b.status !== 'confirmed' || !b.date || !b.start_time) return false
      const sessionTime = dayjs(`${b.date} ${b.start_time}`)
      const diff = sessionTime.diff(now, 'minute')
      return diff > 0 && diff <= 30 && !dismissedAlerts.has(b.id)
    })
  }, [bookings, dismissedAlerts])

  const dismissAlert = (id: number) => {
    setDismissedAlerts((prev) => new Set(prev).add(id))
  }

  const toggleCleaning = async (room: Room) => {
    const newStatus = room.cleaning_status === 'clean' ? 'dirty' : 'clean'
    await updateRoom(room.id, { cleaning_status: newStatus })
  }

  const togglePropCondition = async (roomId: number, prop: PropItem) => {
    const newCondition = prop.condition === 'normal' ? 'damaged' : 'normal'
    await updatePropCondition(roomId, prop.id, newCondition)
  }

  return (
    <div className="space-y-6">
      <AlertSection alerts={upcomingAlerts} onDismiss={dismissAlert} />
      <RoomStatusGrid rooms={rooms} onToggleCleaning={toggleCleaning} onToggleProp={togglePropCondition} />
    </div>
  )
}

function AlertSection({ alerts, onDismiss }: { alerts: Booking[]; onDismiss: (id: number) => void }) {
  if (alerts.length === 0) return null

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={18} className="text-neon-red animate-pulse" />
        <h2 className="text-lg font-medium text-neon-red">未到店提醒</h2>
        <span className="text-xs text-gray-500">({alerts.length}条)</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {alerts.map((booking) => (
          <div
            key={booking.id}
            className="dark-card p-4 border-neon-red/50 animate-glow-pulse"
            style={{ boxShadow: '0 0 10px rgba(255,45,85,0.2), 0 0 20px rgba(255,45,85,0.1)' }}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-sm font-medium text-gray-100">{booking.player_name}</div>
                <div className="text-xs text-gray-400">{booking.phone}</div>
              </div>
              <button
                onClick={() => onDismiss(booking.id)}
                className="text-gray-500 hover:text-gray-200 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="text-neon-cyan">{booking.theme_name}</span>
              <span>{booking.date} {booking.start_time}</span>
            </div>
            <div className="text-[10px] text-neon-red/70 mt-2">即将开始，玩家未到店</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RoomStatusGrid({
  rooms,
  onToggleCleaning,
  onToggleProp,
}: {
  rooms: Room[]
  onToggleCleaning: (room: Room) => void
  onToggleProp: (roomId: number, prop: PropItem) => void
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <SprayCan size={18} className="text-neon-cyan" />
        <h2 className="text-lg font-medium text-neon-cyan">房间状态</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <div key={room.id} className="dark-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-medium text-gray-200">{room.name}</h3>
                {room.theme_name && (
                  <span className="text-[10px] text-gray-500">{room.theme_name}</span>
                )}
              </div>
              <button
                onClick={() => onToggleCleaning(room)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all',
                  room.cleaning_status === 'clean'
                    ? 'border-green-500/40 text-green-400 bg-green-500/10'
                    : 'border-neon-red/40 text-neon-red bg-neon-red/10'
                )}
              >
                <SprayCan size={12} />
                {room.cleaning_status === 'clean' ? '已清洁' : '待清洁'}
              </button>
            </div>

            {room.props && room.props.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2 text-xs text-gray-500">
                  <Wrench size={12} />
                  <span>道具状态</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {room.props.map((prop) => (
                    <button
                      key={prop.id}
                      onClick={() => onToggleProp(room.id, prop)}
                      className={cn(
                        'px-2 py-1 rounded text-[10px] border transition-all',
                        prop.condition === 'normal'
                          ? 'border-green-500/30 text-green-400 bg-green-500/5'
                          : 'border-neon-red/30 text-neon-red bg-neon-red/5'
                      )}
                    >
                      {prop.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(!room.props || room.props.length === 0) && (
              <div className="text-xs text-gray-600">暂无道具信息</div>
            )}
          </div>
        ))}
      </div>
      {rooms.length === 0 && (
        <div className="text-center py-12 text-gray-500">暂无房间信息</div>
      )}
    </div>
  )
}
