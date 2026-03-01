import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const API = 'http://localhost:5000/api'
function getToken() { return localStorage.getItem('accessilearn_token') || '' }

const questions = [
    { id: 1, text: 'How confident do you feel about today\'s study material?', options: ['Not at all', 'Slightly', 'Moderately', 'Very', 'Extremely'] },
    { id: 2, text: 'How well do you understand the last topic you studied?', options: ['Didn\'t understand', 'Partially', 'Mostly', 'Fully', 'Can teach it'] },
    { id: 3, text: 'How motivated are you to study right now?', options: ['Not motivated', 'A little', 'Somewhat', 'Motivated', 'Very motivated'] },
    { id: 4, text: 'How would you rate your focus level today?', options: ['Very distracted', 'Distracted', 'Okay', 'Focused', 'Laser focused'] },
    { id: 5, text: 'How well did you sleep last night?', options: ['Barely slept', 'Poorly', 'Okay', 'Well', 'Great'] },
]

export default function SpeechCheckin() {
    const [answers, setAnswers] = useState({})
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [suggestion, setSuggestion] = useState('')
    const [score, setScore] = useState(0)
    const [history, setHistory] = useState([])
    const [todayDone, setTodayDone] = useState(false)

    useEffect(() => {
        document.title = 'AccessiLearn — Confidence Check'
        checkToday()
        fetchHistory()
    }, [])

    const checkToday = async () => {
        try {
            const r = await fetch(`${API}/checkins/today`, { headers: { 'Authorization': `Bearer ${getToken()}` } })
            const data = await r.json()
            if (data.checkin) {
                setTodayDone(true)
                setSubmitted(true)
                setScore(data.checkin.score)
                setSuggestion(data.checkin.suggestion || '')
                try { setAnswers(JSON.parse(data.checkin.answers)) } catch { }
            }
        } catch { }
    }

    const fetchHistory = async () => {
        try {
            const r = await fetch(`${API}/checkins/history`, { headers: { 'Authorization': `Bearer ${getToken()}` } })
            const data = await r.json()
            if (data.checkins) setHistory(data.checkins)
        } catch { }
    }

    const handleAnswer = (qId, idx) => { setAnswers(a => ({ ...a, [qId]: idx })) }

    const submit = async () => {
        const total = Object.values(answers).reduce((s, v) => s + v, 0)
        const maxScore = questions.length * 4
        const percentage = Math.round((total / maxScore) * 100)
        setScore(percentage)
        setLoading(true)

        try {
            const r = await fetch(`${API}/checkins`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                body: JSON.stringify({ answers, score: percentage })
            })
            const data = await r.json()
            if (data.suggestion) setSuggestion(data.suggestion)
            setSubmitted(true)
            setTodayDone(true)
            fetchHistory()
        } catch (e) {
            setSuggestion('Could not get AI suggestions right now. Your check-in has been saved locally.')
            setSubmitted(true)
        }
        setLoading(false)
    }

    const allAnswered = Object.keys(answers).length === questions.length

    const getScoreColor = (s) => {
        if (s >= 80) return '#10b981'
        if (s >= 60) return '#3b82f6'
        if (s >= 40) return '#f59e0b'
        return '#ef4444'
    }

    const getScoreEmoji = (s) => {
        if (s >= 80) return '🌟'
        if (s >= 60) return '👍'
        if (s >= 40) return '💪'
        return '🤗'
    }

    const reset = () => { setAnswers({}); setSubmitted(false); setSuggestion(''); setScore(0); setTodayDone(false) }

    return (
        <div className="sdash-page">
            <header className="sdash-page-header">
                <Link to="/dashboard/speech" className="sdash-back-btn">← Back</Link>
                <h1>🧠 Confidence Check-In</h1>
            </header>
            <div className="sdash-page-content">
                {!submitted ? (<>
                    <p className="sdash-page-desc">Quick daily self-assessment. Answer honestly — AI will give you personalized tips to improve!</p>
                    {questions.map(q => (
                        <div key={q.id} className="sdash-checkin-question">
                            <h3>{q.id}. {q.text}</h3>
                            <div className="sdash-checkin-options">
                                {q.options.map((opt, idx) => (
                                    <button key={idx} className={`sdash-checkin-opt${answers[q.id] === idx ? ' active' : ''}`} onClick={() => handleAnswer(q.id, idx)}>{opt}</button>
                                ))}
                            </div>
                        </div>
                    ))}
                    <button className="btn btn-primary" onClick={submit} disabled={!allAnswered || loading} style={{ marginTop: '16px' }}>
                        {loading ? '🔄 Getting AI Suggestions...' : 'Submit Check-In'}
                    </button>
                </>) : (<>
                    <div className="sdash-checkin-result" style={{ borderColor: getScoreColor(score) }}>
                        <span className="sdash-checkin-emoji">{getScoreEmoji(score)}</span>
                        <h2 style={{ color: getScoreColor(score) }}>Your Score: {score}%</h2>
                    </div>

                    {suggestion && (
                        <div className="sdash-result-section" style={{ marginTop: '20px' }}>
                            <h2>🤖 AI Suggestions for You</h2>
                            <div className="sdash-result-text" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7' }}>{suggestion}</div>
                        </div>
                    )}

                    {!todayDone && (
                        <button className="btn btn-outline" onClick={reset} style={{ marginTop: '16px' }}>Take Again</button>
                    )}

                    {history.length > 0 && (
                        <div className="sdash-result-section" style={{ marginTop: '24px' }}>
                            <h3>📊 Your History (Last {Math.min(history.length, 7)} Days)</h3>
                            <div className="sdash-checkin-chart">
                                {history.slice(0, 7).reverse().map((h, i) => (
                                    <div key={i} className="sdash-checkin-bar-wrap">
                                        <div className="sdash-checkin-bar" style={{ height: `${h.score}%`, background: getScoreColor(h.score) }} />
                                        <span className="sdash-checkin-bar-label">{h.score}%</span>
                                        <span className="sdash-checkin-bar-date">{new Date(h.date).toLocaleDateString('en', { weekday: 'short' })}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>)}
            </div>
        </div>
    )
}
