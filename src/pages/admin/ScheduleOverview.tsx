import { useState, useEffect, useCallback } from 'react'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import dayjs from 'dayjs'
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react'
import { useStore } from '@/store'
import SessionBlock from './ScheduleOverview/SessionBlock'
import NpcPanel from './ScheduleOverview/NpcPanel'
import SessionDetailModal from './ScheduleOverview/SessionDetailModal'

const TIME_SLOTS = Array.from({ length: 12 }, (_, i) => {
  const h = i + 10
  return `${String(h).padStart(2, '0')}:00`
})

const STATUS_COLORS: Record<string, string> = {
  available: 'bg-neon-cyan/30 border-neon-cyan text-neon-cyan',
  booked: 'bg-neon-purple/30 border-neon-purple text-neon-purple',
  in_progress: 'bg-neon-orange/30 border-neon-orange text-neon-orange',
  completed: 'bg-gray-600/30 border-gray-500 text-gray-400',
  cancelled: 'bg-neon-red/20 border-neon-red/50 text-neon-red/50',
}

export default function ScheduleOverview() {
  const { sessions, rooms, npcs, fetchSessions, fetchRooms, fetchNpcs, generateSessions, assignNpc } = useStore()
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [selectedSession, setSelectedSession] = useState<number | null>(null)

  useEffect(() => {
    fetchSessions(selectedDate)
    fetchRooms()
    fetchNpcs()
  }, [selectedDate, fetchSessions, fetchRooms, fetchNpcs])

  const changeDate = (delta: number) => {
    setSelectedDate(dayjs(selectedDate).add(delta, 'day').format('YYYY-MM-DD'))
  }

  const handleGenerate = async () => {
    await generateSessions(selectedDate)
  }

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return
    const npcId = Number(active.id)
    const sessionId = Number(over.id)
    if (npcId && sessionId) {
      await assignNpc(sessionId, npcId)
    }
  }, [assignNpc])

  const roomsData = rooms.length > 0 ? rooms : [{ id: 0, name: '房间1' }, { id: 1, name: '房间2' }, { id: 2, name: '房间3' }]
  const sessionsByRoom = roomsData.map((room) => ({
    room,
    sessions: sessions.filter((s) => s.room_id === room.id),
  }))

  const getSessionsForSlot = (roomId: number, slot: string) => {
    return sessions.filter(
      (s) => s.room_id === roomId && s.start_time <= slot && s.end_time > slot
    )
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex gap-6 h-full">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button onClick={() => changeDate(-1)} className="neon-btn !px-3 !py-1.5">
                <ChevronLeft size={16} />
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-dark-700 border border-white/10 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:border-neon-cyan/50"
              />
              <button onClick={() => changeDate(1)} className="neon-btn !px-3 !py-1.5">
                <ChevronRight size={16} />
              </button>
            </div>
            <button onClick={handleGenerate} className="neon-btn flex items-center gap-2">
              <Zap size={16} />
              生成场次
            </button>
          </div>

          <div className="flex-1 overflow-auto">
            <div className="min-w-[900px]">
              <div className="flex border-b border-white/10 pb-2 mb-2">
                <div className="w-28 flex-shrink-0 text-xs text-gray-500 font-medium px-2">房间</div>
                {TIME_SLOTS.map((slot) => (
                  <div key={slot} className="flex-1 text-xs text-gray-500 font-medium text-center px-1">
                    {slot}
                  </div>
                ))}
              </div>

              {sessionsByRoom.map(({ room }) => (
                <div key={room.id} className="flex items-center min-h-[52px] mb-1">
                  <div className="w-28 flex-shrink-0 text-sm text-gray-300 px-2 truncate">
                    {room.name}
                  </div>
                  <div className="flex-1 relative h-12">
                    {TIME_SLOTS.map((slot) => {
                      const slotSessions = getSessionsForSlot(room.id, slot)
                      const session = slotSessions[0]
                      if (!session) return <div key={slot} className="absolute h-full" style={{ left: `${((parseInt(slot) - 10) / 12) * 100}%`, width: `${100 / 12}%` }} />
                      if (session.start_time !== slot) return null
                      const durationSlots = Math.max(1, Math.round(
                        (parseInt(session.end_time) - parseInt(session.start_time))
                      ))
                      return (
                        <SessionBlock
                          key={session.id}
                          session={session}
                          style={{
                            left: `${((parseInt(session.start_time) - 10) / 12) * 100}%`,
                            width: `${(durationSlots / 12) * 100}%`,
                          }}
                          statusColors={STATUS_COLORS}
                          onClick={() => setSelectedSession(session.id)}
                        />
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <NpcPanel npcs={npcs} statusColors={STATUS_COLORS} />
      </div>

      {selectedSession && (
        <SessionDetailModal
          sessionId={selectedSession}
          sessions={sessions}
          statusColors={STATUS_COLORS}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </DndContext>
  )
}
