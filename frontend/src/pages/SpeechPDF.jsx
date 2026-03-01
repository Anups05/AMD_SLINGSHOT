import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
const API = 'http://localhost:5000/api'
function getToken() { return localStorage.getItem('accessilearn_token') || '' }

export default function SpeechPDF() {
    const [text, setText] = useState('')
    const [highlights, setHighlights] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [file, setFile] = useState(null)
    const [search, setSearch] = useState('')
    const fileRef = useRef(null)

    useEffect(() => { document.title = 'AccessiLearn — PDF Reader' }, [])

    const handleFile = async (f) => {
        setFile(f); setError(''); setText(''); setHighlights([]); setLoading(true)
        try {
            const fd = new FormData(); fd.append('file', f)
            const r = await fetch(`${API}/upload/pdf-highlight`, {
                method: 'POST', headers: { 'Authorization': `Bearer ${getToken()}` }, body: fd
            })
            const data = await r.json()
            if (data.error) setError(data.error)
            else { setText(data.extractedText || ''); setHighlights(data.highlights || []) }
        } catch (e) { setError(e.message) }
        setLoading(false)
    }

    const renderHighlighted = () => {
        if (!text) return null
        let result = text

        // Build a list of all highlights including search
        const allHighlights = [...highlights]
        if (search.trim()) allHighlights.push(search.trim())

        // Split by highlighted phrases and render
        const parts = []
        let remaining = result

        // Simple approach: check each character range
        const lowerText = remaining.toLowerCase()
        const ranges = []

        for (const h of allHighlights) {
            const lowerH = h.toLowerCase()
            let idx = 0
            while ((idx = lowerText.indexOf(lowerH, idx)) !== -1) {
                ranges.push({ start: idx, end: idx + h.length, isSearch: h === search.trim() })
                idx += h.length
            }
        }

        ranges.sort((a, b) => a.start - b.start)

        // Merge overlapping
        const merged = []
        for (const r of ranges) {
            if (merged.length && r.start <= merged[merged.length - 1].end) {
                merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, r.end)
                merged[merged.length - 1].isSearch = merged[merged.length - 1].isSearch || r.isSearch
            } else merged.push({ ...r })
        }

        let lastEnd = 0
        for (const m of merged) {
            if (m.start > lastEnd) parts.push(<span key={`t${lastEnd}`}>{remaining.slice(lastEnd, m.start)}</span>)
            parts.push(<mark key={`h${m.start}`} className={m.isSearch ? 'search-mark' : 'ai-mark'}>{remaining.slice(m.start, m.end)}</mark>)
            lastEnd = m.end
        }
        if (lastEnd < remaining.length) parts.push(<span key="end">{remaining.slice(lastEnd)}</span>)

        return parts
    }

    return (
        <div className="sdash-page">
            <header className="sdash-page-header">
                <Link to="/dashboard/speech" className="sdash-back-btn">← Back</Link>
                <h1>📄 PDF Reader</h1>
            </header>
            <div className="sdash-page-content">
                <p className="sdash-page-desc">Upload a PDF or image. Text is extracted and main points are automatically highlighted by AI.</p>
                <input type="file" ref={fileRef} style={{ display: 'none' }} accept="application/pdf,image/*" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                <div className="sdash-actions">
                    <button className="btn btn-primary" onClick={() => fileRef.current?.click()} disabled={loading}>
                        {loading ? '⏳ Processing...' : '📁 Upload PDF / Image'}
                    </button>
                </div>
                {file && <div className="sdash-file-info">📎 {file.name}</div>}
                {error && <div className="sdash-error">❌ {error}</div>}
                {loading && <div className="sdash-status pulse">🔄 Extracting text and identifying main points...</div>}
                {text && (<>
                    <div className="sdash-search-bar">
                        <input type="text" placeholder="Search text..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    {highlights.length > 0 && (
                        <div className="sdash-highlight-legend">
                            <span><mark className="ai-mark">AI Main Points</mark></span>
                            {search && <span><mark className="search-mark">Search Match</mark></span>}
                        </div>
                    )}
                    <div className="sdash-result-section">
                        <div className="sdash-result-text sdash-pdf-text">{renderHighlighted()}</div>
                    </div>
                </>)}
            </div>
        </div>
    )
}
