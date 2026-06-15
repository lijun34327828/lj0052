import { Router, type Request, type Response } from 'express'
import { getDb } from '../database.js'

const router = Router()

router.get('/', (_req: Request, res: Response) => {
  const db = getDb()
  const npcs = db.prepare('SELECT * FROM npcs ORDER BY id').all()
  res.json(npcs)
})

router.put('/:id', (req: Request, res: Response) => {
  const db = getDb()
  const { name, avatar, skills, status } = req.body
  db.prepare('UPDATE npcs SET name=?, avatar=?, skills=?, status=? WHERE id=?')
    .run(name, avatar, JSON.stringify(skills), status, req.params.id)
  const npc = db.prepare('SELECT * FROM npcs WHERE id = ?').get(req.params.id)
  res.json(npc)
})

export default router
