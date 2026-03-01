import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    speak, listen, t, langNames, voiceFilePicker, getFileTypeAnnouncement,
    interruptibleRead, apiAssignmentBreakdown, apiAssignmentBreakdownText,
    parseNavCommand, parseYesNo, subPageCommandLoop,
} from '../utils/voiceSystem'

const API = 'http://localhost:5000'

export default function VisionAssignment() {
    const navigate = useNavigate()
    const [lang, setLang] = useState('en')
    const [speed, setSpeed] = useState(1.0)
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')
    const [mode, setMode] = useState(null) // 'upload' | 'speak' | null
    const fileInputRef = useRef(null)
    const langRef = useRef('en')
    const speedRef = useRef(1.0)
    const alive = useRef(true)

    useEffect(() => { langRef.current = lang }, [lang])
    useEffect(() => { speedRef.current = speed }, [speed])

    useEffect(() => {
        document.title = 'AccessiLearn — Assignment Breakdown'
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
        const timer = setTimeout(() => startAssignmentFlow(), 1500)
        return () => { alive.current = false; clearTimeout(timer); window.speechSynthesis?.cancel() }
    }, [])

    const startAssignmentFlow = async () => {
        const L = langRef.current, S = speedRef.current
        await speak(t(L, 'assignmentAsk'), L, S)

        // Listen for upload or speak choice
        try {
            const resp = await listen(L, 10000)
            const lower = resp.toLowerCase()

            // Check if user wants to go somewhere else
            const nav = parseNavCommand(resp)
            if (nav) {
                const routes = { dashboard: '/dashboard/vision', upload: '/dashboard/vision/upload', summarise: '/dashboard/vision/summarise' }
                if (routes[nav]) { navigate(routes[nav]); return }
            }

            if (lower.includes('upload') || lower.includes('file') || lower.includes('pdf') || lower.includes('image') ||
                lower.includes('अपलोड') || lower.includes('फ़ाइल') || lower.includes('फाइल') ||
                lower.includes('अपलोड') || lower.includes('फाइल')) {
                setMode('upload')
                await speak(t(L, 'assignmentUpload'), L, S)
                // Try voice file picker
                const selectedFile = await voiceFilePicker(L, S, speak, [
                    { description: 'Assignment Files', accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'], 'application/pdf': ['.pdf'] } }
                ])
                if (selectedFile) {
                    handleFileReady(selectedFile)
                } else {
                    setTimeout(() => fileInputRef.current?.click(), 300)
                }
            } else {
                // User wants to speak the assignment
                setMode('speak')
                await speak(t(L, 'assignmentSpeak'), L, S)
                try {
                    const assignment = await listen(L, 15000)
                    if (assignment) await processSpokenAssignment(assignment)
                } catch {
                    await speak(t(L, 'notAudible'), L, S)
                    // Fall into command loop
                    subPageCommandLoop(L, S, navigate, alive)
                }
            }
        } catch {
            // Timeout — start command loop
            subPageCommandLoop(langRef.current, speedRef.current, navigate, alive)
        }
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
        await processAssignmentFile(f)
    }

    const processAssignmentFile = async (fileToProcess) => {
        const L = langRef.current, S = speedRef.current
        setLoading(true)
        setError('')
        await speak(t(L, 'assignmentProcessing'), L, S)
        try {
            const data = await apiAssignmentBreakdown(fileToProcess, L)
            if (data.error) {
                setError(data.error)
                await speak(t(L, 'assignmentError') + ' ' + data.error, L, S)
            } else {
                setResult(data)
                await speak(t(L, 'assignmentDone'), L, S)
                const textToRead = data.translatedBreakdown || data.breakdown
                if (textToRead) await interruptibleRead(textToRead, L, S)
            }
        } catch (err) {
            setError(err.message)
            await speak(t(L, 'assignmentError'), L, S)
        }
        setLoading(false)
        // After reading, start command loop for navigation
        subPageCommandLoop(langRef.current, speedRef.current, navigate, alive)
    }

    const processSpokenAssignment = async (text) => {
        const L = langRef.current, S = speedRef.current
        setLoading(true)
        setError('')
        await speak(t(L, 'assignmentProcessing'), L, S)
        try {
            const data = await apiAssignmentBreakdownText(text, L)
            if (data.error) {
                setError(data.error)
                await speak(t(L, 'assignmentError'), L, S)
            } else {
                setResult(data)
                await speak(t(L, 'assignmentDone'), L, S)
                const textToRead = data.translatedBreakdown || data.breakdown
                if (textToRead) await interruptibleRead(textToRead, L, S)
            }
        } catch (err) {
            setError(err.message)
            await speak(t(L, 'assignmentError'), L, S)
        }
        setLoading(false)
        subPageCommandLoop(langRef.current, speedRef.current, navigate, alive)
    }

    const readAloud = async (text) => {
        if (text) await interruptibleRead(text, langRef.current, speedRef.current)
    }

    return (
        <div className="vdash vdash--hc" aria-label="Assignment Breakdown">
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
                    <h1 className="upload-title">📝 Assignment Breakdown</h1>
                    <p className="upload-subtitle">Upload your assignment or describe it vocally. I'll give step-by-step instructions.</p>

                    <input type="file" ref={fileInputRef} style={{ display: 'none' }}
                        accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                        onChange={handleFileChange} />

                    <div className="upload-actions" style={{ marginTop: '24px' }}>
                        <button className="btn btn-primary upload-btn" onClick={() => {
                            setMode('upload')
                            speak(t(langRef.current, 'assignmentUpload'), langRef.current, speedRef.current)
                            setTimeout(() => fileInputRef.current?.click(), 800)
                        }} disabled={loading}>
                            📄 Upload Assignment
                        </button>
                        <button className="btn btn-outline upload-btn" onClick={async () => {
                            setMode('speak')
                            const L = langRef.current, S = speedRef.current
                            await speak(t(L, 'assignmentSpeak'), L, S)
                            try {
                                const text = await listen(L, 15000)
                                if (text) await processSpokenAssignment(text)
                            } catch { await speak(t(L, 'notAudible'), L, S) }
                        }} disabled={loading}>
                            🎤 Describe by Voice
                        </button>
                    </div>

                    {file && (
                        <div className="upload-drop-area" style={{ marginTop: '16px', cursor: 'default' }}>
                            <div className="upload-file-info">
                                <span className="upload-file-icon">{file.name?.endsWith('.pdf') ? '📄' : '🖼️'}</span>
                                <span className="upload-file-name">{file.name}</span>
                                <span className="upload-file-size">{(file.size / 1024).toFixed(1)} KB</span>
                            </div>
                        </div>
                    )}

                    {error && <div className="upload-error" role="alert">❌ {error}</div>}
                    {loading && <div className="upload-browse-status" role="status">⏳ Analysing assignment...</div>}

                    {result && (
                        <div className="upload-results">
                            {result.extractedText && (
                                <section className="upload-result-section">
                                    <div className="upload-result-header">
                                        <h2>📝 Assignment Content</h2>
                                    </div>
                                    <div className="upload-result-text">{result.extractedText}</div>
                                </section>
                            )}
                            {result.spokenText && (
                                <section className="upload-result-section">
                                    <div className="upload-result-header">
                                        <h2>🎤 Your Description</h2>
                                    </div>
                                    <div className="upload-result-text">{result.spokenText}</div>
                                </section>
                            )}
                            <section className="upload-result-section">
                                <div className="upload-result-header">
                                    <h2>📋 Step-by-Step Breakdown</h2>
                                    <button className="btn btn-outline btn-sm" onClick={() => readAloud(result.translatedBreakdown || result.breakdown)}>🔊 Read Aloud</button>
                                </div>
                                <div className="upload-result-text" style={{ whiteSpace: 'pre-wrap' }}>{result.translatedBreakdown || result.breakdown}</div>
                            </section>
                        </div>
                    )}

                    <div className="vdash-a11y-info" role="note" style={{ marginTop: '32px' }}>
                        <h2>How It Works</h2>
                        <ul>
                            <li>📄 Upload an assignment file (PDF or image)</li>
                            <li>🎤 Or describe it by speaking</li>
                            <li>📋 Get step-by-step instructions to complete it</li>
                            <li>🗣️ Say "dashboard" / "डैशबोर्ड" to go back</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
