import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useStore } from '@/store'
import type { Theme } from '@/types'

interface ThemeFormModalProps {
  theme: Theme | null
  onClose: () => void
}

const emptyForm = {
  name: '',
  cover: '',
  difficulty: 3 as 1 | 2 | 3 | 4 | 5,
  min_players: 2,
  max_players: 6,
  duration: 60,
  description: '',
  story: '',
}

export default function ThemeFormModal({ theme, onClose }: ThemeFormModalProps) {
  const { createTheme, updateTheme } = useStore()
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (theme) {
      setForm({
        name: theme.name,
        cover: theme.cover,
        difficulty: theme.difficulty,
        min_players: theme.min_players,
        max_players: theme.max_players,
        duration: theme.duration,
        description: theme.description,
        story: theme.story,
      })
    }
  }, [theme])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (theme) {
      await updateTheme(theme.id, form)
    } else {
      await createTheme(form)
    }
    onClose()
  }

  const updateField = <K extends keyof typeof form>(key: K, value: typeof form[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass-panel w-[480px] max-h-[85vh] overflow-y-auto p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-medium text-neon-cyan">
            {theme ? '编辑主题' : '添加主题'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="主题名称">
            <input
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full bg-dark-700 border border-white/10 rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-neon-cyan/50"
              required
            />
          </FormField>

          <FormField label="封面 URL">
            <input
              value={form.cover}
              onChange={(e) => updateField('cover', e.target.value)}
              className="w-full bg-dark-700 border border-white/10 rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-neon-cyan/50"
            />
          </FormField>

          <FormField label="难度">
            <select
              value={form.difficulty}
              onChange={(e) => updateField('difficulty', Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
              className="w-full bg-dark-700 border border-white/10 rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-neon-cyan/50"
            >
              {[1, 2, 3, 4, 5].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </FormField>

          <div className="grid grid-cols-3 gap-3">
            <FormField label="最少人数">
              <input
                type="number"
                min={1}
                value={form.min_players}
                onChange={(e) => updateField('min_players', Number(e.target.value))}
                className="w-full bg-dark-700 border border-white/10 rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-neon-cyan/50"
              />
            </FormField>
            <FormField label="最多人数">
              <input
                type="number"
                min={1}
                value={form.max_players}
                onChange={(e) => updateField('max_players', Number(e.target.value))}
                className="w-full bg-dark-700 border border-white/10 rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-neon-cyan/50"
              />
            </FormField>
            <FormField label="时长(分)">
              <input
                type="number"
                min={10}
                value={form.duration}
                onChange={(e) => updateField('duration', Number(e.target.value))}
                className="w-full bg-dark-700 border border-white/10 rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-neon-cyan/50"
              />
            </FormField>
          </div>

          <FormField label="简介">
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={2}
              className="w-full bg-dark-700 border border-white/10 rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-neon-cyan/50 resize-none"
            />
          </FormField>

          <FormField label="故事背景">
            <textarea
              value={form.story}
              onChange={(e) => updateField('story', e.target.value)}
              rows={3}
              className="w-full bg-dark-700 border border-white/10 rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-neon-cyan/50 resize-none"
            />
          </FormField>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="neon-btn flex-1">
              {theme ? '保存修改' : '创建主题'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 px-6 py-2.5 rounded-lg text-sm text-gray-400 border border-white/10 hover:bg-white/5 transition-all">
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
