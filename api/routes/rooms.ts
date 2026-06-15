import { Router, type Request, type Response } from 'express'
import { getDb } from '../database.js'

const router = Router()

router.get('/', (_req: Request, res: Response) => {
  const db = getDb()
  const rooms = db.prepare(`
    SELECT r.*, t.name as theme_name,
      (SELECT COUNT(*) FROM prop_items WHERE room_id = r.id AND condition = 'damaged') as damaged_props_count
    FROM rooms r
    LEFT JOIN themes t ON r.theme_id = t.id
    ORDER BY r.id
  `).all() as any[]

  for (const room of rooms) {
    room.props = db.prepare('SELECT * FROM prop_items WHERE room_id = ?').all(room.id)
  }

  res.json(rooms)
})

router.get('/:id', (req: Request, res: Response) => {
  const db = getDb()
  const room = db.prepare(`
    SELECT r.*, t.name as theme_name
    FROM rooms r
    LEFT JOIN themes t ON r.theme_id = t.id
    WHERE r.id = ?
  `).get(req.params.id)
  if (!room) {
    res.status(404).json({ error: 'Room not found' })
    return
  }
  const props = db.prepare('SELECT * FROM prop_items WHERE room_id = ?').all(req.params.id)
  res.json(Object.assign({}, room as object, { props }))
})

router.put('/:id', (req: Request, res: Response) => {
  const db = getDb()
  const { name, cleaning_status } = req.body
  db.prepare('UPDATE rooms SET name=?, cleaning_status=? WHERE id=?')
    .run(name, cleaning_status, req.params.id)
  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id)
  res.json(room)
})

router.put('/:id/props', (req: Request, res: Response) => {
  const db = getDb()
  const { propId, condition } = req.body
  db.prepare('UPDATE prop_items SET condition = ? WHERE id = ? AND room_id = ?')
    .run(condition, propId, req.params.id)
  const props = db.prepare('SELECT * FROM prop_items WHERE room_id = ?').all(req.params.id)
  res.json(props)
})

export default router
