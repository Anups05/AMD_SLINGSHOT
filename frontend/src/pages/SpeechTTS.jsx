import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const API = 'http://localhost:5000/api'
function getToken() { return localStorage.getItem('accessilearn_token') || '' }

export default function SpeechTTS() {
    const [text, setText] = useState('')
    const [rate, setRate] = useState(1.0)
    const [speaking, setSpeaking] = useState(false)
    const [lang, setLang] = useState('en')
    const [translatedText, setTranslatedText] = useState('')
    const [translating, setTranslating] = useState(false)

    useEffect(() => {
        document.title = 'AccessiLearn — Text to Speech'
        try { const u = JSON.parse(localStorage.getItem('accessilearn_user') || '{}'); setLang(u.language || 'en') } catch { }
    }, [])

    const translateAndSpeak = async () => {
        if (!text.trim()) return
        window.speechSynthesis.cancel()

        let textToRead = text
        if (lang !== 'en') {
            setTranslating(true)
            try {
                const r = await fetch(`${API}/upload/translate-text`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                    body: JSON.stringify({ text: text.trim(), targetLang: lang })
                })
                const data = await r.json()
                if (data.translated) { textToRead = data.translated; setTranslatedText(data.translated) }
            } catch { }
            setTranslating(false)
        }

        const u = new SpeechSynthesisUtterance(textToRead)
        u.rate = rate
        u.lang = lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : 'en-IN'
        const voices = window.speechSynthesis.getVoices()
        const v = voices.find(v => v.lang === u.lang) || voices.find(v => v.lang.startsWith(lang))
        if (v) u.voice = v
        u.onend = () => setSpeaking(false)
        u.onerror = () => setSpeaking(false)
        window.speechSynthesis.speak(u)
        setSpeaking(true)
    }

    const stop = () => { window.speechSynthesis.cancel(); setSpeaking(false) }

    const langNames = { en: 'English', hi: 'हिन्दी', mr: 'मराठी' }

    return (
        <div className="sdash-page">
            <header className="sdash-page-header">
                <Link to="/dashboard/speech" className="sdash-back-btn">← Back</Link>
                <h1>🔊 Text to Speech</h1>
                <span className="sdash-lang-badge">{langNames[lang]}</span>
            </header>
            <div className="sdash-page-content">
                <p className="sdash-page-desc">
                    Paste or type text below. It will be {lang !== 'en' ? `translated to ${langNames[lang]} and ` : ''}read aloud.
                </p>
                <textarea className="sdash-textarea" rows={8} value={text} onChange={e => { setText(e.target.value); setTranslatedText('') }} placeholder="Paste your text here..." />
                {translatedText && (
                    <div className="sdash-result-section" style={{ marginTop: '12px' }}>
                        <h3>Translated ({langNames[lang]})</h3>
                        <div className="sdash-result-text">{translatedText}</div>
                    </div>
                )}
                <div className="sdash-actions" style={{ marginTop: '16px' }}>
                    <button className={`btn ${speaking ? 'btn-danger' : 'btn-primary'}`} onClick={speaking ? stop : translateAndSpeak} disabled={translating || !text.trim()}>
                        {translating ? '🔄 Translating...' : speaking ? '⏹ Stop' : '🔊 Read Aloud'}
                    </button>
                    <label className="sdash-speed-label">Speed: <input type="range" min="0.5" max="2" step="0.1" value={rate} onChange={e => setRate(parseFloat(e.target.value))} /> {rate}x</label>
                </div>
            </div>
        </div>
    )
}
