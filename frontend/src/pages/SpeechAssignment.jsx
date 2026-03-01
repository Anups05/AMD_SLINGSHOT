import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
const API = 'http://localhost:5000/api'
function getToken() { return localStorage.getItem('accessilearn_token') || '' }

export default function SpeechAssignment() {
    const [mode, setMode] = useState(null); const [text, setText] = useState(''); const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false); const [result, setResult] = useState(null); const [error, setError] = useState('')
    const [lang, setLang] = useState('en'); const fileRef = useRef(null)
    useEffect(() => { document.title = 'AccessiLearn — Assignments'; try { const u = JSON.parse(localStorage.getItem('accessilearn_user') || '{}'); setLang(u.language || 'en') } catch { } }, [])

    const handleFile = async (f) => {
        setFile(f); setError(''); setResult(null); setLoading(true)
        try {
            const fd = new FormData(); fd.append('file', f); fd.append('language', lang)
            const r = await fetch(`${API}/upload/assignment`, { method: 'POST', headers: { 'Authorization': `Bearer ${getToken()}` }, body: fd })
            const data = await r.json(); if (data.error) setError(data.error); else setResult(data)
        } catch (e) { setError(e.message) }
        setLoading(false)
    }
    const submitText = async () => {
        if (!text.trim()) return; setError(''); setResult(null); setLoading(true)
        try {
            const r = await fetch(`${API}/upload/assignment-text`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` }, body: JSON.stringify({ text, language: lang }) })
            const data = await r.json(); if (data.error) setError(data.error); else setResult(data)
        } catch (e) { setError(e.message) }
        setLoading(false)
    }

    return (
        <div className="sdash-page">
            <header className="sdash-page-header"><Link to="/dashboard/speech" className="sdash-back-btn">← Back</Link><h1>📝 Assignment Breakdown</h1></header>
            <div className="sdash-page-content">
                <p className="sdash-page-desc">Upload an assignment or describe it. Get step-by-step instructions.</p>
                <input type="file" ref={fileRef} style={{ display: 'none' }} accept="image/*,application/pdf" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                <div className="sdash-actions">
                    <button className="btn btn-primary" onClick={() => { setMode('file'); fileRef.current?.click() }} disabled={loading}>📄 Upload File</button>
                    <button className="btn btn-outline" onClick={() => setMode('text')} disabled={loading}>✏️ Type It</button>
                </div>
                {mode === 'text' && (
                    <div style={{ marginTop: '16px' }}>
                        <textarea className="sdash-textarea" rows={4} value={text} onChange={e => setText(e.target.value)} placeholder="Describe your assignment..." />
                        <button className="btn btn-primary" onClick={submitText} disabled={loading || !text.trim()} style={{ marginTop: '8px' }}>{loading ? '⏳ Analysing...' : '📋 Get Breakdown'}</button>
                    </div>
                )}
                {file && <div className="sdash-file-info">📎 {file.name}</div>}
                {error && <div className="sdash-error">❌ {error}</div>}
                {loading && !result && <div className="sdash-status">⏳ Analysing assignment...</div>}
                {result && (
                    <div className="sdash-results">
                        <section className="sdash-result-section"><h2>Step-by-Step Breakdown</h2><div className="sdash-result-text" style={{ whiteSpace: 'pre-wrap' }}>{result.translatedBreakdown || result.breakdown}</div></section>
                    </div>
                )}
            </div>
        </div>
    )
}
