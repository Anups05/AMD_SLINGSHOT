import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { speak, t, langNames, voiceFilePicker, getFileTypeAnnouncement, interruptibleRead, apiSummariseFile, subPageCommandLoop } from '../utils/voiceSystem'

const API = 'http://localhost:5000'

export default function VisionSummarise() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [lang, setLang] = useState('en')
    const [speed, setSpeed] = useState(1.0)
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')
    const fileInputRef = useRef(null)
    const langRef = useRef('en')
    const speedRef = useRef(1.0)
    const alive = useRef(true)

    useEffect(() => { langRef.current = lang }, [lang])
    useEffect(() => { speedRef.current = speed }, [speed])

    useEffect(() => {
        document.title = 'AccessiLearn — Summarise'
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
            window.speechSynthesis.getVoices()
            window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices()
        }
        alive.current = true
        return () => { alive.current = false; window.speechSynthesis?.cancel() }
    }, [])

    const voiceUploadClick = async () => {
        const L = langRef.current, S = speedRef.current
        const selectedFile = await voiceFilePicker(L, S, speak, [
            {
                description: 'All Supported Files', accept: {
                    'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
                    'application/pdf': ['.pdf'],
                    'audio/*': ['.mp3', '.wav', '.ogg', '.m4a'],
                    'video/*': ['.mp4', '.webm', '.avi', '.mkv'],
                }
            }
        ])
        if (selectedFile) { handleFileReady(selectedFile) }
        else {
            await speak(t(L, 'uploadGranted'), L, S)
            setTimeout(() => fileInputRef.current?.click(), 300)
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
        if (f.type?.startsWith('image') || f.name?.match(/\.(png|jpg|jpeg|webp)$/i)) {
            const reader = new FileReader()
            reader.onload = (ev) => setPreview(ev.target.result)
            reader.readAsDataURL(f)
        } else { setPreview(null) }

        const L = langRef.current, S = speedRef.current
        await speak(getFileTypeAnnouncement(f, L), L, S)
        await processFile(f, L, S)
    }

    const processFile = async (fileToProcess, L, S) => {
        setLoading(true)
        setError('')
        await speak(t(L, 'summariseProcessing'), L, S)
        try {
            const data = await apiSummariseFile(fileToProcess, L)
            if (data.error) {
                setError(data.error)
                await speak(t(L, 'summariseError') + ' ' + data.error, L, S)
            } else {
                setResult(data)
                await speak(t(L, 'summariseDone'), L, S)
                const textToRead = data.translatedSummary || data.summary
                if (textToRead) {
                    await interruptibleRead(textToRead, L, S, (cmd, val) => {
                        if (cmd === 'speed') { setSpeed(val); speedRef.current = val }
                    })
                }
            }
        } catch (err) {
            setError(err.message || 'Summarisation failed')
            await speak(t(L, 'summariseError'), L, S)
        }
        setLoading(false)
        subPageCommandLoop(langRef.current, speedRef.current, navigate, alive)
    }

    const readAloud = async (text) => {
        if (text) await interruptibleRead(text, langRef.current, speedRef.current, (cmd, val) => {
            if (cmd === 'speed') { setSpeed(val); speedRef.current = val }
        })
    }

    const getFileIcon = () => {
        if (!file) return '📁'
        const name = file.name?.toLowerCase() || ''
        if (name.match(/\.(mp3|wav|ogg|m4a)$/)) return '🎵'
        if (name.match(/\.(mp4|webm|avi|mkv|mov)$/)) return '🎬'
        if (name.endsWith('.pdf')) return '📄'
        return '🖼️'
    }

    return (
        <div className="vdash vdash--hc" aria-label="Summarise page">
            <header className="vdash-topbar" role="banner">
                <div className="vdash-topbar-left">
                    <Link to="/dashboard/vision" className="vdash-brand" aria-label="Back to dashboard">
                        <span className="brand-icon" aria-hidden="true">←</span>
                        <span>Back to Dashboard</span>
                    </Link>
                </div>
                <div className="vdash-topbar-right">
                    <span className="vdash-lang-badge">{langNames[lang]}</span>
                    <span className="vdash-speed-badge">{speed}x</span>
                </div>
            </header>

            <div className="vdash-page-center">
                <div className="upload-page">
                    <h1 className="upload-title">✨ Summarise</h1>
                    <p className="upload-subtitle">Upload an image, PDF, audio, or video. I'll create a brief summary and read it to you.</p>

                    <input type="file" ref={fileInputRef} style={{ display: 'none' }}
                        accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf,audio/*,video/*"
                        onChange={handleFileChange} />

                    <div className="upload-drop-area" onClick={() => fileInputRef.current?.click()} tabIndex={0} role="button" aria-label="Click to select a file">
                        {file ? (
                            <div className="upload-file-info">
                                <span className="upload-file-icon">{getFileIcon()}</span>
                                <span className="upload-file-name">{file.name}</span>
                                <span className="upload-file-size">{(file.size / 1024).toFixed(1)} KB</span>
                            </div>
                        ) : (
                            <div className="upload-placeholder">
                                <span className="upload-placeholder-icon">✨</span>
                                <span>Click here to pick a file</span>
                                <span className="upload-hint">Images, PDFs, Audio, and Video supported</span>
                            </div>
                        )}
                    </div>

                    {preview && <div className="upload-preview"><img src={preview} alt="File preview" /></div>}

                    <div className="upload-actions">
                        <button className="btn btn-primary upload-btn" onClick={() => file && processFile(file, langRef.current, speedRef.current)} disabled={!file || loading}>
                            {loading ? '⏳ Summarising...' : '✨ Summarise'}
                        </button>
                        <button className="btn btn-outline upload-btn" onClick={voiceUploadClick} disabled={loading}>
                            🎤 Upload via Voice
                        </button>
                    </div>

                    {error && <div className="upload-error" role="alert">❌ {error}</div>}

                    {result && (
                        <div className="upload-results">
                            {result.extractedText && (
                                <section className="upload-result-section">
                                    <div className="upload-result-header">
                                        <h2>📝 Extracted Content</h2>
                                        <button className="btn btn-outline btn-sm" onClick={() => readAloud(result.extractedText)}>🔊 Read</button>
                                    </div>
                                    <div className="upload-result-text">{result.extractedText}</div>
                                </section>
                            )}
                            <section className="upload-result-section">
                                <div className="upload-result-header">
                                    <h2>✨ Summary</h2>
                                    <button className="btn btn-outline btn-sm" onClick={() => readAloud(result.summary)}>🔊 Read Summary</button>
                                </div>
                                <div className="upload-result-text">{result.summary}</div>
                            </section>
                            {result.translatedSummary && (
                                <section className="upload-result-section">
                                    <div className="upload-result-header">
                                        <h2>🌐 Translated Summary ({langNames[lang]})</h2>
                                        <button className="btn btn-outline btn-sm" onClick={() => readAloud(result.translatedSummary)}>🔊 Read</button>
                                    </div>
                                    <div className="upload-result-text">{result.translatedSummary}</div>
                                </section>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
