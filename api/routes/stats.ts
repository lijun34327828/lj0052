import { Router, type Request, type Response } from 'express'
import { getDb } from '../database.js'
import dayjs from 'dayjs'

const router = Router()

router.get('/theme-popularity', (_req: Request, res: Response) => {
  const db = getDb()
  const stats = db.prepare(`
    SELECT t.id as theme_id, t.name as theme_name,
      COUNT(b.id) as booking_count
    FROM themes t
    LEFT JOIN sessions s ON s.theme_id = t.id
    LEFT JOIN bookings b ON b.session_id = s.id AND b.status != 'cancelled'
    GROUP BY t.id, t.name
    ORDER BY booking_count DESC
  `).all() as any[]

  const total = stats.reduce((sum, s) => sum + s.booking_count, 0)
  const result = stats.map(s => ({
    ...s,
    percentage: total > 0 ? Math.round((s.booking_count / total) * 100) : 0
  }))

  res.json(result)
})

router.get('/booking-trend', (req: Request, res: Response) => {
  const db = getDb()
  const days = Number(req.query.days) || 7
  const endDate = dayjs()
  const trendData = []

  for (let i = days - 1; i >= 0; i--) {
    const date = endDate.subtract(i, 'day').format('YYYY-MM-DD')
    const result = db.prepare(`
      SELECT COUNT(*) as count
      FROM bookings
      WHERE date(created_at) = ? AND status != 'cancelled'
    `).get(date) as any
    trendData.push({ date, count: result?.count || 0 })
  }

  res.json(trendData)
})

router.get('/npc-workload', (_req: Request, res: Response) => {
  const db = getDb()
  const stats = db.prepare(`
    SELECT n.id as npc_id, n.name as npc_name,
      COUNT(s.id) as session_count
    FROM npcs n
    LEFT JOIN sessions s ON s.npc_id = n.id AND s.status != 'cancelled'
    GROUP BY n.id, n.name
    ORDER BY session_count DESC
  `).all()
  res.json(stats)
})

export default router
