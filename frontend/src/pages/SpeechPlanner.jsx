import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
const API = 'http://localhost:5000/api'
function getToken() { return localStorage.getItem('accessilearn_token') || '' }

export default function SpeechPlanner() {
    const [details, setDetails] = useState(''); const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null); const [error, setError] = useState(''); const [lang, setLang] = useState('en')
    useEffect(() => { document.title = 'AccessiLearn — Study Planner'; try { const u = JSON.parse(localStorage.getItem('accessilearn_user') || '{}'); setLang(u.language || 'en') } catch { } }, [])

    const createPlan = async () => {
        if (!details.trim()) return; setError(''); setResult(null); setLoading(true)
        try {
            const r = await fetch(`${API}/upload/study-plan`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` }, body: JSON.stringify({ details, language: lang }) })
            const data = await r.json(); if (data.error) setError(data.error); else setResult(data)
        } catch (e) { setError(e.message) }
        setLoading(false)
    }

    return (
        <div className="sdash-page">
            <header className="sdash-page-header"><Link to="/dashboard/speech" className="sdash-back-btn">← Back</Link><h1>📋 Study Planner</h1></header>
            <div className="sdash-page-content">
                <p className="sdash-page-desc">Tell me your subjects, topics, number of questions, and time available. I'll create a structured study plan.</p>
                <textarea className="sdash-textarea" rows={5} value={details} onChange={e => setDetails(e.target.value)} placeholder="Example: I need to study Math (algebra + geometry), 20 questions each, and I have 3 hours. Also need to revise Science." />
                <div className="sdash-actions">
                    <button className="btn btn-primary" onClick={createPlan} disabled={loading || !details.trim()}>{loading ? '⏳ Creating Plan...' : '📋 Create Study Plan'}</button>
                </div>
                {error && <div className="sdash-error">❌ {error}</div>}
                {result && (
                    <div className="sdash-results">
                        <section className="sdash-result-section"><h2>Your Study Plan</h2><div className="sdash-result-text" style={{ whiteSpace: 'pre-wrap' }}>{result.translatedPlan || result.plan}</div></section>
                    </div>
                )}
            </div>
        </div>
    )
}
