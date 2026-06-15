import { useDraggable } from '@dnd-kit/core'
import type { Session } from '@/types'
import { cn } from '@/lib/utils'

interface SessionBlockProps {
  session: Session
  style: React.CSSProperties
  statusColors: Record<string, string>
  onClick: () => void
}

export default function SessionBlock({ session, style, statusColors, onClick }: SessionBlockProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: session.id,
    data: { type: 'session', session },
  })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onClick}
      style={style}
      className={cn(
        'absolute top-0 h-full rounded-md border px-2 py-1 cursor-pointer transition-all duration-200 flex flex-col justify-center overflow-hidden',
        statusColors[session.status] || statusColors.available,
        isDragging && 'opacity-50 scale-95'
      )}
    >
      <div className="text-[10px] font-medium truncate">{session.theme_name || '主题'}</div>
      <div className="text-[9px] opacity-70 truncate">
        {session.start_time}-{session.end_time}
      </div>
      {session.npc_name && (
        <div className="text-[9px] opacity-60 truncate">NPC: {session.npc_name}</div>
      )}
    </div>
  )
}
