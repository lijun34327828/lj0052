import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Star } from 'lucide-react'
import { useStore } from '@/store'
import type { Theme } from '@/types'
import ThemeFormModal from './ThemeManagement/ThemeFormModal'

export default function ThemeManagement() {
  const { themes, fetchThemes, deleteTheme } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  useEffect(() => {
    fetchThemes()
  }, [fetchThemes])

  const handleEdit = (theme: Theme) => {
    setEditingTheme(theme)
    setShowForm(true)
  }

  const handleAdd = () => {
    setEditingTheme(null)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    await deleteTheme(id)
    setDeleteConfirm(null)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingTheme(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display text-neon-cyan neon-text">主题管理</h2>
        <button onClick={handleAdd} className="neon-btn flex items-center gap-2">
          <Plus size={16} />
          添加主题
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {themes.map((theme) => (
          <div key={theme.id} className="dark-card p-4 flex flex-col">
            {theme.cover && (
              <div className="w-full h-36 rounded-lg mb-3 overflow-hidden">
                <img src={theme.cover} alt={theme.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-base font-medium text-gray-100">{theme.name}</h3>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={i < theme.difficulty ? 'text-neon-orange fill-neon-orange' : 'text-gray-600'}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-3 line-clamp-2">{theme.description}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
              <span>{theme.min_players}-{theme.max_players}人</span>
              <span>{theme.duration}分钟</span>
            </div>
            <div className="flex items-center gap-2 mt-auto pt-3 border-t border-white/5">
              <button
                onClick={() => handleEdit(theme)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/10 transition-all"
              >
                <Edit2 size={12} />
                编辑
              </button>
              {deleteConfirm === theme.id ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDelete(theme.id)}
                    className="px-3 py-2 rounded-lg text-xs text-neon-red bg-neon-red/10 border border-neon-red/30"
                  >
                    确认
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-3 py-2 rounded-lg text-xs text-gray-400 border border-white/10"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(theme.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs text-neon-red border border-neon-red/30 hover:bg-neon-red/10 transition-all"
                >
                  <Trash2 size={12} />
                  删除
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {themes.length === 0 && (
        <div className="text-center py-16 text-gray-500">暂无主题，点击上方按钮添加</div>
      )}

      {showForm && (
        <ThemeFormModal theme={editingTheme} onClose={handleCloseForm} />
      )}
    </div>
  )
}
