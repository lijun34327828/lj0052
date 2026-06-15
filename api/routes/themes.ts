import { Router, type Request, type Response } from 'express'
import { getDb } from '../database.js'

const router = Router()

router.get('/', (_req: Request, res: Response) => {
  const db = getDb()
  const themes = db.prepare('SELECT * FROM themes ORDER BY id').all()
  res.json(themes)
})

router.get('/:id', (req: Request, res: Response) => {
  const db = getDb()
  const theme = db.prepare('SELECT * FROM themes WHERE id = ?').get(req.params.id)
  if (!theme) {
    res.status(404).json({ error: 'Theme not found' })
    return
  }
  res.json(theme)
})

router.post('/', (req: Request, res: Response) => {
  const db = getDb()
  const { name, cover, difficulty, min_players, max_players, duration, description, story } = req.body
  const result = db.prepare(`
    INSERT INTO themes (name, cover, difficulty, min_players, max_players, duration, description, story)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, cover, difficulty, min_players, max_players, duration, description || '', story || '')
  const theme = db.prepare('SELECT * FROM themes WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(theme)
})

router.put('/:id', (req: Request, res: Response) => {
  const db = getDb()
  const { name, cover, difficulty, min_players, max_players, duration, description, story } = req.body
  db.prepare(`
    UPDATE themes SET name=?, cover=?, difficulty=?, min_players=?, max_players=?, duration=?, description=?, story=?
    WHERE id=?
  `).run(name, cover, difficulty, min_players, max_players, duration, description, story, req.params.id)
  const theme = db.prepare('SELECT * FROM themes WHERE id = ?').get(req.params.id)
  res.json(theme)
})

router.delete('/:id', (req: Request, res: Response) => {
  const db = getDb()
  db.prepare('DELETE FROM themes WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

export default router
