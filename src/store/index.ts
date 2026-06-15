import { create } from 'zustand'
import type { Theme, Session, Booking, NPC, Room, ThemeStat, TrendData, NPCWorkload } from '@/types'

interface AppState {
  themes: Theme[]
  sessions: Session[]
  bookings: Booking[]
  npcs: NPC[]
  rooms: Room[]
  themeStats: ThemeStat[]
  trendData: TrendData[]
  npcWorkload: NPCWorkload[]
  loading: boolean
  error: string | null

  fetchThemes: () => Promise<void>
  fetchSessions: (date?: string, themeId?: number) => Promise<void>
  fetchBookings: (phone?: string) => Promise<void>
  fetchNpcs: () => Promise<void>
  fetchRooms: () => Promise<void>
  fetchThemeStats: () => Promise<void>
  fetchTrendData: (days?: number) => Promise<void>
  fetchNpcWorkload: () => Promise<void>

  createBooking: (data: { session_id: number; player_name: string; phone: string; player_count: number }) => Promise<void>
  cancelBooking: (id: number) => Promise<void>
  assignNpc: (sessionId: number, npcId: number | null) => Promise<void>
  updateSessionStatus: (id: number, data: Partial<Session>) => Promise<void>
  updateRoom: (id: number, data: Partial<Room>) => Promise<void>
  updatePropCondition: (roomId: number, propId: number, condition: string) => Promise<void>
  generateSessions: (date: string) => Promise<void>

  createTheme: (data: Partial<Theme>) => Promise<void>
  updateTheme: (id: number, data: Partial<Theme>) => Promise<void>
  deleteTheme: (id: number) => Promise<void>
}

export const useStore = create<AppState>((set, get) => ({
  themes: [],
  sessions: [],
  bookings: [],
  npcs: [],
  rooms: [],
  themeStats: [],
  trendData: [],
  npcWorkload: [],
  loading: false,
  error: null,

  fetchThemes: async () => {
    set({ loading: true })
    try {
      const res = await fetch('/api/themes')
      const data = await res.json()
      set({ themes: data, loading: false })
    } catch (error) {
      set({ error: 'Failed to fetch themes', loading: false })
    }
  },

  fetchSessions: async (date?: string, themeId?: number) => {
    set({ loading: true })
    try {
      const params = new URLSearchParams()
      if (date) params.set('date', date)
      if (themeId) params.set('themeId', String(themeId))
      const res = await fetch(`/api/sessions?${params}`)
      const data = await res.json()
      set({ sessions: data, loading: false })
    } catch (error) {
      set({ error: 'Failed to fetch sessions', loading: false })
    }
  },

  fetchBookings: async (phone?: string) => {
    set({ loading: true })
    try {
      const params = phone ? `?phone=${phone}` : ''
      const res = await fetch(`/api/bookings${params}`)
      const data = await res.json()
      set({ bookings: data, loading: false })
    } catch (error) {
      set({ error: 'Failed to fetch bookings', loading: false })
    }
  },

  fetchNpcs: async () => {
    try {
      const res = await fetch('/api/npcs')
      const data = await res.json()
      set({ npcs: data })
    } catch (error) {
      set({ error: 'Failed to fetch NPCs' })
    }
  },

  fetchRooms: async () => {
    try {
      const res = await fetch('/api/rooms')
      const data = await res.json()
      set({ rooms: data })
    } catch (error) {
      set({ error: 'Failed to fetch rooms' })
    }
  },

  fetchThemeStats: async () => {
    try {
      const res = await fetch('/api/stats/theme-popularity')
      const data = await res.json()
      set({ themeStats: data })
    } catch (error) {
      set({ error: 'Failed to fetch theme stats' })
    }
  },

  fetchTrendData: async (days = 7) => {
    try {
      const res = await fetch(`/api/stats/booking-trend?days=${days}`)
      const data = await res.json()
      set({ trendData: data })
    } catch (error) {
      set({ error: 'Failed to fetch trend data' })
    }
  },

  fetchNpcWorkload: async () => {
    try {
      const res = await fetch('/api/stats/npc-workload')
      const data = await res.json()
      set({ npcWorkload: data })
    } catch (error) {
      set({ error: 'Failed to fetch NPC workload' })
    }
  },

  createBooking: async (data) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Booking failed')
      }
      const booking = await res.json()
      set(state => ({ bookings: [booking, ...state.bookings] }))
      await get().fetchSessions(data.session_id ? undefined : undefined)
    } catch (error: any) {
      set({ error: error.message })
      throw error
    }
  },

  cancelBooking: async (id) => {
    try {
      await fetch(`/api/bookings/${id}/cancel`, { method: 'PUT' })
      set(state => ({
        bookings: state.bookings.map(b => b.id === id ? { ...b, status: 'cancelled' as const } : b)
      }))
    } catch (error) {
      set({ error: 'Failed to cancel booking' })
    }
  },

  assignNpc: async (sessionId, npcId) => {
    try {
      await fetch(`/api/sessions/${sessionId}/assign-npc`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ npcId })
      })
      await get().fetchSessions()
      await get().fetchNpcs()
    } catch (error) {
      set({ error: 'Failed to assign NPC' })
    }
  },

  updateSessionStatus: async (id, data) => {
    try {
      const session = get().sessions.find(s => s.id === id)
      if (!session) return
      await fetch(`/api/sessions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...session, ...data })
      })
      await get().fetchSessions()
    } catch (error) {
      set({ error: 'Failed to update session' })
    }
  },

  updateRoom: async (id, data) => {
    try {
      const room = get().rooms.find(r => r.id === id)
      if (!room) return
      await fetch(`/api/rooms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: room.name, ...data })
      })
      await get().fetchRooms()
    } catch (error) {
      set({ error: 'Failed to update room' })
    }
  },

  updatePropCondition: async (roomId, propId, condition) => {
    try {
      await fetch(`/api/rooms/${roomId}/props`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propId, condition })
      })
      await get().fetchRooms()
    } catch (error) {
      set({ error: 'Failed to update prop condition' })
    }
  },

  generateSessions: async (date) => {
    try {
      await fetch('/api/sessions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date })
      })
      await get().fetchSessions(date)
    } catch (error) {
      set({ error: 'Failed to generate sessions' })
    }
  },

  createTheme: async (data) => {
    try {
      await fetch('/api/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      await get().fetchThemes()
    } catch (error) {
      set({ error: 'Failed to create theme' })
    }
  },

  updateTheme: async (id, data) => {
    try {
      await fetch(`/api/themes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      await get().fetchThemes()
    } catch (error) {
      set({ error: 'Failed to update theme' })
    }
  },

  deleteTheme: async (id) => {
    try {
      await fetch(`/api/themes/${id}`, { method: 'DELETE' })
      set(state => ({ themes: state.themes.filter(t => t.id !== id) }))
    } catch (error) {
      set({ error: 'Failed to delete theme' })
    }
  },
}))
