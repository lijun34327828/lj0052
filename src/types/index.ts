export interface Theme {
  id: number
  name: string
  cover: string
  difficulty: 1 | 2 | 3 | 4 | 5
  min_players: number
  max_players: number
  duration: number
  description: string
  story: string
}

export interface Session {
  id: number
  theme_id: number
  room_id: number
  date: string
  start_time: string
  end_time: string
  status: 'available' | 'booked' | 'in_progress' | 'completed' | 'cancelled'
  npc_id: number | null
  current_bookings: number
  max_players: number
  theme_name?: string
  room_name?: string
  npc_name?: string
}

export interface Booking {
  id: number
  session_id: number
  player_name: string
  phone: string
  player_count: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'no_show'
  created_at: string
  date?: string
  start_time?: string
  end_time?: string
  theme_name?: string
  theme_cover?: string
  duration?: number
  session_status?: string
}

export interface NPC {
  id: number
  name: string
  avatar: string
  skills: string[]
  status: 'available' | 'assigned' | 'off'
}

export interface Room {
  id: number
  name: string
  theme_id: number
  cleaning_status: 'clean' | 'dirty'
  theme_name?: string
  damaged_props_count?: number
  props?: PropItem[]
}

export interface PropItem {
  id: number
  room_id: number
  name: string
  condition: 'normal' | 'damaged'
}

export interface ThemeStat {
  theme_id: number
  theme_name: string
  booking_count: number
  percentage: number
}

export interface TrendData {
  date: string
  count: number
}

export interface NPCWorkload {
  npc_id: number
  npc_name: string
  session_count: number
}
