import { useDroppable, useDraggable } from '@dnd-kit/core'
import type { NPC } from '@/types'
import { cn } from '@/lib/utils'
import { User } from 'lucide-react'

const NPC_STATUS_COLORS: Record<string, string> = {
  available: 'border-neon-cyan bg-neon-cyan/10',
  assigned: 'border-neon-purple bg-neon-purple/10',
  off: 'border-gray-600 bg-gray-600/10 opacity-50',
}

const NPC_STATUS_DOT: Record<string, string> = {
  available: 'bg-neon-cyan',
  assigned: 'bg-neon-purple',
  off: 'bg-gray-500',
}

interface NpcPanelProps {
  npcs: NPC[]
  statusColors: Record<string, string>
}

function NpcCard({ npc }: { npc: NPC }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: npc.id,
    data: { type: 'npc', npc },
    disabled: npc.status !== 'available',
  })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        'p-3 rounded-lg border cursor-grab active:cursor-grabbing transition-all duration-200',
        NPC_STATUS_COLORS[npc.status],
        isDragging && 'opacity-50 scale-95',
        npc.status !== 'available' && 'cursor-not-allowed'
      )}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-dark-600 flex items-center justify-center">
          <User size={14} className="text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-200 truncate">{npc.name}</div>
          <div className="flex items-center gap-1.5">
            <span className={cn('w-1.5 h-1.5 rounded-full', NPC_STATUS_DOT[npc.status])} />
            <span className="text-[10px] text-gray-400">
              {npc.status === 'available' ? '空闲' : npc.status === 'assigned' ? '已分配' : '休息'}
            </span>
          </div>
        </div>
      </div>
      {npc.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {npc.skills.slice(0, 3).map((skill) => (
            <span key={skill} className="text-[9px] px-1.5 py-0.5 rounded bg-dark-600 text-gray-400">
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function NpcPanel({ npcs }: NpcPanelProps) {
  const { setNodeRef } = useDroppable({ id: 'npc-panel' })

  return (
    <div ref={setNodeRef} className="w-56 flex-shrink-0 glass-panel p-4 overflow-y-auto">
      <h3 className="text-sm font-medium text-neon-cyan mb-3">NPC 分配</h3>
      <div className="space-y-2">
        {npcs.map((npc) => (
          <NpcCard key={npc.id} npc={npc} />
        ))}
      </div>
      {npcs.length === 0 && (
        <div className="text-center text-gray-500 text-sm py-8">暂无 NPC</div>
      )}
    </div>
  )
}
