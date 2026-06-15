import { useDroppable } from '@dnd-kit/core'
import { X } from 'lucide-react'
import type { Session } from '@/types'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'

const STATUS_LABELS: Record<string, string> = {
  available: '可预约',
  booked: '已预约',
  in_progress: '进行中',
  completed: '已完成',
  cancelled: '已取消',
}

const STATUS_OPTIONS: Session['status'][] = ['available', 'booked', 'in_progress', 'completed', 'cancelled']

interface SessionDetailModalProps {
  sessionId: number
  sessions: Session[]
  statusColors: Record<string, string>
  onClose: () => void
}

export default function SessionDetailModal({ sessionId, sessions, statusColors, onClose }: SessionDetailModalProps) {
  const { updateSessionStatus } = useStore()
  const { setNodeRef } = useDroppable({ id: sessionId })
  const session = sessions.find((s) => s.id === sessionId)

  if (!session) return null

  const handleChangeStatus = async (status: Session['status']) => {
    await updateSessionStatus(sessionId, { status })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={setNodeRef}
        className="glass-panel w-96 p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-neon-cyan">场次详情</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 mb-6">
          <InfoRow label="主题" value={session.theme_name || '-'} />
          <InfoRow label="房间" value={session.room_name || '-'} />
          <InfoRow label="时间" value={`${session.start_time} - ${session.end_time}`} />
          <InfoRow label="人数" value={`${session.current_bookings}/${session.max_players}`} />
          <InfoRow label="NPC" value={session.npc_name || '未分配'} />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 w-14">状态</span>
            <span className={cn('px-2 py-0.5 rounded text-xs border', statusColors[session.status])}>
              {STATUS_LABELS[session.status]}
            </span>
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-400 mb-2">切换状态</div>
          <div className="grid grid-cols-2 gap-2">
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                onClick={() => handleChangeStatus(status)}
                disabled={session.status === status}
                className={cn(
                  'px-3 py-2 rounded-lg text-xs border transition-all duration-200',
                  statusColors[status],
                  session.status === status ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                )}
              >
                {STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 text-[10px] text-gray-500 text-center">拖拽 NPC 卡片到此处可分配 NPC</div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-400 w-14">{label}</span>
      <span className="text-sm text-gray-200">{value}</span>
    </div>
  )
}
