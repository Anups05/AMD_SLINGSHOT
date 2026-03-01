import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    speak, listen, t, langNames, voiceFilePicker, getFileTypeAnnouncement,
    interruptibleRead, parseNavCommand, parseYesNo, subPageCommandLoop,
} from '../utils/voiceSystem'

const API = 'http://localhost:5000'
function getToken() { try { return localStorage.getItem('accessilearn_token') || '' } catch { return '' } }

export default function VisionSimplified() {
    const navigate = useNavigate()
    const [lang, setLang] = useState('en')
    const [speed, setSpeed] = useState(1.0)
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')
    const [mode, setMode] = useState(null)
    const fileInputRef = useRef(null)
    const langRef = useRef('en')
    const speedRef = useRef(1.0)
    const alive = useRef(true)

    useEffect(() => { langRef.current = lang }, [lang])
    useEffect(() => { speedRef.current = speed }, [speed])

    useEffect(() => {
        document.title = 'AccessiLearn — Simple Learn'
        try {
            const raw = localStorage.getItem('accessilearn_user')
            if (raw) {
                const u = JSON.parse(raw)
                setLang(u.language || 'en')
                setSpeed(u.speechSpeed || 1.0)
                langRef.current = u.language || 'en'
                speedRef.current = u.speechSpeed || 1.0
            }
        } catch { }
        if ('speechSynthesis' in window) {
            window.speechSynthesis.getVoices()
            window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices()
        }
        alive.current = true
        const timer = setTimeout(() => startSimplifiedFlow(), 1500)
        return () => { alive.current = false; clearTimeout(timer); window.speechSynthesis?.cancel() }
    }, [])

    const startSimplifiedFlow = async () => {
        const L = langRef.current, S = speedRef.current
        const msgs = {
            en: 'Welcome to Simple Learn! Would you like to upload a file, or describe a topic by speaking? I will explain it to you like I am teaching a young child.',
            hi: 'सिंपल लर्न में स्वागत! फ़ाइल अपलोड करना है, या बोलकर टॉपिक बताना है? मैं छोटे बच्चे को समझाने जैसे समझाऊँगा।',
            mr: 'सिंपल लर्नमध्ये स्वागत! फाइल अपलोड करायची की बोलून टॉपिक सांगायचा? लहान मुलाला शिकवतो तसं समजावून सांगतो.'
        }
        await speak(msgs[L] || msgs.en, L, S)

        try {
            const resp = await listen(L, 10000)
            const lower = resp.toLowerCase()
            const nav = parseNavCommand(resp)
            if (nav) {
                const routes = { dashboard: '/dashboard/vision', upload: '/dashboard/vision/upload' }
                if (routes[nav]) { navigate(routes[nav]); return }
            }

            if (lower.includes('upload') || lower.includes('file') || lower.includes('pdf') || lower.includes('image') ||
                lower.includes('अपलोड') || lower.includes('फाइल') || lower.includes('फ़ाइल')) {
                setMode('upload')
                const uploadMsg = { en: 'Select your file.', hi: 'फ़ाइल चुनो।', mr: 'फाइल निवडा.' }
                await speak(uploadMsg[L] || uploadMsg.en, L, S)
                const selectedFile = await voiceFilePicker(L, S, speak, [
                    { description: 'Files', accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'], 'application/pdf': ['.pdf'] } }
                ])
                if (selectedFile) handleFileReady(selectedFile)
                else setTimeout(() => fileInputRef.current?.click(), 300)
            } else {
                setMode('speak')
                const speakMsg = { en: 'Tell me the topic you want me to explain simply.', hi: 'बताओ कौन सा टॉपिक हसी तरह से समझाना है?', mr: 'सांग कोणता टॉपिक सोप्या भाषेत समजावून सांगू?' }
                await speak(speakMsg[L] || speakMsg.en, L, S)
                try {
                    const topic = await listen(L, 15000)
                    if (topic) await processSpokenTopic(topic)
                } catch { subPageCommandLoop(L, S, navigate, alive) }
            }
        } catch { subPageCommandLoop(langRef.current, speedRef.current, navigate, alive) }
    }

    const handleFileChange = (e) => {
        const f = e.target.files?.[0]
        if (f) handleFileReady(f)
    }

    const handleFileReady = async (f) => {
        setFile(f)
        setError('')
        setResult(null)
        const L = langRef.current, S = speedRef.current
        await speak(getFileTypeAnnouncement(f, L), L, S)
        await processFile(f)
    }

    const processFile = async (fileToProcess) => {
        const L = langRef.current, S = speedRef.current
        setLoading(true)
        setError('')
        const msgs = { en: 'Reading the file and preparing a simple explanation...', hi: 'फ़ाइल पढ़ रहा हूँ और आसान भाषा में समझाने की तैयारी कर रहा हूँ...', mr: 'फाइल वाचतोय आणि सोप्या भाषेत समजावून सांगायची तयारी करतोय...' }
        await speak(msgs[L] || msgs.en, L, S)
        try {
            const formData = new FormData()
            formData.append('file', fileToProcess)
            formData.append('language', L)
            const res = await fetch(`${API}/api/upload/simplify`, { method: 'POST', headers: { 'Authorization': `Bearer ${getToken()}` }, body: formData })
            const data = await res.json()
            if (data.error) { setError(data.error); await speak(data.error, L, S) }
            else {
                setResult(data)
                const doneMsg = { en: 'Here is the simple explanation.', hi: 'यह रही आसान भाषा में समझ।', mr: 'हे सोपं स्पष्टीकरण.' }
                await speak(doneMsg[L] || doneMsg.en, L, S)
                await speak(data.translatedExplanation || data.explanation, L, S)
            }
        } catch (err) { setError(err.message) }
        setLoading(false)
        subPageCommandLoop(langRef.current, speedRef.current, navigate, alive)
    }

    const processSpokenTopic = async (topic) => {
        const L = langRef.current, S = speedRef.current
        setLoading(true)
        setError('')
        const msgs = { en: 'Preparing a simple explanation...', hi: 'आसान भाषा में समझा रहा हूँ...', mr: 'सोप्या भाषेत समजावतोय...' }
        await speak(msgs[L] || msgs.en, L, S)
        try {
            const res = await fetch(`${API}/api/upload/simplify-text`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                body: JSON.stringify({ text: topic, language: L })
            })
            const data = await res.json()
            if (data.error) { setError(data.error); await speak(data.error, L, S) }
            else {
                setResult(data)
                const doneMsg = { en: 'Here is the simple explanation.', hi: 'यह रही आसान भाषा में समझ।', mr: 'हे सोपं स्पष्टीकरण.' }
                await speak(doneMsg[L] || doneMsg.en, L, S)
                await speak(data.translatedExplanation || data.explanation, L, S)
            }
        } catch (err) { setError(err.message) }
        setLoading(false)
        subPageCommandLoop(langRef.current, speedRef.current, navigate, alive)
    }

    return (
        <div className="vdash vdash--hc" aria-label="Simple Learn">
            <header className="vdash-topbar" role="banner">
                <div className="vdash-topbar-left">
                    <Link to="/dashboard/vision" className="vdash-brand"><span className="brand-icon" aria-hidden="true">←</span><span>Back to Dashboard</span></Link>
                </div>
                <div className="vdash-topbar-right">
                    <span className="vdash-lang-badge">{langNames[lang]}</span>
                    <span className="vdash-speed-badge">{speed}x</span>
                </div>
            </header>
            <div className="vdash-page-center">
                <div className="upload-page">
                    <h1 className="upload-title">🎓 Simple Learn</h1>
                    <p className="upload-subtitle">Upload a file or describe a topic. I'll explain it simply, like teaching a young child.</p>

                    <input type="file" ref={fileInputRef} style={{ display: 'none' }}
                        accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                        onChange={handleFileChange} />

                    <div className="upload-actions" style={{ marginTop: '24px' }}>
                        <button className="btn btn-primary upload-btn" onClick={() => {
                            setMode('upload')
                            setTimeout(() => fileInputRef.current?.click(), 100)
                        }} disabled={loading}>📄 Upload File</button>
                        <button className="btn btn-outline upload-btn" onClick={async () => {
                            setMode('speak')
                            const L = langRef.current, S = speedRef.current
                            const msg = { en: 'Tell me the topic.', hi: 'टॉपिक बताओ।', mr: 'टॉपिक सांग.' }
                            await speak(msg[L] || msg.en, L, S)
                            try { const t = await listen(L, 15000); if (t) await processSpokenTopic(t) } catch { }
                        }} disabled={loading}>🎤 Describe by Voice</button>
                    </div>

                    {file && (
                        <div className="upload-drop-area" style={{ marginTop: '16px', cursor: 'default' }}>
                            <div className="upload-file-info">
                                <span className="upload-file-icon">{file.name?.endsWith('.pdf') ? '📄' : '🖼️'}</span>
                                <span className="upload-file-name">{file.name}</span>
                            </div>
                        </div>
                    )}

                    {error && <div className="upload-error" role="alert">❌ {error}</div>}
                    {loading && <div className="upload-browse-status" role="status">⏳ Creating explanation...</div>}

                    {result && (
                        <div className="upload-results">
                            <section className="upload-result-section">
                                <div className="upload-result-header">
                                    <h2>🎓 Simple Explanation</h2>
                                    <button className="btn btn-outline btn-sm" onClick={() => speak(result.translatedExplanation || result.explanation, langRef.current, speedRef.current)}>🔊 Read Aloud</button>
                                </div>
                                <div className="upload-result-text" style={{ whiteSpace: 'pre-wrap' }}>{result.translatedExplanation || result.explanation}</div>
                            </section>
                        </div>
                    )}

                    <div className="vdash-a11y-info" role="note" style={{ marginTop: '32px' }}>
                        <h2>How It Works</h2>
                        <ul>
                            <li>📄 Upload a file or 🎤 describe a topic</li>
                            <li>🎓 Get a simple, child-friendly explanation</li>
                            <li>🗣️ Say "go back" / "dashboard" to return</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
