import { Router, type Request, type Response } from 'express'
import { getDb } from '../database.js'
import dayjs from 'dayjs'

const router = Router()

router.get('/', (req: Request, res: Response) => {
  const db = getDb()
  const { date, themeId } = req.query

  let sql = `
    SELECT s.*, t.name as theme_name, r.name as room_name, n.name as npc_name
    FROM sessions s
    LEFT JOIN themes t ON s.theme_id = t.id
    LEFT JOIN rooms r ON s.room_id = r.id
    LEFT JOIN npcs n ON s.npc_id = n.id
    WHERE 1=1
  `
  const params: any[] = []

  if (date) {
    sql += ' AND s.date = ?'
    params.push(date)
  }
  if (themeId) {
    sql += ' AND s.theme_id = ?'
    params.push(Number(themeId))
  }

  sql += ' ORDER BY s.date, s.start_time'

  const sessions = db.prepare(sql).all(...params)
  res.json(sessions)
})

router.get('/:id', (req: Request, res: Response) => {
  const db = getDb()
  const session = db.prepare(`
    SELECT s.*, t.name as theme_name, r.name as room_name, n.name as npc_name
    FROM sessions s
    LEFT JOIN themes t ON s.theme_id = t.id
    LEFT JOIN rooms r ON s.room_id = r.id
    LEFT JOIN npcs n ON s.npc_id = n.id
    WHERE s.id = ?
  `).get(req.params.id)
  if (!session) {
    res.status(404).json({ error: 'Session not found' })
    return
  }
  res.json(session)
})

router.post('/', (req: Request, res: Response) => {
  const db = getDb()
  const { theme_id, room_id, date, start_time, end_time, max_players } = req.body
  const result = db.prepare(`
    INSERT INTO sessions (theme_id, room_id, date, start_time, end_time, max_players)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(theme_id, room_id, date, start_time, end_time, max_players)
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(session)
})

router.put('/:id', (req: Request, res: Response) => {
  const db = getDb()
  const { theme_id, room_id, date, start_time, end_time, status, npc_id, current_bookings, max_players } = req.body
  db.prepare(`
    UPDATE sessions SET theme_id=?, room_id=?, date=?, start_time=?, end_time=?, status=?, npc_id=?, current_bookings=?, max_players=?
    WHERE id=?
  `).run(theme_id, room_id, date, start_time, end_time, status, npc_id, current_bookings, max_players, req.params.id)
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id)
  res.json(session)
})

router.put('/:id/assign-npc', (req: Request, res: Response) => {
  const db = getDb()
  const { npcId } = req.body

  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id) as any
  if (!session) {
    res.status(404).json({ error: 'Session not found' })
    return
  }

  if (session.npc_id && session.npc_id !== npcId) {
    db.prepare('UPDATE npcs SET status = ? WHERE id = ?').run('available', session.npc_id)
  }

  if (npcId) {
    db.prepare('UPDATE npcs SET status = ? WHERE id = ?').run('assigned', npcId)
  }

  db.prepare('UPDATE sessions SET npc_id = ? WHERE id = ?').run(npcId, req.params.id)

  const updated = db.prepare(`
    SELECT s.*, t.name as theme_name, r.name as room_name, n.name as npc_name
    FROM sessions s
    LEFT JOIN themes t ON s.theme_id = t.id
    LEFT JOIN rooms r ON s.room_id = r.id
    LEFT JOIN npcs n ON s.npc_id = n.id
    WHERE s.id = ?
  `).get(req.params.id)
  res.json(updated)
})

router.post('/generate', (req: Request, res: Response) => {
  const db = getDb()
  const { date } = req.body
  const targetDate = date || dayjs().format('YYYY-MM-DD')

  const themes = db.prepare('SELECT * FROM themes').all() as any[]
  const rooms = db.prepare('SELECT * FROM rooms').all() as any[]

  const timeSlots = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00', '20:30']

  const insertSession = db.prepare(`
    INSERT OR IGNORE INTO sessions (theme_id, room_id, date, start_time, end_time, max_players, status, current_bookings)
    VALUES (?, ?, ?, ?, ?, ?, 'available', 0)
  `)

  const transaction = db.transaction(() => {
    for (const room of rooms) {
      const theme = themes.find((t: any) => t.id === room.theme_id)
      if (!theme) continue

      for (const slot of timeSlots) {
        const startTime = slot
        const endTime = dayjs(`2024-01-01 ${slot}`).add(theme.duration, 'minute').format('HH:mm')

        const existing = db.prepare(
          'SELECT id FROM sessions WHERE room_id = ? AND date = ? AND start_time = ?'
        ).get(room.id, targetDate, startTime)

        if (!existing) {
          const result = insertSession.run(theme.id, room.id, targetDate, startTime, endTime, theme.max_players)
          const sessionId = result.lastInsertRowid as number

          const status = Math.random() > 0.6 ? 'booked' : 'available'
          if (status === 'booked') {
            const currentBookings = Math.floor(Math.random() * theme.max_players) + 1
            db.prepare('UPDATE sessions SET status = ?, current_bookings = ? WHERE id = ?')
              .run(status, currentBookings, sessionId)
          }
        }
      }
    }
  })

  transaction()
  res.json({ success: true, message: `Sessions generated for ${targetDate}` })
})

export default router
