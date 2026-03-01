import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

const API = 'http://localhost:5000/api'
function getToken() { return localStorage.getItem('accessilearn_token') || '' }

export default function SpeechTranscript() {
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')
    const [lang, setLang] = useState('en')
    const fileRef = useRef(null)

    useEffect(() => {
        document.title = 'AccessiLearn — Transcripts'
        try { const u = JSON.parse(localStorage.getItem('accessilearn_user') || '{}'); setLang(u.language || 'en') } catch { }
    }, [])

    const handleFile = async (f) => {
        setFile(f); setError(''); setResult(null); setLoading(true)
        try {
            const fd = new FormData(); fd.append('file', f); fd.append('language', lang)
            const r = await fetch(`${API}/upload/transcript`, {
                method: 'POST', headers: { 'Authorization': `Bearer ${getToken()}` }, body: fd
            })
            const data = await r.json()
            if (data.error) setError(data.error)
            else setResult(data)
        } catch (e) { setError(e.message) }
        setLoading(false)
    }

    const downloadTranscript = () => {
        if (!result) return
        const text = result.translatedTranscript || result.transcript
        const blob = new Blob([text], { type: 'text/plain' })
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `transcript_${Date.now()}.txt`; a.click()
    }

    const langNames = { en: 'English', hi: 'हिन्दी', mr: 'मराठी' }

    return (
        <div className="sdash-page">
            <header className="sdash-page-header">
                <Link to="/dashboard/speech" className="sdash-back-btn">← Back</Link>
                <h1>📑 Transcript Generator</h1>
            </header>
            <div className="sdash-page-content">
                <p className="sdash-page-desc">Upload an audio file (.mp3, .wav, .ogg, .m4a) and get a full transcript. Download as a .txt file.</p>
                <input type="file" ref={fileRef} style={{ display: 'none' }} accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac,.aac" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                <div className="sdash-actions">
                    <button className="btn btn-primary" onClick={() => fileRef.current?.click()} disabled={loading}>
                        {loading ? '⏳ Transcribing...' : '🎵 Upload Audio File'}
                    </button>
                    {result && <button className="btn btn-outline" onClick={downloadTranscript}>📥 Download .txt</button>}
                </div>
                {file && <div className="sdash-file-info">🎵 {file.name} ({(file.size / 1024).toFixed(1)} KB)</div>}
                {error && <div className="sdash-error">❌ {error}</div>}
                {loading && <div className="sdash-status pulse">🔄 Transcribing audio with AI... This may take a moment.</div>}
                {result && (
                    <div className="sdash-results">
                        <section className="sdash-result-section">
                            <h2>Transcript {lang !== 'en' ? `(${langNames[lang]})` : ''}</h2>
                            <div className="sdash-result-text" style={{ whiteSpace: 'pre-wrap' }}>{result.translatedTranscript || result.transcript}</div>
                        </section>
                        {result.translatedTranscript && (
                            <details className="sdash-result-section">
                                <summary><h3 style={{ display: 'inline' }}>Original (English)</h3></summary>
                                <div className="sdash-result-text">{result.transcript}</div>
                            </details>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
