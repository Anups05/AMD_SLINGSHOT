import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const API = 'http://localhost:5000/api'
function getToken() { return localStorage.getItem('accessilearn_token') || '' }
function getUser() { try { return JSON.parse(localStorage.getItem('accessilearn_user') || '{}') } catch { return {} } }

const sidebarLinks = [
    { id: 'captions', icon: '🎤', label: 'Live Captions', route: '/dashboard/speech/captions' },
    { id: 'summary', icon: '✨', label: 'Summaries', route: '/dashboard/speech/summary' },
    { id: 'transcript', icon: '📑', label: 'Transcripts', route: '/dashboard/speech/transcript' },
    { id: 'chat', icon: '💬', label: 'Chat Assistant', route: '/dashboard/speech/chat' },
    { id: 'pdf', icon: '📄', label: 'PDF Reader', route: '/dashboard/speech/pdf' },
    { id: 'tts', icon: '🔊', label: 'Text to Speech', route: '/dashboard/speech/tts' },
    { id: 'assignment', icon: '📝', label: 'Assignments', route: '/dashboard/speech/assignment' },
    { id: 'simplified', icon: '🎓', label: 'Simple Learn', route: '/dashboard/speech/simplified' },
    { id: 'planner', icon: '📋', label: 'Planner', route: '/dashboard/speech/planner' },
    { id: 'checkin', icon: '🧠', label: 'Confidence', route: '/dashboard/speech/checkin' },
    { id: 'profile', icon: '👤', label: 'Profile', route: '/dashboard/speech/profile' },
]

const uiStrings = {
    en: { welcome: 'Welcome back', pick: 'Your text-first learning toolkit. Pick a tool to get started.', todayTasks: "Today's Tasks", addTask: 'Add a task...', noTasks: 'No tasks for today. Add one!', logout: 'Logout', done: 'Done', delete: 'Delete', edit: 'Edit', save: 'Save' },
    hi: { welcome: 'वापस स्वागत है', pick: 'आपका टेक्स्ट-फर्स्ट लर्निंग टूलकिट। शुरू करने के लिए एक टूल चुनें।', todayTasks: 'आज के कार्य', addTask: 'कार्य जोड़ें...', noTasks: 'आज कोई कार्य नहीं। एक जोड़ें!', logout: 'लॉगआउट', done: 'पूर्ण', delete: 'हटाएं', edit: 'संपादित', save: 'सहेजें' },
    mr: { welcome: 'पुन्हा स्वागत', pick: 'तुमचं टेक्स्ट-फर्स्ट लर्निंग टूलकिट. सुरू करायला एक टूल निवडा.', todayTasks: 'आजची कामे', addTask: 'काम जोडा...', noTasks: 'आज कामे नाहीत. एक जोडा!', logout: 'लॉगआउट', done: 'पूर्ण', delete: 'काढा', edit: 'बदला', save: 'जतन करा' },
}

const cardStrings = {
    en: [
        { icon: '🎤', title: 'Live Captions', desc: 'Real-time speech-to-text captions with translation.', route: '/dashboard/speech/captions', color: '#3b82f6' },
        { icon: '✨', title: 'AI Summaries', desc: 'Upload any file and get topic-based AI summaries.', route: '/dashboard/speech/summary', color: '#8b5cf6' },
        { icon: '📑', title: 'Transcripts', desc: 'Upload audio files and get downloadable transcripts.', route: '/dashboard/speech/transcript', color: '#06b6d4' },
        { icon: '💬', title: 'Chat Assistant', desc: 'Ask study doubts via text with file upload support.', route: '/dashboard/speech/chat', color: '#10b981' },
        { icon: '📄', title: 'PDF Reader', desc: 'Extract text from PDFs with main points highlighted.', route: '/dashboard/speech/pdf', color: '#f59e0b' },
        { icon: '🔊', title: 'Text to Speech', desc: 'Paste text and listen to it in your preferred language.', route: '/dashboard/speech/tts', color: '#ef4444' },
        { icon: '📝', title: 'Assignments', desc: 'Break down assignments into step-by-step tasks.', route: '/dashboard/speech/assignment', color: '#ec4899' },
        { icon: '🎓', title: 'Simple Learn', desc: 'Get age-appropriate explanations of complex topics.', route: '/dashboard/speech/simplified', color: '#14b8a6' },
        { icon: '📋', title: 'Study Planner', desc: 'Create structured study plans with time blocks.', route: '/dashboard/speech/planner', color: '#6366f1' },
        { icon: '🧠', title: 'Confidence Check', desc: 'Quick self-assessment to track learning confidence.', route: '/dashboard/speech/checkin', color: '#f97316' },
    ],
    hi: [
        { icon: '🎤', title: 'लाइव कैप्शन', desc: 'रियल-टाइम स्पीच-टू-टेक्स्ट कैप्शन अनुवाद के साथ।', route: '/dashboard/speech/captions', color: '#3b82f6' },
        { icon: '✨', title: 'AI सारांश', desc: 'कोई भी फ़ाइल अपलोड करें और विषय-आधारित AI सारांश पाएं।', route: '/dashboard/speech/summary', color: '#8b5cf6' },
        { icon: '📑', title: 'ट्रांसक्रिप्ट', desc: 'ऑडियो फ़ाइलें अपलोड करें और डाउनलोडेबल ट्रांसक्रिप्ट पाएं।', route: '/dashboard/speech/transcript', color: '#06b6d4' },
        { icon: '💬', title: 'चैट असिस्टेंट', desc: 'टेक्स्ट से स्टडी सवाल पूछें, फ़ाइल अपलोड सपोर्ट।', route: '/dashboard/speech/chat', color: '#10b981' },
        { icon: '📄', title: 'PDF रीडर', desc: 'PDF से टेक्स्ट निकालें, मुख्य बिंदु हाइलाइट।', route: '/dashboard/speech/pdf', color: '#f59e0b' },
        { icon: '🔊', title: 'टेक्स्ट टू स्पीच', desc: 'टेक्स्ट पेस्ट करें और अपनी भाषा में सुनें।', route: '/dashboard/speech/tts', color: '#ef4444' },
        { icon: '📝', title: 'असाइनमेंट', desc: 'असाइनमेंट को स्टेप-बाय-स्टेप में तोड़ें।', route: '/dashboard/speech/assignment', color: '#ec4899' },
        { icon: '🎓', title: 'सरल सीखें', desc: 'जटिल विषयों की उम्र-उपयुक्त व्याख्या पाएं।', route: '/dashboard/speech/simplified', color: '#14b8a6' },
        { icon: '📋', title: 'स्टडी प्लानर', desc: 'टाइम ब्लॉक के साथ स्ट्रक्चर्ड स्टडी प्लान बनाएं।', route: '/dashboard/speech/planner', color: '#6366f1' },
        { icon: '🧠', title: 'आत्मविश्वास जांच', desc: 'लर्निंग कॉन्फिडेंस ट्रैक करने के लिए सेल्फ-असेसमेंट।', route: '/dashboard/speech/checkin', color: '#f97316' },
    ],
    mr: [
        { icon: '🎤', title: 'लाइव्ह कॅप्शन', desc: 'रिअल-टाइम स्पीच-टू-टेक्स्ट कॅप्शन भाषांतरासह.', route: '/dashboard/speech/captions', color: '#3b82f6' },
        { icon: '✨', title: 'AI सारांश', desc: 'कोणतीही फाइल अपलोड करा आणि विषय-आधारित AI सारांश मिळवा.', route: '/dashboard/speech/summary', color: '#8b5cf6' },
        { icon: '📑', title: 'ट्रान्सक्रिप्ट', desc: 'ऑडिओ फाइल्स अपलोड करा आणि डाउनलोडेबल ट्रान्सक्रिप्ट मिळवा.', route: '/dashboard/speech/transcript', color: '#06b6d4' },
        { icon: '💬', title: 'चॅट असिस्टंट', desc: 'टेक्स्टने अभ्यासाचे प्रश्न विचारा, फाइल अपलोड सपोर्ट.', route: '/dashboard/speech/chat', color: '#10b981' },
        { icon: '📄', title: 'PDF वाचक', desc: 'PDF मधून टेक्स्ट काढा, मुख्य मुद्दे हायलाइट.', route: '/dashboard/speech/pdf', color: '#f59e0b' },
        { icon: '🔊', title: 'टेक्स्ट टू स्पीच', desc: 'टेक्स्ट पेस्ट करा आणि तुमच्या भाषेत ऐका.', route: '/dashboard/speech/tts', color: '#ef4444' },
        { icon: '📝', title: 'असाइनमेंट', desc: 'असाइनमेंट स्टेप-बाय-स्टेप मध्ये मोडा.', route: '/dashboard/speech/assignment', color: '#ec4899' },
        { icon: '🎓', title: 'सोपे शिका', desc: 'जटिल विषयांचे वय-उपयुक्त स्पष्टीकरण मिळवा.', route: '/dashboard/speech/simplified', color: '#14b8a6' },
        { icon: '📋', title: 'स्टडी प्लॅनर', desc: 'टाइम ब्लॉकसह स्ट्रक्चर्ड स्टडी प्लॅन बनवा.', route: '/dashboard/speech/planner', color: '#6366f1' },
        { icon: '🧠', title: 'आत्मविश्वास तपासणी', desc: 'लर्निंग कॉन्फिडन्स ट्रॅक करण्यासाठी सेल्फ-असेसमेंट.', route: '/dashboard/speech/checkin', color: '#f97316' },
    ]
}

export default function SpeechDashboard() {
    const navigate = useNavigate()
    const [user, setUser] = useState(getUser())
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [lang, setLang] = useState(user.language || 'en')
    const [tasks, setTasks] = useState([])
    const [newTask, setNewTask] = useState('')
    const [editingId, setEditingId] = useState(null)
    const [editText, setEditText] = useState('')

    const ui = uiStrings[lang] || uiStrings.en
    const cards = cardStrings[lang] || cardStrings.en

    useEffect(() => {
        document.title = 'AccessiLearn — Speech Dashboard'
        const u = getUser(); setUser(u); setLang(u.language || 'en')
        fetchTasks()
    }, [])

    // Fetch today's tasks
    const fetchTasks = async () => {
        try {
            const r = await fetch(`${API}/tasks`, { headers: { 'Authorization': `Bearer ${getToken()}` } })
            const data = await r.json()
            if (data.tasks) setTasks(data.tasks)
        } catch { }
    }

    const addTask = async () => {
        if (!newTask.trim()) return
        try {
            const r = await fetch(`${API}/tasks`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                body: JSON.stringify({ text: newTask.trim() })
            })
            const data = await r.json()
            if (data.task) { setTasks(t => [...t, data.task]); setNewTask('') }
        } catch { }
    }

    const deleteTask = async (id) => {
        try {
            await fetch(`${API}/tasks/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${getToken()}` } })
            setTasks(t => t.filter(x => x.id !== id))
        } catch { }
    }

    const toggleComplete = async (id) => {
        const task = tasks.find(t => t.id === id)
        if (!task) return
        try {
            await fetch(`${API}/tasks/${id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                body: JSON.stringify({ completed: task.completed ? 0 : 1 })
            })
            setTasks(t => t.map(x => x.id === id ? { ...x, completed: x.completed ? 0 : 1 } : x))
        } catch { }
    }

    const saveEdit = async (id) => {
        if (!editText.trim()) return
        try {
            await fetch(`${API}/tasks/${id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                body: JSON.stringify({ text: editText.trim() })
            })
            setTasks(t => t.map(x => x.id === id ? { ...x, text: editText.trim() } : x))
            setEditingId(null); setEditText('')
        } catch { }
    }


    const handleLogout = () => {
        localStorage.removeItem('accessilearn_token'); localStorage.removeItem('accessilearn_user'); navigate('/')
    }

    const handleLangChange = async (newLang) => {
        setLang(newLang)
        try {
            await fetch(`${API}/auth/language`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` }, body: JSON.stringify({ language: newLang }) })
            const u = { ...user, language: newLang }; setUser(u); localStorage.setItem('accessilearn_user', JSON.stringify(u))
        } catch { }
    }

    return (
        <div className="sdash">
            {/* Sidebar */}
            <aside className={`sdash-sidebar${sidebarOpen ? ' open' : ''}${sidebarCollapsed ? ' collapsed' : ''}`}>
                <div className="sdash-sidebar-header">
                    {!sidebarCollapsed && <span className="sdash-brand">AccessiLearn</span>}
                    <button className="sdash-collapse-btn" onClick={() => setSidebarCollapsed(c => !c)} title={sidebarCollapsed ? 'Expand' : 'Collapse'}>
                        {sidebarCollapsed ? '→' : '←'}
                    </button>
                    <button className="sdash-sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
                </div>
                <nav className="sdash-sidebar-nav">
                    {sidebarLinks.map(l => (
                        <Link key={l.id} to={l.route} className="sdash-sidebar-link" onClick={() => setSidebarOpen(false)} title={l.label}>
                            <span className="sdash-sidebar-icon">{l.icon}</span>
                            {!sidebarCollapsed && <span>{l.label}</span>}
                        </Link>
                    ))}
                </nav>
                <div className="sdash-sidebar-footer">
                    <button className="sdash-logout-btn" onClick={handleLogout}>🚪 {!sidebarCollapsed && ui.logout}</button>
                </div>
            </aside>

            {/* Main */}
            <main className={`sdash-main${sidebarCollapsed ? ' collapsed' : ''}`}>
                <header className="sdash-topbar">
                    <button className="sdash-menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
                    <h1 className="sdash-title">Speech Dashboard</h1>
                    <div className="sdash-topbar-actions">
                        <select className="sdash-lang-select" value={lang} onChange={e => handleLangChange(e.target.value)}>
                            <option value="en">English</option>
                            <option value="hi">हिन्दी</option>
                            <option value="mr">मराठी</option>
                        </select>
                    </div>
                </header>

                <section className="sdash-welcome">
                    <h2>{ui.welcome}, {user.name || 'Student'}!</h2>
                    <p>{ui.pick}</p>
                </section>


                {/* Today's Tasks */}
                <section className="sdash-tasks-section">
                    <h3 className="sdash-tasks-title">{ui.todayTasks}</h3>
                    <div className="sdash-task-input-row">
                        <input type="text" value={newTask} onChange={e => setNewTask(e.target.value)}
                            placeholder={ui.addTask} className="sdash-task-input"
                            onKeyDown={e => e.key === 'Enter' && addTask()} />
                        <button className="btn btn-primary btn-sm" onClick={addTask}>+</button>
                    </div>
                    {tasks.length === 0 && <p className="sdash-tasks-empty">{ui.noTasks}</p>}
                    <ul className="sdash-task-list">
                        {tasks.map(task => (
                            <li key={task.id} className={`sdash-task-item${task.completed ? ' done' : ''}`}>
                                <input type="checkbox" checked={!!task.completed} onChange={() => toggleComplete(task.id)} className="sdash-task-check" />
                                {editingId === task.id ? (
                                    <div className="sdash-task-edit-row">
                                        <input type="text" value={editText} onChange={e => setEditText(e.target.value)} className="sdash-task-edit-input" onKeyDown={e => e.key === 'Enter' && saveEdit(task.id)} autoFocus />
                                        <button className="sdash-task-btn save" onClick={() => saveEdit(task.id)}>{ui.save}</button>
                                    </div>
                                ) : (
                                    <>
                                        <span className={`sdash-task-text${task.completed ? ' struck' : ''}`}>{task.text}</span>
                                        <div className="sdash-task-actions">
                                            {!task.completed && <button className="sdash-task-btn done-btn" onClick={() => toggleComplete(task.id)}>✓ {ui.done}</button>}
                                            {task.completed && <button className="sdash-task-btn done-btn undone" onClick={() => toggleComplete(task.id)}>↩</button>}
                                            <button className="sdash-task-btn edit" onClick={() => { setEditingId(task.id); setEditText(task.text) }}>{ui.edit}</button>
                                            <button className="sdash-task-btn del" onClick={() => deleteTask(task.id)}>{ui.delete}</button>
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Tool cards */}
                <section className="sdash-cards">
                    {cards.map(card => (
                        <Link key={card.route} to={card.route} className="sdash-card" style={{ '--card-accent': card.color }}>
                            <div className="sdash-card-icon">{card.icon}</div>
                            <div className="sdash-card-content"><h3>{card.title}</h3><p>{card.desc}</p></div>
                        </Link>
                    ))}
                </section>
            </main>

            {sidebarOpen && <div className="sdash-overlay" onClick={() => setSidebarOpen(false)} />}
        </div>
    )
}
