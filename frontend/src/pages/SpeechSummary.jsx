import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

const API = 'http://localhost:5000/api'
function getToken() { return localStorage.getItem('accessilearn_token') || '' }

export default function SpeechSummary() {
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')
    const [lang, setLang] = useState('en')
    const fileRef = useRef(null)

    useEffect(() => {
        document.title = 'AccessiLearn — AI Summaries'
        try { const u = JSON.parse(localStorage.getItem('accessilearn_user') || '{}'); setLang(u.language || 'en') } catch { }
    }, [])

    const handleFile = async (f) => {
        setFile(f); setError(''); setResult(null); setLoading(true)
        try {
            const fd = new FormData(); fd.append('file', f); fd.append('language', lang)
            const r = await fetch(`${API}/upload/summarise`, { method: 'POST', headers: { 'Authorization': `Bearer ${getToken()}` }, body: fd })
            const data = await r.json()
            if (data.error) setError(data.error); else setResult(data)
        } catch (e) { setError(e.message) }
        setLoading(false)
    }

    return (
        <div className="sdash-page">
            <header className="sdash-page-header">
                <Link to="/dashboard/speech" className="sdash-back-btn">← Back</Link>
                <h1>✨ AI Summaries</h1>
            </header>
            <div className="sdash-page-content">
                <p className="sdash-page-desc">Upload a file (PDF, image, audio, video) and get a topic-based AI summary.</p>
                <input type="file" ref={fileRef} style={{ display: 'none' }} accept="image/*,application/pdf,audio/*,video/*"
                    onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                <div className="sdash-actions">
                    <button className="btn btn-primary" onClick={() => fileRef.current?.click()} disabled={loading}>
                        {loading ? '⏳ Summarising...' : '📁 Upload File'}
                    </button>
                </div>
                {file && <div className="sdash-file-info">📎 {file.name} ({(file.size / 1024).toFixed(1)} KB)</div>}
                {error && <div className="sdash-error">❌ {error}</div>}
                {result && (
                    <div className="sdash-results">
                        <section className="sdash-result-section">
                            <h2>Summary</h2>
                            <div className="sdash-result-text" style={{ whiteSpace: 'pre-wrap' }}>{result.translatedSummary || result.summary}</div>
                        </section>
                        {result.extractedText && (
                            <details className="sdash-result-section">
                                <summary><h3 style={{ display: 'inline' }}>Extracted Content</h3></summary>
                                <div className="sdash-result-text">{result.extractedText}</div>
                            </details>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
