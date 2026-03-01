import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const API = 'http://localhost:5000/api'
function getToken() { return localStorage.getItem('accessilearn_token') || '' }
function getUser() { try { return JSON.parse(localStorage.getItem('accessilearn_user') || '{}') } catch { return {} } }

/* ═══════ Recommended features ═══════ */
const recommended = [
    { id: 'text-simplify', icon: '✨', title: 'Text Simplifier', desc: 'Make complex text easy to read at your comfort level.', accent: '#7c3aed' },
    { id: 'task-breakdown', icon: '📝', title: 'Task Breakdown', desc: 'Break large tasks into small, clear steps.', accent: '#2563eb' },
    { id: 'distraction-free', icon: '🎯', title: 'Distraction-Free Mode', desc: 'A calm, focused space for your reading.', accent: '#059669' },
    { id: 'focus-timer', icon: '⏱️', title: 'Calm Time Timer', desc: 'Gentle focus sessions with built-in breaks.', accent: '#d97706' },
    { id: 'structured-notes', icon: '📋', title: 'Structured Notes', desc: 'Organize messy notes into clear sections.', accent: '#0891b2' },
    { id: 'font-spacing', icon: '🔍', title: 'Reading Comfort', desc: 'Adjust font size, spacing, and line height.', accent: '#be185d' },
]

const moreTools = [
    { id: 'reading-level', icon: '📖', title: 'Reading Level', desc: 'Choose your reading level for simplified content.', accent: '#6366f1' },
    { id: 'dyslexia-font', icon: '🔤', title: 'Dyslexia Font', desc: 'Toggle a font designed for easier reading.', accent: '#0d9488' },
]

const sidebarItems = [
    { id: 'home', icon: '🏠', label: 'Dashboard' },
    { id: 'planner', icon: '📋', label: 'Study Planner' },
    { id: 'stt', icon: '🎤', label: 'Speech to Text' },
    { id: 'tts', icon: '🔊', label: 'Text to Speech' },
    { id: 'pdf', icon: '📄', label: 'Upload & Read' },
    { id: 'checkin', icon: '🧠', label: 'Confidence Check' },
    { id: 'multilingual', icon: '🌐', label: 'Language' },
    { id: 'profile', icon: '👤', label: 'Profile' },
]

const focusPrompts = [
    "Let's begin gently.",
    "Start with one step.",
    "You're doing great — take your time.",
    "One thing at a time, that's enough.",
    "Take a breath. No rush.",
]

export default function NeurodiverseDashboard() {
    const navigate = useNavigate()
    const [user, setUser] = useState(getUser())
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [activeFeature, setActiveFeature] = useState(null)

    // Today's Focus (3 items)
    const [focusItems, setFocusItems] = useState(() => {
        const saved = localStorage.getItem('ndash_focus_' + new Date().toISOString().split('T')[0])
        return saved ? JSON.parse(saved) : [
            { id: 1, text: '', done: false },
            { id: 2, text: '', done: false },
            { id: 3, text: '', done: false },
        ]
    })

    // Feature states
    const [taskText, setTaskText] = useState(''); const [taskResult, setTaskResult] = useState('')
    const [simplifyText, setSimplifyText] = useState(''); const [simplifyResult, setSimplifyResult] = useState('')
    const [readingText, setReadingText] = useState(''); const [readingLevel, setReadingLevel] = useState('simple'); const [readingResult, setReadingResult] = useState('')
    const [distractionFree, setDistractionFree] = useState(false); const [distractionText, setDistractionText] = useState('')
    const [timerMinutes, setTimerMinutes] = useState(25); const [timerSeconds, setTimerSeconds] = useState(0)
    const [timerRunning, setTimerRunning] = useState(false); const [timerBreak, setTimerBreak] = useState(false)
    const [dyslexiaFont, setDyslexiaFont] = useState(false)
    const [fontSize, setFontSize] = useState(18); const [lineHeight, setLineHeight] = useState(1.8); const [letterSpacing, setLetterSpacing] = useState(1)
    const [notesText, setNotesText] = useState(''); const [notesResult, setNotesResult] = useState('')
    const [plannerText, setPlannerText] = useState(''); const [plannerResult, setPlannerResult] = useState('')
    const [sttText, setSttText] = useState(''); const [sttListening, setSttListening] = useState(false)
    const [ttsText, setTtsText] = useState(''); const [ttsSpeaking, setTtsSpeaking] = useState(false)
    const [pdfFile, setPdfFile] = useState(null); const [pdfText, setPdfText] = useState('')
    const [checkinAnswers, setCheckinAnswers] = useState({}); const [checkinResult, setCheckinResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const sttRef = useRef(null); const timerRef = useRef(null); const fileRef = useRef(null)
    const [prompt] = useState(focusPrompts[Math.floor(Math.random() * focusPrompts.length)])

    useEffect(() => {
        document.title = 'AccessiLearn — Neurodiverse Dashboard'
        const u = getUser(); setUser(u)
    }, [])

    // Save focus items
    useEffect(() => {
        localStorage.setItem('ndash_focus_' + new Date().toISOString().split('T')[0], JSON.stringify(focusItems))
    }, [focusItems])

    // Focus Timer
    useEffect(() => {
        if (timerRunning) {
            timerRef.current = setInterval(() => {
                setTimerSeconds(s => {
                    if (s === 0) {
                        setTimerMinutes(m => {
                            if (m === 0) {
                                clearInterval(timerRef.current); setTimerRunning(false)
                                if (!timerBreak) { setTimerBreak(true); setTimerMinutes(5); setTimerSeconds(0) }
                                else { setTimerBreak(false); setTimerMinutes(25); setTimerSeconds(0) }
                                return m
                            }
                            return m - 1
                        })
                        return 59
                    }
                    return s - 1
                })
            }, 1000)
        }
        return () => clearInterval(timerRef.current)
    }, [timerRunning, timerBreak])

    const callAPI = async (endpoint, body, isFile = false) => {
        setLoading(true)
        try {
            const opts = { method: 'POST', headers: { 'Authorization': `Bearer ${getToken()}` } }
            if (isFile) { opts.body = body } else { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body) }
            const r = await fetch(`${API}${endpoint}`, opts); const data = await r.json(); setLoading(false); return data
        } catch (e) { setLoading(false); return { error: e.message } }
    }

    const handleTaskBreakdown = async () => {
        if (!taskText.trim()) return
        const data = await callAPI('/upload/assignment-text', { text: taskText, language: user.language || 'en' })
        setTaskResult(data.translatedBreakdown || data.breakdown || data.error || 'Could not process')
    }

    const handleSimplify = async () => {
        if (!simplifyText.trim()) return
        const data = await callAPI('/upload/simplify-text', { text: simplifyText, language: user.language || 'en' })
        setSimplifyResult(data.translatedExplanation || data.explanation || data.error || 'Could not process')
    }

    const handleReadingLevel = async () => {
        if (!readingText.trim()) return
        const levels = { simple: '5-8 year old child', medium: '10-12 year old', advanced: 'teenager' }
        const data = await callAPI('/upload/simplify-text', { text: `Explain at ${levels[readingLevel]} level: ${readingText}`, language: user.language || 'en' })
        setReadingResult(data.translatedExplanation || data.explanation || data.error || 'Could not process')
    }

    const handleNotes = async () => {
        if (!notesText.trim()) return
        const data = await callAPI('/chat', { message: `Organize these lecture notes into clear, structured sections with headings, bullet points, and key takeaways:\n\n${notesText}`, language: user.language || 'en' })
        setNotesResult(data.reply || data.error || 'Could not process')
    }

    const handlePlanner = async () => {
        if (!plannerText.trim()) return
        const data = await callAPI('/upload/study-plan', { details: plannerText, language: user.language || 'en' })
        setPlannerResult(data.translatedPlan || data.plan || data.error || 'Could not process')
    }

    const startSTT = () => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SR) return
        const r = new SR(); r.lang = 'en-IN'; r.interimResults = true; r.continuous = true
        r.onresult = (e) => { let t = ''; for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript; setSttText(t) }
        r.onend = () => { if (sttRef.current) try { r.start() } catch { } }
        r.start(); sttRef.current = r; setSttListening(true)
    }
    const stopSTT = () => { if (sttRef.current) { sttRef.current.stop(); sttRef.current = null }; setSttListening(false) }

    const speakTTS = () => {
        if (!ttsText.trim()) return; window.speechSynthesis.cancel()
        const u = new SpeechSynthesisUtterance(ttsText); u.onend = () => setTtsSpeaking(false); window.speechSynthesis.speak(u); setTtsSpeaking(true)
    }
    const stopTTS = () => { window.speechSynthesis.cancel(); setTtsSpeaking(false) }

    const handlePDF = async (f) => {
        setPdfFile(f); const fd = new FormData(); fd.append('file', f)
        const data = await callAPI('/upload', fd, true)
        setPdfText(data.extractedText || data.text || data.error || 'Could not extract text')
    }

    const handleCheckinSubmit = async () => {
        const total = Object.values(checkinAnswers).reduce((s, v) => s + v, 0)
        const score = Math.round((total / 20) * 100)
        const data = await callAPI('/checkins', { answers: checkinAnswers, score })
        setCheckinResult({ score, suggestion: data.suggestion || 'Keep going at your pace!' })
    }

    const handleLogout = () => { localStorage.removeItem('accessilearn_token'); localStorage.removeItem('accessilearn_user'); navigate('/') }

    const updateFocusItem = (id, field, value) => {
        setFocusItems(items => items.map(item => item.id === id ? { ...item, [field]: value } : item))
    }

    // Timer progress for circular display
    const totalTimerSeconds = timerBreak ? 5 * 60 : 25 * 60
    const currentTimerSeconds = timerMinutes * 60 + timerSeconds
    const timerProgress = 1 - (currentTimerSeconds / totalTimerSeconds)
    const timerCircumference = 2 * Math.PI * 54

    const renderFeature = () => {
        switch (activeFeature) {
            case 'task-breakdown': return (
                <div className="nd-panel">
                    <h2 className="nd-panel-title">📝 Task Breakdown</h2>
                    <p className="nd-panel-desc">Paste a big task below. We'll break it into small, clear steps you can follow one at a time.</p>
                    <textarea className="nd-textarea" rows={5} value={taskText} onChange={e => setTaskText(e.target.value)} placeholder="What's your task? Paste it here..." />
                    <button className="nd-btn nd-btn-primary" onClick={handleTaskBreakdown} disabled={loading}>{loading ? 'Working on it...' : 'Break it down'}</button>
                    {taskResult && <div className="nd-result"><div className="nd-result-text">{taskResult}</div></div>}
                </div>)

            case 'text-simplify': return (
                <div className="nd-panel">
                    <h2 className="nd-panel-title">✨ Text Simplifier</h2>
                    <p className="nd-panel-desc">Paste any text and we'll make it simpler and easier to read.</p>
                    <textarea className="nd-textarea" rows={5} value={simplifyText} onChange={e => setSimplifyText(e.target.value)} placeholder="Paste the text you'd like simplified..." />
                    <button className="nd-btn nd-btn-primary" onClick={handleSimplify} disabled={loading}>{loading ? 'Simplifying...' : 'Simplify text'}</button>
                    {simplifyResult && <div className="nd-result"><div className="nd-result-text">{simplifyResult}</div></div>}
                </div>)

            case 'reading-level': return (
                <div className="nd-panel">
                    <h2 className="nd-panel-title">📖 Reading Level Selector</h2>
                    <p className="nd-panel-desc">Choose a reading level that feels comfortable for you.</p>
                    <div className="nd-level-selector">
                        {[['simple', '🧒 Simple'], ['medium', '📚 Medium'], ['advanced', '🎓 Advanced']].map(([v, l]) => (
                            <button key={v} className={`nd-level-btn${readingLevel === v ? ' active' : ''}`} onClick={() => setReadingLevel(v)}>{l}</button>
                        ))}
                    </div>
                    <textarea className="nd-textarea" rows={5} value={readingText} onChange={e => setReadingText(e.target.value)} placeholder="Paste text here..." />
                    <button className="nd-btn nd-btn-primary" onClick={handleReadingLevel} disabled={loading}>{loading ? 'Processing...' : 'Simplify to my level'}</button>
                    {readingResult && <div className="nd-result"><div className="nd-result-text">{readingResult}</div></div>}
                </div>)

            case 'distraction-free': return (
                <div className={`nd-panel${distractionFree ? ' nd-fullscreen' : ''}`}>
                    <h2 className="nd-panel-title">🎯 Distraction-Free Mode</h2>
                    <p className="nd-panel-desc">A calm space just for your reading. No clutter, no pressure.</p>
                    <button className="nd-btn nd-btn-primary" onClick={() => setDistractionFree(!distractionFree)}>
                        {distractionFree ? 'Exit calm space' : 'Enter calm space'}
                    </button>
                    <textarea className="nd-textarea nd-calm-textarea" rows={distractionFree ? 20 : 8} value={distractionText} onChange={e => setDistractionText(e.target.value)}
                        placeholder="Paste your study material here for quiet, focused reading..."
                        style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight, letterSpacing: `${letterSpacing}px`, fontFamily: dyslexiaFont ? '"OpenDyslexic", sans-serif' : 'inherit' }} />
                </div>)

            case 'focus-timer': return (
                <div className="nd-panel" style={{ textAlign: 'center' }}>
                    <h2 className="nd-panel-title">⏱️ {timerBreak ? 'Break Time — Rest a little' : 'Calm Time — Focus gently'}</h2>
                    <p className="nd-panel-desc">{timerBreak ? 'You earned this break. Stretch, breathe, relax.' : prompt}</p>
                    <div className="nd-timer-circle-wrap">
                        <svg className="nd-timer-svg" viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                            <circle cx="60" cy="60" r="54" fill="none" stroke={timerBreak ? '#059669' : '#6366f1'} strokeWidth="6"
                                strokeDasharray={timerCircumference} strokeDashoffset={timerCircumference * (1 - timerProgress)}
                                strokeLinecap="round" transform="rotate(-90 60 60)" style={{ transition: 'stroke-dashoffset 1s linear' }} />
                        </svg>
                        <div className="nd-timer-text">
                            <span className="nd-timer-digits">{String(timerMinutes).padStart(2, '0')}</span>
                            <span className="nd-timer-colon">:</span>
                            <span className="nd-timer-digits">{String(timerSeconds).padStart(2, '0')}</span>
                        </div>
                    </div>
                    <div className="nd-timer-actions">
                        <button className={`nd-btn ${timerRunning ? 'nd-btn-soft-danger' : 'nd-btn-primary'}`} onClick={() => setTimerRunning(!timerRunning)}>
                            {timerRunning ? 'Pause' : 'Begin gently'}
                        </button>
                        <button className="nd-btn nd-btn-ghost" onClick={() => { setTimerRunning(false); setTimerMinutes(25); setTimerSeconds(0); setTimerBreak(false) }}>
                            Reset
                        </button>
                    </div>
                </div>)

            case 'dyslexia-font': return (
                <div className="nd-panel">
                    <h2 className="nd-panel-title">🔤 Dyslexia-Friendly Font</h2>
                    <p className="nd-panel-desc">Toggle a font designed to make letters more distinct and reading easier.</p>
                    <button className="nd-btn nd-btn-primary" onClick={() => setDyslexiaFont(!dyslexiaFont)}>
                        {dyslexiaFont ? '✓ Dyslexia font is ON' : 'Turn on Dyslexia font'}
                    </button>
                    <div className="nd-result" style={{ fontFamily: dyslexiaFont ? '"OpenDyslexic", sans-serif' : 'inherit', fontSize: `${fontSize}px`, lineHeight: lineHeight }}>
                        <div className="nd-result-text">This is a preview of how text looks. The quick brown fox jumps over the lazy dog. Reading should feel more comfortable with these letter shapes.</div>
                    </div>
                </div>)

            case 'font-spacing': return (
                <div className="nd-panel">
                    <h2 className="nd-panel-title">🔍 Reading Comfort Settings</h2>
                    <p className="nd-panel-desc">Adjust these until reading feels comfortable for you. There's no wrong setting.</p>
                    <div className="nd-sliders">
                        <div className="nd-slider-row"><label>Text Size</label><span>{fontSize}px</span><input type="range" min="14" max="28" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} /></div>
                        <div className="nd-slider-row"><label>Line Height</label><span>{lineHeight}</span><input type="range" min="1.2" max="3" step="0.1" value={lineHeight} onChange={e => setLineHeight(Number(e.target.value))} /></div>
                        <div className="nd-slider-row"><label>Letter Spacing</label><span>{letterSpacing}px</span><input type="range" min="0" max="5" step="0.5" value={letterSpacing} onChange={e => setLetterSpacing(Number(e.target.value))} /></div>
                    </div>
                    <div className="nd-result" style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight, letterSpacing: `${letterSpacing}px`, fontFamily: dyslexiaFont ? '"OpenDyslexic", sans-serif' : 'inherit' }}>
                        <div className="nd-result-text">Preview your comfort settings. The quick brown fox jumps over the lazy dog. Adjust the sliders above until this feels easy to read.</div>
                    </div>
                </div>)

            case 'structured-notes': return (
                <div className="nd-panel">
                    <h2 className="nd-panel-title">📋 Structured Lecture Notes</h2>
                    <p className="nd-panel-desc">Paste messy notes and we'll organize them with headings, bullet points, and key takeaways.</p>
                    <textarea className="nd-textarea" rows={6} value={notesText} onChange={e => setNotesText(e.target.value)} placeholder="Paste your lecture notes here..." />
                    <button className="nd-btn nd-btn-primary" onClick={handleNotes} disabled={loading}>{loading ? 'Organizing...' : 'Organize my notes'}</button>
                    {notesResult && <div className="nd-result"><div className="nd-result-text">{notesResult}</div></div>}
                </div>)

            case 'planner': return (
                <div className="nd-panel">
                    <h2 className="nd-panel-title">📋 Study Planner</h2>
                    <p className="nd-panel-desc">Tell us what you need to study and we'll create a gentle, structured plan.</p>
                    <textarea className="nd-textarea" rows={5} value={plannerText} onChange={e => setPlannerText(e.target.value)} placeholder="E.g. Math algebra, Science physics, 2 hours available..." />
                    <button className="nd-btn nd-btn-primary" onClick={handlePlanner} disabled={loading}>{loading ? 'Planning...' : 'Create my plan'}</button>
                    {plannerResult && <div className="nd-result"><div className="nd-result-text">{plannerResult}</div></div>}
                </div>)

            case 'stt': return (
                <div className="nd-panel">
                    <h2 className="nd-panel-title">🎤 Speech to Text</h2>
                    <p className="nd-panel-desc">Speak and your words appear as text. No typing needed.</p>
                    <button className={`nd-btn ${sttListening ? 'nd-btn-soft-danger' : 'nd-btn-primary'}`} onClick={sttListening ? stopSTT : startSTT}>{sttListening ? 'Stop listening' : 'Start listening'}</button>
                    {sttListening && <div className="nd-status-gentle">Listening to you...</div>}
                    <div className="nd-result" style={{ minHeight: '120px' }}><div className="nd-result-text">{sttText || 'Your words will appear here...'}</div></div>
                </div>)

            case 'tts': return (
                <div className="nd-panel">
                    <h2 className="nd-panel-title">🔊 Text to Speech</h2>
                    <p className="nd-panel-desc">Paste text and we'll read it aloud for you.</p>
                    <textarea className="nd-textarea" rows={5} value={ttsText} onChange={e => setTtsText(e.target.value)} placeholder="Paste text to hear it read aloud..." />
                    <button className={`nd-btn ${ttsSpeaking ? 'nd-btn-soft-danger' : 'nd-btn-primary'}`} onClick={ttsSpeaking ? stopTTS : speakTTS}>{ttsSpeaking ? 'Stop reading' : 'Read aloud'}</button>
                </div>)

            case 'pdf': return (
                <div className="nd-panel">
                    <h2 className="nd-panel-title">📄 Upload & Read</h2>
                    <p className="nd-panel-desc">Upload a PDF or image and we'll extract all the text for you.</p>
                    <input type="file" ref={fileRef} style={{ display: 'none' }} accept="application/pdf,image/*" onChange={e => e.target.files?.[0] && handlePDF(e.target.files[0])} />
                    <button className="nd-btn nd-btn-primary" onClick={() => fileRef.current?.click()} disabled={loading}>{loading ? 'Reading file...' : 'Choose a file'}</button>
                    {pdfFile && <div className="nd-file-tag">📎 {pdfFile.name}</div>}
                    {pdfText && <div className="nd-result"><div className="nd-result-text" style={{ whiteSpace: 'pre-wrap' }}>{pdfText}</div></div>}
                </div>)

            case 'checkin':
                if (checkinResult) return (
                    <div className="nd-panel" style={{ textAlign: 'center' }}>
                        <h2 className="nd-panel-title">🧠 Your Check-In</h2>
                        <div className="nd-checkin-score" style={{ borderColor: checkinResult.score >= 60 ? '#059669' : '#d97706' }}>
                            <span style={{ fontSize: '2.5rem' }}>{checkinResult.score >= 80 ? '🌟' : checkinResult.score >= 60 ? '👍' : '💪'}</span>
                            <h3>{checkinResult.score}%</h3>
                        </div>
                        <div className="nd-result"><h3 className="nd-panel-title">Suggestions for you</h3><div className="nd-result-text">{checkinResult.suggestion}</div></div>
                    </div>)

                const cqs = [
                    { id: 1, text: 'How confident do you feel right now?', opts: ['Not much', 'A little', 'Okay', 'Good', 'Great'] },
                    { id: 2, text: 'How well do you understand recent topics?', opts: ['Lost', 'Partial', 'Mostly', 'Well', 'Fully'] },
                    { id: 3, text: 'Motivation to study?', opts: ['Low', 'A bit', 'Medium', 'High', 'Very high'] },
                    { id: 4, text: 'How is your focus today?', opts: ['Scattered', 'Wavering', 'Alright', 'Good', 'Sharp'] },
                    { id: 5, text: 'How did you sleep?', opts: ['Poorly', 'Okay', 'Fine', 'Well', 'Really well'] },
                ]
                return (
                    <div className="nd-panel">
                        <h2 className="nd-panel-title">🧠 Confidence Check-In</h2>
                        <p className="nd-panel-desc">Be honest — there are no wrong answers. This helps us support you better.</p>
                        {cqs.map(q => (
                            <div key={q.id} className="nd-checkin-q">
                                <h3>{q.text}</h3>
                                <div className="nd-checkin-opts">{q.opts.map((o, i) => (
                                    <button key={i} className={`nd-checkin-opt${checkinAnswers[q.id] === i ? ' active' : ''}`} onClick={() => setCheckinAnswers(a => ({ ...a, [q.id]: i }))}>{o}</button>
                                ))}</div>
                            </div>
                        ))}
                        <button className="nd-btn nd-btn-primary" onClick={handleCheckinSubmit} disabled={Object.keys(checkinAnswers).length < 5 || loading}>{loading ? 'Analyzing...' : 'Submit check-in'}</button>
                    </div>)

            case 'multilingual': return (
                <div className="nd-panel">
                    <h2 className="nd-panel-title">🌐 Language Preference</h2>
                    <p className="nd-panel-desc">All AI features will respond in your selected language. Change it in your profile settings.</p>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                        {[['en', '🇬🇧 English'], ['hi', '🇮🇳 हिन्दी'], ['mr', '🇮🇳 मराठी']].map(([code, label]) => (
                            <div key={code} className={`nd-checkin-opt${user.language === code ? ' active' : ''}`} style={{ padding: '12px 20px', fontSize: '1rem' }}>{label}</div>
                        ))}
                    </div>
                </div>)

            case 'profile': return (
                <div className="nd-panel">
                    <h2 className="nd-panel-title">👤 Your Profile</h2>
                    <div className="nd-profile-rows">
                        <div className="nd-profile-row"><span className="nd-profile-label">Name</span><span>{user.name || '—'}</span></div>
                        <div className="nd-profile-row"><span className="nd-profile-label">Email</span><span>{user.email || '—'}</span></div>
                        <div className="nd-profile-row"><span className="nd-profile-label">Language</span><span>{({ en: 'English', hi: 'Hindi', mr: 'Marathi' })[user.language] || 'English'}</span></div>
                    </div>
                </div>)

            default: return null
        }
    }

    return (
        <div className={`ndash${dyslexiaFont ? ' ndash-dyslexia' : ''}`} style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight, letterSpacing: `${letterSpacing}px` }}>
            {/* Sidebar */}
            <aside className={`ndash-sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>
                <div className="ndash-sidebar-header">
                    {!sidebarCollapsed && <span className="ndash-brand">AccessiLearn</span>}
                    <button className="ndash-collapse-btn" onClick={() => setSidebarCollapsed(c => !c)} aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
                        {sidebarCollapsed ? '→' : '←'}
                    </button>
                </div>
                <nav className="ndash-sidebar-nav" role="navigation" aria-label="Dashboard navigation">
                    {sidebarItems.map(item => (
                        <button key={item.id} className={`ndash-sidebar-link${activeFeature === item.id || (item.id === 'home' && !activeFeature) ? ' active' : ''}`}
                            onClick={() => setActiveFeature(item.id === 'home' ? null : item.id)} title={item.label}
                            style={{ border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                            <span className="ndash-sidebar-icon">{item.icon}</span>
                            {!sidebarCollapsed && <span>{item.label}</span>}
                        </button>
                    ))}
                </nav>
                <div className="ndash-sidebar-footer">
                    <button className="ndash-logout-btn" onClick={handleLogout}>🚪 {!sidebarCollapsed && 'Logout'}</button>
                </div>
            </aside>

            {/* Main content */}
            <main className={`ndash-main${sidebarCollapsed ? ' collapsed' : ''}`} role="main">
                {!activeFeature ? (<>
                    {/* Header */}
                    <header className="ndash-header">
                        <div>
                            <h1 className="ndash-greeting">Hello, {user.name || 'friend'}</h1>
                            <p className="ndash-prompt">{prompt}</p>
                        </div>
                    </header>

                    {/* Today's Focus */}
                    <section className="ndash-focus-section" aria-labelledby="focus-heading">
                        <h2 id="focus-heading" className="ndash-section-title">Today's Focus</h2>
                        <p className="ndash-section-desc">Write up to 3 things you'd like to focus on today. No pressure — even one is great.</p>
                        <div className="ndash-focus-list">
                            {focusItems.map(item => (
                                <div key={item.id} className={`ndash-focus-item${item.done ? ' done' : ''}`}>
                                    <button className={`ndash-focus-check${item.done ? ' checked' : ''}`} onClick={() => updateFocusItem(item.id, 'done', !item.done)} aria-label={item.done ? 'Mark as not done' : 'Mark as done'}>
                                        {item.done ? '✓' : ''}
                                    </button>
                                    <input type="text" className={`ndash-focus-input${item.done ? ' struck' : ''}`} value={item.text}
                                        onChange={e => updateFocusItem(item.id, 'text', e.target.value)} placeholder={`Step ${item.id}...`} />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Recommended for You */}
                    <section className="ndash-recommended" aria-labelledby="rec-heading">
                        <h2 id="rec-heading" className="ndash-section-title">Recommended for You</h2>
                        <p className="ndash-section-desc">These tools are designed to support your learning style.</p>
                        <div className="ndash-rec-grid">
                            {recommended.map(f => (
                                <button key={f.id} className="ndash-rec-card" onClick={() => setActiveFeature(f.id)} style={{ '--nd-accent': f.accent }}>
                                    <span className="ndash-rec-icon">{f.icon}</span>
                                    <div className="ndash-rec-content">
                                        <h3>{f.title}</h3>
                                        <p>{f.desc}</p>
                                    </div>
                                    <span className="ndash-rec-open">Open →</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* More tools */}
                    <section className="ndash-more" aria-labelledby="more-heading">
                        <h2 id="more-heading" className="ndash-section-title">More Tools</h2>
                        <div className="ndash-rec-grid">
                            {moreTools.map(f => (
                                <button key={f.id} className="ndash-rec-card" onClick={() => setActiveFeature(f.id)} style={{ '--nd-accent': f.accent }}>
                                    <span className="ndash-rec-icon">{f.icon}</span>
                                    <div className="ndash-rec-content"><h3>{f.title}</h3><p>{f.desc}</p></div>
                                    <span className="ndash-rec-open">Open →</span>
                                </button>
                            ))}
                        </div>
                    </section>
                </>) : (
                    <div className="ndash-feature-view">
                        <button className="nd-back-btn" onClick={() => setActiveFeature(null)}>← Back to dashboard</button>
                        {renderFeature()}
                    </div>
                )}
            </main>
        </div>
    )
}
