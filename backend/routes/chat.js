const express = require('express')
const auth = require('../middleware/auth')
const fetch = globalThis.fetch

const router = express.Router()
router.use(auth)

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_KEY = process.env.GROQ_API_KEY

router.post('/', async (req, res) => {
    try {
        const { message, history, language } = req.body
        if (!message) return res.status(400).json({ error: 'Message is required' })

        const langNames = { en: 'English', hi: 'Hindi', mr: 'Marathi' }
        const langInstruction = language && language !== 'en'
            ? ` Respond in ${langNames[language] || 'English'}.`
            : ''

        const messages = [
            {
                role: 'system',
                content: `You are a helpful, friendly study assistant for students. Answer questions clearly and concisely. Help with homework, explain concepts, provide study tips, and motivate students. Keep responses focused and educational.${langInstruction}`
            },
            ...(history || []).slice(-10),
            { role: 'user', content: message }
        ]

        const r = await fetch(GROQ_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_KEY}` },
            body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages, temperature: 0.3, max_tokens: 2048 }),
        })

        if (!r.ok) {
            const errText = await r.text()
            console.error('Chat Groq error:', r.status, errText)
            return res.status(500).json({ error: 'AI service error' })
        }

        const data = await r.json()
        const reply = data.choices[0].message.content
        res.json({ reply })
    } catch (err) {
        console.error('Chat error:', err)
        res.status(500).json({ error: err.message || 'Server error' })
    }
})

module.exports = router
