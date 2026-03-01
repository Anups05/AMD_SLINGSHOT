const express = require('express')
const db = require('../database')
const auth = require('../middleware/auth')

const router = express.Router()

/* All routes are protected */
router.use(auth)

/* ─── Auto-delete tasks from previous days on every request ─── */
router.use((req, res, next) => {
    try {
        const today = new Date().toISOString().split('T')[0]
        db.prepare('DELETE FROM tasks WHERE userId = ? AND date < ?').run(req.userId, today)
    } catch (err) {
        console.error('Task cleanup error:', err)
    }
    next()
})

/* ─── Get tasks for a date ─── */
router.get('/', (req, res) => {
    try {
        const date = req.query.date || new Date().toISOString().split('T')[0]
        const tasks = db.prepare(
            'SELECT * FROM tasks WHERE userId = ? AND date = ? ORDER BY createdAt ASC'
        ).all(req.userId, date)
        res.json({ tasks })
    } catch (err) {
        console.error('Get tasks error:', err)
        res.status(500).json({ error: 'Server error' })
    }
})

/* ─── Create task ─── */
router.post('/', (req, res) => {
    try {
        const { text, alertTime, alertType } = req.body
        if (!text) return res.status(400).json({ error: 'Task text is required' })

        const date = new Date().toISOString().split('T')[0]
        const result = db.prepare(
            'INSERT INTO tasks (userId, text, alertTime, alertType, date) VALUES (?, ?, ?, ?, ?)'
        ).run(req.userId, text, alertTime || null, alertType || 'reminder', date)

        const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid)
        res.status(201).json({ task })
    } catch (err) {
        console.error('Create task error:', err)
        res.status(500).json({ error: 'Server error' })
    }
})

/* ─── Update task ─── */
router.put('/:id', (req, res) => {
    try {
        const { completed, text } = req.body
        const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND userId = ?').get(req.params.id, req.userId)
        if (!task) return res.status(404).json({ error: 'Task not found' })

        if (completed !== undefined) {
            db.prepare('UPDATE tasks SET completed = ? WHERE id = ?').run(completed ? 1 : 0, task.id)
        }
        if (text) {
            db.prepare('UPDATE tasks SET text = ? WHERE id = ?').run(text, task.id)
        }

        const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(task.id)
        res.json({ task: updated })
    } catch (err) {
        console.error('Update task error:', err)
        res.status(500).json({ error: 'Server error' })
    }
})

/* ─── Delete task ─── */
router.delete('/:id', (req, res) => {
    try {
        const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND userId = ?').get(req.params.id, req.userId)
        if (!task) return res.status(404).json({ error: 'Task not found' })

        db.prepare('DELETE FROM tasks WHERE id = ?').run(task.id)
        res.json({ message: 'Task deleted' })
    } catch (err) {
        console.error('Delete task error:', err)
        res.status(500).json({ error: 'Server error' })
    }
})

module.exports = router
