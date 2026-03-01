import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    speak, listen, t, parseTime, isDone,
    parseSpeedCommand, parseLanguageCommand, parseLanguageChoice,
    parseUploadCommand, parseYesNo, parseVoiceToggle, parseNavCommand,
    parseRepeatCommand, parseAddMoreCommand, parseDeleteTaskCommand,
    parseCompleteTaskCommand,
    isCommand, logVoices,
    apiCreateTask, apiGetTasks, apiDeleteTask, apiUpdateSpeed, apiUpdateLanguage,
    langNames,
} from '../utils/voiceSystem'

const sidebarLinks = [
    { id: 'upload', icon: '📂', label: 'Upload & Read', route: '/dashboard/vision/upload' },
    { id: 'summarise', icon: '✨', label: 'Summarise', route: '/dashboard/vision/summarise' },
    { id: 'assignment', icon: '📝', label: 'Assignments', route: '/dashboard/vision/assignment' },
    { id: 'planner', icon: '📋', label: 'Planner', route: '/dashboard/vision/planner' },
    { id: 'simplified', icon: '🎓', label: 'Simple Learn', route: '/dashboard/vision/simplified' },
    { id: 'settings', icon: '⚙️', label: 'Settings', route: '/dashboard/vision/settings' },
    { id: 'profile', icon: '👤', label: 'Profile', route: '/dashboard/vision/profile' },
]

export default function VisionDashboard() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [lang, setLang] = useState('en')
    const [speed, setSpeed] = useState(1.0)
    const [voiceActive, setVoiceActive] = useState(false)
    const [voicePaused, setVoicePaused] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [tasks, setTasks] = useState([])
    const [status, setStatus] = useState('')
    const alertTimers = useRef([])
    const alive = useRef(true)

    const langRef = useRef('en')
    const speedRef = useRef(1.0)
    const pausedRef = useRef(false)
    const tasksRef = useRef([])

    useEffect(() => { langRef.current = lang }, [lang])
    useEffect(() => { speedRef.current = speed }, [speed])
    useEffect(() => { pausedRef.current = voicePaused }, [voicePaused])
    useEffect(() => { tasksRef.current = tasks }, [tasks])

    useEffect(() => {
        document.title = 'AccessiLearn — Vision Dashboard'
        try {
            const raw = localStorage.getItem('accessilearn_user')
            if (raw) {
                const u = JSON.parse(raw)
                setUser(u)
                setLang(u.language || 'en')
                setSpeed(u.speechSpeed || 1.0)
                langRef.current = u.language || 'en'
                speedRef.current = u.speechSpeed || 1.0
            }
        } catch { }
        if ('speechSynthesis' in window) {
            const lv = () => { window.speechSynthesis.getVoices(); logVoices() }
            lv(); window.speechSynthesis.onvoiceschanged = lv
        }
        alive.current = true
        return () => { alive.current = false; alertTimers.current.forEach(t => clearTimeout(t)); window.speechSynthesis?.cancel() }
    }, [])

    const loadTasks = useCallback(async () => {
        try { const d = await apiGetTasks(); if (d.tasks) { setTasks(d.tasks); tasksRef.current = d.tasks; scheduleAllAlerts(d.tasks) } } catch { }
    }, [])
    useEffect(() => { loadTasks() }, [loadTasks])

    useEffect(() => {
        if (user && !voiceActive) {
            const isFirstLogin = sessionStorage.getItem('accessilearn_welcomed') !== 'yes'
            const timer = setTimeout(() => {
                if (isFirstLogin) { sessionStorage.setItem('accessilearn_welcomed', 'yes'); startWelcomeFlow() }
                else { startCommandLoopOnly() }
            }, 1500)
            return () => clearTimeout(timer)
        }
    }, [user])

    /* ═══ Voice Flows ═══ */

    const startWelcomeFlow = async () => {
        setVoiceActive(true); setVoicePaused(false); pausedRef.current = false
        setStatus('Speaking...')
        await speak(t(langRef.current, 'welcomeBack', user?.name || 'there'), langRef.current, speedRef.current)
        await speak(t(langRef.current, 'askTasks'), langRef.current, speedRef.current)
        await taskEntryLoop()
        if (alive.current) startCommandLoop()
    }

    const startCommandLoopOnly = async () => {
        setVoiceActive(true); setVoicePaused(false); pausedRef.current = false
        await speak(t(langRef.current, 'waitingCommand'), langRef.current, speedRef.current)
        startCommandLoop()
    }

    const taskEntryLoop = async () => {
        let num = tasksRef.current.length + 1
        await speak(t(langRef.current, 'askTaskN', num), langRef.current, speedRef.current)
        while (alive.current) {
            if (pausedRef.current) return
            setStatus(t(langRef.current, 'listening'))
            try {
                const text = await listen(langRef.current, 10000)
                setStatus(`Heard: "${text}"`)
                const L = langRef.current, S = speedRef.current
                if (parseVoiceToggle(text) === 'stop') { await doStop(); return }
                if (isDone(text, L)) { await speak(t(L, 'doneTasks'), L, S); break }
                if (parseLanguageCommand(text)) { await doLanguage(text); await speak(t(langRef.current, 'askNextOrDone', num), langRef.current, speedRef.current); continue }
                if (parseSpeedCommand(text)) { await doSpeed(text); await speak(t(langRef.current, 'askNextOrDone', num), langRef.current, speedRef.current); continue }
                if (parseNavCommand(text)) { await doNav(text); return }
                if (parseDeleteTaskCommand(text) !== null) { await doDeleteTask(text); continue }
                if (parseCompleteTaskCommand(text) !== null) { await doCompleteTask(text); continue }

                const alertTime = parseTime(text)
                const result = await apiCreateTask(text, alertTime)
                if (result.task) {
                    const updated = [...tasksRef.current, result.task]
                    setTasks(updated); tasksRef.current = updated
                }
                await speak(t(L, 'taskAdded', num), L, S)
                num++
                await speak(t(L, 'askNextOrDone', num), L, S)
            } catch (err) {
                if (['timeout', 'no-speech', 'audio-capture'].includes(err.message)) {
                    await speak(t(langRef.current, 'notAudible'), langRef.current, speedRef.current)
                } else { await speak(t(langRef.current, 'notUnderstood'), langRef.current, speedRef.current) }
            }
        }
    }

    const startCommandLoop = async () => {
        setStatus('Ready — say a command')
        while (alive.current) {
            if (pausedRef.current) {
                try {
                    const text = await listen(langRef.current, 12000)
                    if (parseVoiceToggle(text) === 'start') {
                        setVoicePaused(false); pausedRef.current = false
                        await speak(t(langRef.current, 'voiceStarted'), langRef.current, speedRef.current)
                        setStatus('Ready')
                    }
                } catch { }
                continue
            }
            try {
                const text = await listen(langRef.current, 12000)
                setStatus(`Heard: "${text}"`)
                const L = langRef.current, S = speedRef.current
                if (parseVoiceToggle(text) === 'stop') { await doStop(); continue }
                if (parseNavCommand(text)) { await doNav(text); continue }
                if (parseLanguageCommand(text)) { await doLanguage(text); continue }
                if (parseSpeedCommand(text)) { await doSpeed(text); continue }
                if (parseUploadCommand(text)) { await speak(t(L, 'goUpload'), L, S); navigate('/dashboard/vision/upload'); return }
                if (parseRepeatCommand(text)) { await doRepeat(); continue }
                if (parseAddMoreCommand(text)) { await doAddMore(); continue }
                if (parseDeleteTaskCommand(text) !== null) { await doDeleteTask(text); continue }
                if (parseCompleteTaskCommand(text) !== null) { await doCompleteTask(text); continue }
                if (parseLogoutCommand(text)) { await doLogout(); continue }
                await speak(t(L, 'notUnderstood'), L, S)
            } catch (err) {
                if (err.message !== 'timeout' && err.message !== 'no-speech') { /* ignore */ }
            }
        }
    }

    /* ═══ Handlers ═══ */

    const doStop = async () => {
        await speak(t(langRef.current, 'voiceStopped'), langRef.current, speedRef.current)
        setVoicePaused(true); pausedRef.current = true
        setStatus('Voice paused')
    }

    const doSpeed = async (text) => {
        const cmd = parseSpeedCommand(text)
        if (!cmd) return
        let s = speedRef.current
        if (cmd.type === 'set') s = Math.max(0.25, Math.min(3.0, cmd.value))
        else if (cmd.type === 'decrease') s = Math.max(0.25, s - 0.25)
        else if (cmd.type === 'increase') s = Math.min(3.0, s + 0.25)
        s = Math.round(s * 100) / 100
        setSpeed(s); speedRef.current = s
        apiUpdateSpeed(s)
        try { const u = JSON.parse(localStorage.getItem('accessilearn_user') || '{}'); u.speechSpeed = s; localStorage.setItem('accessilearn_user', JSON.stringify(u)) } catch { }
        await speak(t(langRef.current, 'speedIs', s), langRef.current, s)
    }

    const doLanguage = async (text) => {
        const L = langRef.current, S = speedRef.current
        let newL = parseLanguageChoice(text)
        if (!newL) {
            await speak(t(L, 'changeLangAsk'), L, S)
            try { const c = await listen(L, 8000); newL = parseLanguageChoice(c) }
            catch { await speak(t(L, 'notAudible'), L, S); return }
        }
        if (newL && ['en', 'hi', 'mr'].includes(newL)) {
            setLang(newL); langRef.current = newL
            apiUpdateLanguage(newL)
            try { const u = JSON.parse(localStorage.getItem('accessilearn_user') || '{}'); u.language = newL; localStorage.setItem('accessilearn_user', JSON.stringify(u)) } catch { }
            await speak(t(newL, 'langChanged', langNames[newL]), newL, S)
        } else { await speak(t(L, 'langNotAvailable'), L, S) }
    }

    const doNav = async (text) => {
        const nav = parseNavCommand(text)
        const names = { settings: 'Settings', profile: 'Profile', dashboard: 'Dashboard', upload: 'Upload & Read', summarise: 'Summarise', assignment: 'Assignment Breakdown', planner: 'Study Planner', simplified: 'Simplified Learning' }
        const routes = { settings: '/dashboard/vision/settings', profile: '/dashboard/vision/profile', dashboard: '/dashboard/vision', upload: '/dashboard/vision/upload', summarise: '/dashboard/vision/summarise', assignment: '/dashboard/vision/assignment', planner: '/dashboard/vision/planner', simplified: '/dashboard/vision/simplified' }
        if (nav && routes[nav]) {
            if (nav === 'dashboard') { await speak(t(langRef.current, 'waitingCommand'), langRef.current, speedRef.current) }
            else { await speak(t(langRef.current, 'navigating', names[nav]), langRef.current, speedRef.current); navigate(routes[nav]) }
        }
    }

    const doRepeat = async () => {
        const L = langRef.current, S = speedRef.current, list = tasksRef.current
        if (list.length === 0) { await speak(t(L, 'repeatNone'), L, S); return }
        await speak(t(L, 'repeatIntro'), L, S)
        for (let i = 0; i < list.length; i++) { await speak(t(L, 'repeatTask', i + 1, list[i].text), L, S) }
    }

    const doAddMore = async () => {
        await speak(t(langRef.current, 'addMoreIntro'), langRef.current, speedRef.current)
        await taskEntryLoop()
    }

    const doDeleteTask = async (text) => {
        const L = langRef.current, S = speedRef.current
        let taskNum = typeof text === 'string' ? parseDeleteTaskCommand(text) : text
        if (taskNum === 'ask') {
            await speak(t(L, 'deleteWhich'), L, S)
            try { const r = await listen(L, 8000); const m = r.match(/(\d+)/); if (m) taskNum = parseInt(m[1]); else { await speak(t(L, 'notUnderstood'), L, S); return } }
            catch { await speak(t(L, 'notAudible'), L, S); return }
        }
        const list = tasksRef.current
        if (taskNum >= 1 && taskNum <= list.length) {
            try {
                await apiDeleteTask(list[taskNum - 1].id)
                const updated = list.filter((_, i) => i !== taskNum - 1)
                setTasks(updated); tasksRef.current = updated
                await speak(t(L, 'taskDeleted', taskNum), L, S)
            } catch { await speak(t(L, 'notUnderstood'), L, S) }
        } else { await speak(t(L, 'taskNotFound', taskNum), L, S) }
    }

    const doCompleteTask = async (text) => {
        const L = langRef.current, S = speedRef.current
        let taskNum = typeof text === 'string' ? parseCompleteTaskCommand(text) : text
        if (taskNum === 'ask') {
            await speak(t(L, 'completeWhich'), L, S)
            try { const r = await listen(L, 8000); const m = r.match(/(\d+)/); if (m) taskNum = parseInt(m[1]); else { await speak(t(L, 'notUnderstood'), L, S); return } }
            catch { await speak(t(L, 'notAudible'), L, S); return }
        }
        const list = tasksRef.current
        if (taskNum >= 1 && taskNum <= list.length) {
            try {
                await apiDeleteTask(list[taskNum - 1].id)
                const updated = list.filter((_, i) => i !== taskNum - 1)
                setTasks(updated); tasksRef.current = updated
                if (updated.length > 0) { await speak(t(L, 'taskCompleted', taskNum, updated.length), L, S) }
                else { await speak(t(L, 'taskCompletedNone', taskNum), L, S) }
            } catch { await speak(t(L, 'notUnderstood'), L, S) }
        } else { await speak(t(L, 'taskNotFound', taskNum), L, S) }
    }

    const parseLogoutCommand = (text) => {
        const l = text.toLowerCase()
        return l.includes('logout') || l.includes('log out') || l.includes('sign out') ||
            l.includes('लॉगआउट') || l.includes('बाहर जाओ') || l.includes('बाहर निकलो') ||
            l.includes('बाहेर पड')
    }

    const doLogout = async () => {
        const L = langRef.current, S = speedRef.current
        await speak(t(L, 'logoutConfirm'), L, S)
        try {
            const resp = await listen(L, 8000)
            if (parseYesNo(resp) === 'yes') { await speak(t(L, 'logoutBye'), L, S); performLogout() }
            else { await speak(t(L, 'logoutCancel'), L, S) }
        } catch { await speak(t(L, 'logoutCancel'), L, S) }
    }

    const performLogout = () => {
        alive.current = false; window.speechSynthesis?.cancel()
        setVoiceActive(false); setVoicePaused(false); pausedRef.current = false
        localStorage.removeItem('accessilearn_user'); localStorage.removeItem('accessilearn_prefs'); localStorage.removeItem('accessilearn_token')
        sessionStorage.removeItem('accessilearn_welcomed')
        navigate('/')
    }

    /* ── Alerts (poll every 30s to check if any task time has arrived) ── */
    const firedAlerts = useRef(new Set())

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date()
            const currentHH = String(now.getHours()).padStart(2, '0')
            const currentMM = String(now.getMinutes()).padStart(2, '0')
            const currentTime = `${currentHH}:${currentMM}`

            tasksRef.current.forEach(task => {
                if (task.alertTime && task.alertTime === currentTime && !task.completed && !firedAlerts.current.has(task.id)) {
                    firedAlerts.current.add(task.id)
                    console.log('[Alert] Firing for task:', task.text, 'at', currentTime)
                    window.speechSynthesis?.cancel()
                    speak(t(langRef.current, 'taskAlert', task.text), langRef.current, speedRef.current)
                    setStatus(`⚠️ Alert: ${task.text}`)
                }
            })
        }, 15000) // check every 15 seconds

        return () => clearInterval(interval)
    }, [])

    const handleLogoutButton = async () => {
        const L = langRef.current, S = speedRef.current
        await speak(t(L, 'logoutConfirm'), L, S)
        try {
            const resp = await listen(L, 8000)
            if (parseYesNo(resp) === 'yes') { await speak(t(L, 'logoutBye'), L, S); performLogout() }
            else { await speak(t(L, 'logoutCancel'), L, S) }
        } catch { performLogout() }
    }

    return (
        <div className="vdash vdash--hc" aria-label="Vision dashboard">
            <a className="skip-link" href="#main-content">Skip to main content</a>
            <header className="vdash-topbar" role="banner">
                <div className="vdash-topbar-left">
                    <button className="vdash-sidebar-toggle" onClick={() => setSidebarOpen(s => !s)} aria-label="Toggle sidebar">☰</button>
                    <Link to="/" className="vdash-brand"><span className="brand-icon" aria-hidden="true">A</span><span>AccessiLearn</span></Link>
                </div>
                <div className="vdash-topbar-center">
                    <label htmlFor="vdash-search" className="sr-only">Search</label>
                    <input id="vdash-search" type="search" placeholder="Search or say a command…" className="vdash-search" />
                </div>
                <div className="vdash-topbar-right">
                    <button
                        className={`vdash-voice-btn${voiceActive && !voicePaused ? ' active' : ''}`}
                        onClick={() => {
                            if (voicePaused) { setVoicePaused(false); pausedRef.current = false; speak(t(langRef.current, 'voiceStarted'), langRef.current, speedRef.current); setStatus('Ready') }
                            else if (voiceActive) { alive.current = false; window.speechSynthesis?.cancel(); setVoiceActive(false); setVoicePaused(false); pausedRef.current = false }
                            else { alive.current = true; startCommandLoopOnly() }
                        }}
                    >
                        🎤 {voicePaused ? 'Paused' : voiceActive ? 'Listening…' : 'Voice Off'}
                    </button>
                    <span className="vdash-speed-badge">{speed}x</span>
                    <span className="vdash-lang-badge">{langNames[lang]}</span>
                    <button className="vdash-icon-btn" onClick={handleLogoutButton} aria-label="Logout">🚪</button>
                </div>
            </header>
            <div className="vdash-body">
                <nav className={`vdash-sidebar${sidebarOpen ? '' : ' collapsed'}`} aria-label="Navigation">
                    {sidebarOpen && <div className="vdash-sidebar-heading">Tools</div>}
                    <ul className="vdash-sidebar-list" role="list">
                        {sidebarLinks.map(link => (
                            <li key={link.id} role="listitem">
                                {link.route ? (
                                    <Link to={link.route} className="vdash-sidebar-link">
                                        <span className="vdash-sidebar-icon" aria-hidden="true">{link.icon}</span>
                                        {sidebarOpen && <span className="vdash-sidebar-label">{link.label}</span>}
                                    </Link>
                                ) : (
                                    <button className="vdash-sidebar-link" onClick={() => speak(`Opening ${link.label}`, langRef.current, speedRef.current)}>
                                        <span className="vdash-sidebar-icon" aria-hidden="true">{link.icon}</span>
                                        {sidebarOpen && <span className="vdash-sidebar-label">{link.label}</span>}
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                    {sidebarOpen && <p className="vdash-sidebar-note">Primary tools are voice-controlled.</p>}
                </nav>
                <main className="vdash-main" id="main-content" tabIndex={-1}>
                    <div className="vdash-voice-status" role="status" aria-live="polite">
                        <div className={`vdash-voice-indicator${voiceActive && !voicePaused ? ' active' : ''}`}>
                            <span className="vdash-voice-dot" aria-hidden="true" />
                            <span>{voicePaused ? '⏸️ Voice paused — say "start voice"' : voiceActive ? `🎤 ${status || 'Listening...'}` : '🎤 Voice Off'}</span>
                        </div>
                        <span className="vdash-voice-hint">Speed: {speed}x • Lang: {langNames[lang]}</span>
                    </div>
                    <div className="vdash-greeting">
                        <h1>Welcome back, {user?.name || 'there'} 👋</h1>
                        <p>Your dashboard is voice-first. Just talk and I'll handle the rest.</p>
                    </div>
                    <section aria-labelledby="vdash-tasks-heading">
                        <h2 id="vdash-tasks-heading" className="vdash-section-title">📋 Today's Tasks ({tasks.length})</h2>
                        {tasks.length === 0 ? (
                            <p className="vdash-no-tasks">No tasks yet. Say "add tasks" to get started.</p>
                        ) : (
                            <div className="vdash-task-list">
                                {tasks.map((task, idx) => (
                                    <div key={task.id} className={`vdash-task-item${task.completed ? ' done' : ''}`}>
                                        <span className="vdash-task-num">{idx + 1}</span>
                                        <div className="vdash-task-content">
                                            <span className="vdash-task-text">{task.text}</span>
                                            {task.alertTime && <span className="vdash-task-time">⏰ {task.alertTime}</span>}
                                        </div>
                                        <button className="vdash-task-delete" onClick={() => doDeleteTask(idx + 1)} aria-label={`Delete task ${idx + 1}`} title="Delete">✕</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                    <div className="vdash-a11y-info" role="note">
                        <h2>Voice Commands</h2>
                        <ul>
                            <li>➕ "Add tasks" — start adding</li>
                            <li>✅ "Completed task 3" — mark done</li>
                            <li>🗑️ "Delete task 3" — remove</li>
                            <li>⏩ "Change speed to 2x" / "Slow down"</li>
                            <li>🌐 "Change language to Hindi"</li>
                            <li>📂 "Upload file" — go to Upload & Read</li>
                            <li>📍 "Go to settings/profile/upload"</li>
                            <li>🔁 "Repeat tasks" — read all aloud</li>
                            <li>🔇 "Stop voice" / "Start voice"</li>
                            <li>🚪 "Logout" — with confirmation</li>
                        </ul>
                    </div>
                </main>
            </div>
        </div>
    )
}
