const express = require('express')
const db = require('../database')
const auth = require('../middleware/auth')

const router = express.Router()
router.use(auth)

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_KEY = process.env.GROQ_API_KEY

async function callGroq(messages) {
    const r = await fetch(GROQ_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_KEY}` },
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages, temperature: 0.4, max_tokens: 1024 }),
    })
    if (!r.ok) throw new Error('AI service error')
    const data = await r.json()
    return data.choices[0].message.content
}

/* ─── Submit check-in ─── */
router.post('/', async (req, res) => {
    try {
        const { answers, score } = req.body
        if (!answers || score === undefined) return res.status(400).json({ error: 'Answers and score are required' })

        const date = new Date().toISOString().split('T')[0]

        // Get AI suggestion based on answers
        const questionTexts = [
            'Confidence about study material', 'Understanding of last topic',
            'Motivation to study', 'Focus level', 'Sleep quality'
        ]
        const optionLabels = [
            ['Not at all', 'Slightly', 'Moderately', 'Very', 'Extremely'],
            ['Didn\'t understand', 'Partially', 'Mostly', 'Fully', 'Can teach it'],
            ['Not motivated', 'A little', 'Somewhat', 'Motivated', 'Very motivated'],
            ['Very distracted', 'Distracted', 'Okay', 'Focused', 'Laser focused'],
            ['Barely slept', 'Poorly', 'Okay', 'Well', 'Great']
        ]

        const answerSummary = Object.entries(answers).map(([qId, optIdx]) => {
            const idx = parseInt(qId) - 1
            return `${questionTexts[idx]}: ${optionLabels[idx]?.[optIdx] || 'Unknown'}`
        }).join('\n')

        // Get last 7 days of history for context
        const history = db.prepare(
            'SELECT date, score, suggestion FROM checkins WHERE userId = ? ORDER BY date DESC LIMIT 7'
        ).all(req.userId)

        const historyContext = history.length > 0
            ? `\nRecent history (last ${history.length} days):\n${history.map(h => `${h.date}: ${h.score}%`).join('\n')}`
            : ''

        const suggestion = await callGroq([{
            role: 'system',
            content: `You are a supportive, encouraging study coach. A student just completed a daily confidence check-in. Based on their responses, provide personalized, actionable suggestions to help them perform better. Keep it concise (3-5 key points), warm, and practical. Focus on specific actions they can take today.`
        }, {
            role: 'user',
            content: `Today's check-in (Score: ${score}%):\n${answerSummary}${historyContext}\n\nGive me specific, actionable tips to improve.`
        }])

        // Store in DB
        const result = db.prepare(
            'INSERT INTO checkins (userId, date, answers, score, suggestion) VALUES (?, ?, ?, ?, ?)'
        ).run(req.userId, date, JSON.stringify(answers), score, suggestion)

        const checkin = db.prepare('SELECT * FROM checkins WHERE id = ?').get(result.lastInsertRowid)
        res.status(201).json({ checkin, suggestion })
    } catch (err) {
        console.error('Check-in error:', err)
        res.status(500).json({ error: err.message || 'Server error' })
    }
})

/* ─── Get check-in history ─── */
router.get('/history', (req, res) => {
    try {
        const checkins = db.prepare(
            'SELECT * FROM checkins WHERE userId = ? ORDER BY date DESC LIMIT 30'
        ).all(req.userId)
        res.json({ checkins })
    } catch (err) {
        res.status(500).json({ error: 'Server error' })
    }
})

/* ─── Get today's check-in ─── */
router.get('/today', (req, res) => {
    try {
        const date = new Date().toISOString().split('T')[0]
        const checkin = db.prepare(
            'SELECT * FROM checkins WHERE userId = ? AND date = ? ORDER BY createdAt DESC LIMIT 1'
        ).get(req.userId, date)
        res.json({ checkin: checkin || null })
    } catch (err) {
        res.status(500).json({ error: 'Server error' })
    }
})

module.exports = router
