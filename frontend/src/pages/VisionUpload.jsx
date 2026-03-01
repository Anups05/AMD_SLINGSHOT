import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { speak, listen, t, apiUploadFile, langNames, voiceFilePicker, getFileTypeAnnouncement, interruptibleRead, subPageCommandLoop } from '../utils/voiceSystem'

const API = 'http://localhost:5000'

export default function VisionUpload() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [lang, setLang] = useState('en')
    const [speed, setSpeed] = useState(1.0)
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')
    const [browsingStatus, setBrowsingStatus] = useState('')
    const fileInputRef = useRef(null)
    const langRef = useRef('en')
    const speedRef = useRef(1.0)
    const alive = useRef(true)

    useEffect(() => { langRef.current = lang }, [lang])
    useEffect(() => { speedRef.current = speed }, [speed])

    useEffect(() => {
        document.title = 'AccessiLearn — Upload & Read'
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

    /* ── Voice File Picker — opens system file dialog with showOpenFilePicker ── */
    const voiceUploadClick = async () => {
        setBrowsingStatus('Opening file picker...')
        const L = langRef.current, S = speedRef.current

        const selectedFile = await voiceFilePicker(L, S, speak, [
            { description: 'Images & PDFs', accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'], 'application/pdf': ['.pdf'] } }
        ])

        if (selectedFile) {
            setBrowsingStatus(`Selected: ${selectedFile.name}`)
            handleFileReady(selectedFile)
        } else {
            setBrowsingStatus('')
            // Fallback to regular picker
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
        setBrowsingStatus('')

        if (f.type?.startsWith('image') || f.name?.match(/\.(png|jpg|jpeg|webp)$/i)) {
            const reader = new FileReader()
            reader.onload = (ev) => setPreview(ev.target.result)
            reader.readAsDataURL(f)
        } else { setPreview(null) }

        const L = langRef.current, S = speedRef.current
        // Announce in user's language
        await speak(getFileTypeAnnouncement(f, L), L, S)
        await processFileDirectly(f, L, S)
    }

    const processFileDirectly = async (fileToProcess, L, S) => {
        setLoading(true)
        setError('')
        await speak(t(L, 'uploadProcessing'), L, S)
        try {
            const data = await apiUploadFile(fileToProcess, L)
            if (data.error) {
                setError(data.error)
                await speak(t(L, 'uploadError') + ' ' + data.error, L, S)
            } else {
                setResult(data)
                await speak(t(L, 'uploadDone'), L, S)
                // Interruptible reading — user can pause/stop/change speed mid-read
                const textToRead = data.translatedText || data.extractedText
                if (textToRead) {
                    await interruptibleRead(textToRead, L, S, (cmd, val) => {
                        if (cmd === 'speed') { setSpeed(val); speedRef.current = val }
                    })
                }
            }
        } catch (err) {
            setError(err.message || 'Upload failed')
            await speak(t(L, 'uploadError'), L, S)
        }
        setLoading(false)
        // After processing, start voice nav loop
        subPageCommandLoop(langRef.current, speedRef.current, navigate, alive)
    }

    const processFile = () => { if (file) processFileDirectly(file, langRef.current, speedRef.current) }

    const readAloud = async (text) => {
        if (text) {
            await interruptibleRead(text, langRef.current, speedRef.current, (cmd, val) => {
                if (cmd === 'speed') { setSpeed(val); speedRef.current = val }
            })
        }
    }

    return (
        <div className="vdash vdash--hc" aria-label="Upload and Read page">
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
                    <h1 className="upload-title">📂 Upload & Read Aloud</h1>
                    <p className="upload-subtitle">Upload an image or PDF. I'll extract, translate, and read it to you. You can say pause, stop, or continue while I'm reading.</p>

                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf" onChange={handleFileChange} />

                    <div className="upload-drop-area" onClick={() => fileInputRef.current?.click()} tabIndex={0} role="button" aria-label="Click to select a file">
                        {file ? (
                            <div className="upload-file-info">
                                <span className="upload-file-icon">{file.type === 'application/pdf' || file.name?.endsWith('.pdf') ? '📄' : '🖼️'}</span>
                                <span className="upload-file-name">{file.name}</span>
                                <span className="upload-file-size">{(file.size / 1024).toFixed(1)} KB</span>
                            </div>
                        ) : (
                            <div className="upload-placeholder">
                                <span className="upload-placeholder-icon">📁</span>
                                <span>Click here to pick a file</span>
                                <span className="upload-hint">Supports images (PNG, JPG, WEBP) and PDFs</span>
                            </div>
                        )}
                    </div>

                    {preview && <div className="upload-preview"><img src={preview} alt="File preview" /></div>}
                    {browsingStatus && <div className="upload-browse-status" role="status">🎤 {browsingStatus}</div>}

                    <div className="upload-actions">
                        <button className="btn btn-primary upload-btn" onClick={processFile} disabled={!file || loading}>
                            {loading ? '⏳ Processing...' : '🔍 Extract & Read'}
                        </button>
                        <button className="btn btn-outline upload-btn" onClick={voiceUploadClick} disabled={loading}>
                            🎤 Upload via Voice
                        </button>
                    </div>

                    {error && <div className="upload-error" role="alert">❌ {error}</div>}

                    {result && (
                        <div className="upload-results">
                            <section className="upload-result-section">
                                <div className="upload-result-header">
                                    <h2>📝 Extracted Text</h2>
                                    <button className="btn btn-outline btn-sm" onClick={() => readAloud(result.extractedText)}>🔊 Read Aloud</button>
                                </div>
                                <div className="upload-result-text">{result.extractedText}</div>
                            </section>
                            {result.translatedText && (
                                <section className="upload-result-section">
                                    <div className="upload-result-header">
                                        <h2>🌐 Translation ({langNames[lang]})</h2>
                                        <button className="btn btn-outline btn-sm" onClick={() => readAloud(result.translatedText)}>🔊 Read Aloud</button>
                                    </div>
                                    <div className="upload-result-text">{result.translatedText}</div>
                                </section>
                            )}
                            {result.fileUrl && (
                                <div className="upload-file-link">
                                    <a href={`${API}${result.fileUrl}`} target="_blank" rel="noopener noreferrer">📎 View original file</a>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="vdash-a11y-info" role="note" style={{ marginTop: '32px' }}>
                        <h2>How It Works</h2>
                        <ul>
                            <li>Upload an image or PDF file</li>
                            <li>Text will be extracted, translated, and read aloud</li>
                            <li>Say "go back" / "dashboard" to return</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
