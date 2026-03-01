import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const API = 'http://localhost:5000/api'

const userTypes = [
    {
        id: 'vision',
        icon: '👁️',
        title: 'Vision Support',
        desc: 'High contrast, text-to-speech, screen reader compatibility, large fonts.',
        color: '#dbeafe',
        route: '/dashboard/vision',
    },
    {
        id: 'neurodiverse',
        icon: '🧠',
        title: 'Neurodiverse / Dyslexia',
        desc: 'Task breakdowns, calm focus timer, distraction-free mode, readable fonts.',
        color: '#f3e8ff',
        route: '/dashboard/neurodiverse',
    },
    {
        id: 'speech',
        icon: '🗣️',
        title: 'Speech / Hearing',
        desc: 'Live captions, speech-to-text, visual alerts, text-based communication.',
        color: '#dcfce7',
        route: '/dashboard/speech',
    },
    {
        id: 'sign-language',
        icon: '🤟',
        title: 'Sign Language',
        desc: 'Sign language recognition, gesture-to-text, and visual communication tools.',
        color: '#fef3c7',
        route: '/dashboard/sign-language',
    },
]

/* ─── Password strength rules ─── */
function getPasswordErrors(pw) {
    const errs = []
    if (pw.length < 8) errs.push('At least 8 characters')
    if (!/[A-Z]/.test(pw)) errs.push('One uppercase letter')
    if (!/[0-9]/.test(pw)) errs.push('One number')
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) errs.push('One special character')
    return errs
}

function getPasswordStrength(pw) {
    const errs = getPasswordErrors(pw)
    if (errs.length === 0) return { label: 'Strong ✅', color: '#22c55e' }
    if (errs.length <= 1) return { label: 'Good', color: '#f59e0b' }
    if (errs.length <= 2) return { label: 'Weak', color: '#ef4444' }
    return { label: 'Very Weak', color: '#dc2626' }
}

export default function Login() {
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isRegister, setIsRegister] = useState(false)
    const [selectedType, setSelectedType] = useState('')
    const [language, setLanguage] = useState('English')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const langMap = { 'English': 'en', 'हिन्दी': 'hi', 'मराठी': 'mr' }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        // Validation for registration only
        if (isRegister) {
            if (!selectedType) { setError('Please select a support type'); return }
            const pwErrors = getPasswordErrors(password)
            if (pwErrors.length > 0) { setError('Password needs: ' + pwErrors.join(', ')); return }
            if (!name.trim()) { setError('Name is required for registration'); return }
        }

        setLoading(true)
        try {
            const endpoint = isRegister ? '/auth/register' : '/auth/login'
            const body = isRegister
                ? { name: name.trim(), email, password, language: langMap[language] || 'en', disability: selectedType }
                : { email, password }

            const res = await fetch(`${API}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })

            const data = await res.json()
            if (!res.ok) { setError(data.error || 'Something went wrong'); setLoading(false); return }

            // Store token and user data
            localStorage.setItem('accessilearn_token', data.token)
            localStorage.setItem('accessilearn_user', JSON.stringify(data.user))
            localStorage.setItem('accessilearn_prefs', JSON.stringify({
                userType: data.user.disability,
                language: data.user.language,
            }))

            // Route to the correct dashboard
            const disabilityRoute = {
                vision: '/dashboard/vision',
                speech: '/dashboard/speech',
                neurodiverse: '/dashboard/neurodiverse',
            }
            navigate(disabilityRoute[data.user.disability] || '/dashboard/vision')
        } catch (err) {
            setError('Cannot connect to server. Please make sure the backend is running.')
        }
        setLoading(false)
    }

    const pwStr = password ? getPasswordStrength(password) : null

    return (
        <div className="login-page">
            {/* Left panel */}
            <div className="login-left">
                <Link to="/" className="login-back-link" aria-label="Back to home">
                    ← Back
                </Link>
                <div className="login-left-content">
                    <div className="login-hero-img">
                        <img src="/hero-brain.png" alt="" width="200" height="200" />
                    </div>
                    <h2>Your Learning,<br />Your <span>Way</span></h2>
                    <p>Personalize your experience to match your comfort, focus style, and accessibility needs.</p>
                </div>
            </div>

            {/* Right panel */}
            <div className="login-right">
                <form className="login-form" onSubmit={handleSubmit}>
                    <h1>{isRegister ? 'Create Account' : 'Sign In'}</h1>
                    <p className="login-subtitle">
                        {isRegister ? 'Register and set up your preferences.' : 'Sign in to your account.'}
                    </p>

                    {/* Error message */}
                    {error && <div className="login-error" role="alert">{error}</div>}

                    {/* Name (register only) */}
                    {isRegister && (
                        <>
                            <label htmlFor="login-name" className="sr-only">Full Name</label>
                            <input
                                id="login-name"
                                type="text"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="login-input"
                                required
                            />
                        </>
                    )}

                    <label htmlFor="login-email" className="sr-only">Email</label>
                    <input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="login-input"
                        required
                    />

                    <label htmlFor="login-password" className="sr-only">Password</label>
                    <input
                        id="login-password"
                        type="password"
                        placeholder={isRegister ? 'Create a strong password' : 'Enter your password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="login-input"
                        required
                    />

                    {/* Password strength indicator (register only) */}
                    {isRegister && password && (
                        <div className="pw-strength">
                            <div className="pw-strength-bar">
                                <div
                                    className="pw-strength-fill"
                                    style={{
                                        width: `${((4 - getPasswordErrors(password).length) / 4) * 100}%`,
                                        background: pwStr.color,
                                    }}
                                />
                            </div>
                            <span className="pw-strength-label" style={{ color: pwStr.color }}>
                                {pwStr.label}
                            </span>
                            {getPasswordErrors(password).length > 0 && (
                                <ul className="pw-rules">
                                    {getPasswordErrors(password).map((e, i) => (
                                        <li key={i}>❌ {e}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
                        {loading ? 'Please wait…' : (isRegister ? 'Create Account' : 'Sign In')}
                    </button>

                    <p className="login-toggle-text">
                        {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <button type="button" className="login-toggle-link" onClick={() => { setIsRegister(r => !r); setError('') }}>
                            {isRegister ? 'Sign In' : 'Register'}
                        </button>
                    </p>

                    {/* ── Support type + Language (register only) ── */}
                    {isRegister && (
                        <div className="login-prefs">
                            <h2>I need support for…</h2>
                            <p className="login-prefs-hint">Choose the experience that fits you best.</p>

                            <div className="user-type-grid">
                                {userTypes.map(t => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        className={`user-type-card${selectedType === t.id ? ' selected' : ''}`}
                                        style={{ '--type-bg': t.color }}
                                        onClick={() => setSelectedType(t.id)}
                                        aria-pressed={selectedType === t.id}
                                    >
                                        <span className="user-type-icon">{t.icon}</span>
                                        <strong>{t.title}</strong>
                                        <span className="user-type-desc">{t.desc}</span>
                                        {selectedType === t.id && <span className="user-type-check">✓</span>}
                                    </button>
                                ))}
                            </div>

                            {!selectedType && (
                                <p className="user-type-warning">Please select a support type to continue.</p>
                            )}

                            {/* Language */}
                            <div className="pref-group" style={{ marginTop: '24px' }}>
                                <label htmlFor="pref-language" className="pref-label">Preferred Language</label>
                                <select
                                    id="pref-language"
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="pref-select"
                                >
                                    <option>English</option>
                                    <option>हिन्दी</option>
                                    <option>मराठी</option>
                                </select>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}
