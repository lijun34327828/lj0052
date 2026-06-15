import { Router, type Request, type Response } from 'express'
import { getDb } from '../database.js'
import dayjs from 'dayjs'

const router = Router()

router.get('/', (req: Request, res: Response) => {
  const db = getDb()
  const { phone } = req.query

  let sql = `
    SELECT b.*, s.date, s.start_time, s.end_time, s.status as session_status,
           t.name as theme_name, t.cover as theme_cover, t.duration
    FROM bookings b
    JOIN sessions s ON b.session_id = s.id
    JOIN themes t ON s.theme_id = t.id
    WHERE 1=1
  `
  const params: any[] = []

  if (phone) {
    sql += ' AND b.phone = ?'
    params.push(phone)
  }

  sql += ' ORDER BY s.date DESC, s.start_time DESC'

  const bookings = db.prepare(sql).all(...params)
  res.json(bookings)
})

router.post('/', (req: Request, res: Response) => {
  const db = getDb()
  const { session_id, player_name, phone, player_count } = req.body

  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(session_id) as any
  if (!session) {
    res.status(404).json({ error: 'Session not found' })
    return
  }

  if (session.current_bookings + player_count > session.max_players) {
    res.status(400).json({ error: 'Not enough capacity' })
    return
  }

  const booking = db.transaction(() => {
    const result = db.prepare(`
      INSERT INTO bookings (session_id, player_name, phone, player_count, status)
      VALUES (?, ?, ?, ?, 'confirmed')
    `).run(session_id, player_name, phone, player_count)

    db.prepare('UPDATE sessions SET current_bookings = current_bookings + ?, status = ? WHERE id = ?')
      .run(player_count, 'booked', session_id)

    return db.prepare(`
      SELECT b.*, s.date, s.start_time, s.end_time, t.name as theme_name, t.cover as theme_cover, t.duration
      FROM bookings b
      JOIN sessions s ON b.session_id = s.id
      JOIN themes t ON s.theme_id = t.id
      WHERE b.id = ?
    `).get(result.lastInsertRowid)
  })()

  res.status(201).json(booking)
})

router.put('/:id/cancel', (req: Request, res: Response) => {
  const db = getDb()

  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id) as any
  if (!booking) {
    res.status(404).json({ error: 'Booking not found' })
    return
  }

  db.transaction(() => {
    db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run('cancelled', req.params.id)

    db.prepare('UPDATE sessions SET current_bookings = current_bookings - ? WHERE id = ?')
      .run(booking.player_count, booking.session_id)

    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(booking.session_id) as any
    if (session && session.current_bookings - booking.player_count <= 0) {
      db.prepare('UPDATE sessions SET status = ? WHERE id = ?').run('available', booking.session_id)
    }
  })()

  const updated = db.prepare(`
    SELECT b.*, s.date, s.start_time, s.end_time, t.name as theme_name, t.cover as theme_cover, t.duration
    FROM bookings b
    JOIN sessions s ON b.session_id = s.id
    JOIN themes t ON s.theme_id = t.id
    WHERE b.id = ?
  `).get(req.params.id)
  res.json(updated)
})

router.get('/upcoming-alerts', (_req: Request, res: Response) => {
  const db = getDb()
  const now = dayjs()
  const alertThreshold = now.add(30, 'minute')

  const bookings = db.prepare(`
    SELECT b.*, s.date, s.start_time, s.end_time, t.name as theme_name, t.cover as theme_cover
    FROM bookings b
    JOIN sessions s ON b.session_id = s.id
    JOIN themes t ON s.theme_id = t.id
    WHERE b.status = 'confirmed'
    AND s.date = ?
    AND s.start_time <= ?
    AND s.start_time >= ?
    ORDER BY s.start_time
  `).all(now.format('YYYY-MM-DD'), alertThreshold.format('HH:mm'), now.format('HH:mm'))

  res.json(bookings)
})

export default router
