const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../database')
const auth = require('../middleware/auth')

const router = express.Router()

/* ─── Strong Password Validation ─── */
function validatePassword(pw) {
    if (pw.length < 8) return 'Password must be at least 8 characters'
    if (!/[A-Z]/.test(pw)) return 'Password must contain at least one uppercase letter'
    if (!/[0-9]/.test(pw)) return 'Password must contain at least one number'
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) return 'Password must contain at least one special character'
    return null
}

/* ─── Map language names to codes ─── */
const langMap = { 'English': 'en', 'हिन्दी': 'hi', 'मराठी': 'mr', 'en': 'en', 'hi': 'hi', 'mr': 'mr' }
const validLangs = ['en', 'hi', 'mr']

/* ─── Register ─── */
router.post('/register', (req, res) => {
    try {
        const { name, email, password, language, disability } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' })
        }

        const pwError = validatePassword(password)
        if (pwError) return res.status(400).json({ error: pwError })

        // Check existing
        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
        if (existing) return res.status(409).json({ error: 'Email already registered' })

        // Hash password
        const hash = bcrypt.hashSync(password, 10)
        const lang = langMap[language] || 'en'
        const disab = ['vision', 'speech', 'neurodiverse'].includes(disability) ? disability : 'vision'

        const result = db.prepare(
            'INSERT INTO users (name, email, password, language, disability) VALUES (?, ?, ?, ?, ?)'
        ).run(name, email, hash, lang, disab)

        const token = jwt.sign({ userId: result.lastInsertRowid }, process.env.JWT_SECRET, { expiresIn: '7d' })

        res.status(201).json({
            token,
            user: {
                id: result.lastInsertRowid,
                name,
                email,
                language: lang,
                disability: disab,
                speechSpeed: 1.0,
            },
        })
    } catch (err) {
        console.error('Register error:', err)
        res.status(500).json({ error: 'Server error' })
    }
})

/* ─── Login ─── */
router.post('/login', (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' })
        }

        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
        if (!user) return res.status(401).json({ error: 'Invalid email or password' })

        const match = bcrypt.compareSync(password, user.password)
        if (!match) return res.status(401).json({ error: 'Invalid email or password' })

        // Reset speechSpeed to 1.0 on every login
        db.prepare('UPDATE users SET speechSpeed = 1.0 WHERE id = ?').run(user.id)

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                language: user.language,
                disability: user.disability,
                speechSpeed: 1.0,
            },
        })
    } catch (err) {
        console.error('Login error:', err)
        res.status(500).json({ error: 'Server error' })
    }
})

/* ─── Update Language (protected) ─── */
router.put('/language', auth, (req, res) => {
    try {
        const { language } = req.body
        const lang = langMap[language] || language
        if (!validLangs.includes(lang)) {
            return res.status(400).json({ error: 'Language not supported. Only English, Hindi, and Marathi are available.' })
        }
        db.prepare('UPDATE users SET language = ? WHERE id = ?').run(lang, req.userId)
        res.json({ language: lang })
    } catch (err) {
        console.error('Language update error:', err)
        res.status(500).json({ error: 'Server error' })
    }
})

/* ─── Update Speech Speed (protected) ─── */
router.put('/speed', auth, (req, res) => {
    try {
        const { speed } = req.body
        const s = parseFloat(speed)
        if (isNaN(s) || s < 0.25 || s > 3.0) {
            return res.status(400).json({ error: 'Speed must be between 0.25 and 3.0' })
        }
        db.prepare('UPDATE users SET speechSpeed = ? WHERE id = ?').run(s, req.userId)
        res.json({ speechSpeed: s })
    } catch (err) {
        console.error('Speed update error:', err)
        res.status(500).json({ error: 'Server error' })
    }
})

/* ─── Get current user (protected) ─── */
router.get('/me', auth, (req, res) => {
    try {
        const user = db.prepare('SELECT id, name, email, language, disability, speechSpeed FROM users WHERE id = ?').get(req.userId)
        if (!user) return res.status(404).json({ error: 'User not found' })
        res.json({ user })
    } catch (err) {
        res.status(500).json({ error: 'Server error' })
    }
})

/* ─── Update Profile (name + language, NOT email) ─── */
router.put('/profile', auth, (req, res) => {
    try {
        const { name, language } = req.body
        if (!name || name.trim().length < 1) return res.status(400).json({ error: 'Name is required' })
        const lang = langMap[language] || language || 'en'
        if (!validLangs.includes(lang)) return res.status(400).json({ error: 'Language not supported' })

        db.prepare('UPDATE users SET name = ?, language = ? WHERE id = ?').run(name.trim(), lang, req.userId)
        const user = db.prepare('SELECT id, name, email, language, disability, speechSpeed FROM users WHERE id = ?').get(req.userId)
        res.json({ user })
    } catch (err) {
        console.error('Profile update error:', err)
        res.status(500).json({ error: 'Server error' })
    }
})

/* ─── Change Password ─── */
router.put('/password', auth, (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body
        if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Both old and new passwords are required' })

        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId)
        if (!user) return res.status(404).json({ error: 'User not found' })

        const match = bcrypt.compareSync(oldPassword, user.password)
        if (!match) return res.status(401).json({ error: 'Current password is incorrect' })

        const pwError = validatePassword(newPassword)
        if (pwError) return res.status(400).json({ error: pwError })

        const hash = bcrypt.hashSync(newPassword, 10)
        db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hash, req.userId)
        res.json({ message: 'Password updated successfully' })
    } catch (err) {
        console.error('Password change error:', err)
        res.status(500).json({ error: 'Server error' })
    }
})

module.exports = router
