import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'

const API = 'http://localhost:5000/api'
function getToken() { return localStorage.getItem('accessilearn_token') || '' }

export default function SpeechCaptions() {
    const [captions, setCaptions] = useState([])
    const [interim, setInterim] = useState('')
    const [listening, setListening] = useState(false)
    const [lang, setLang] = useState('en')
    const recogRef = useRef(null)
    const scrollRef = useRef(null)
    const listeningRef = useRef(false)

    useEffect(() => {
        document.title = 'AccessiLearn — Live Captions'
        try { const u = JSON.parse(localStorage.getItem('accessilearn_user') || '{}'); setLang(u.language || 'en') } catch { }
    }, [])

    useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight) }, [captions, interim])

    // Translate in background — updates the caption after translation completes
    const translateInBackground = useCallback((captionId, originalText) => {
        if (lang === 'en') return
        fetch(`${API}/upload/translate-text`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify({ text: originalText, targetLang: lang })
        }).then(r => r.json()).then(data => {
            if (data.translated) {
                setCaptions(prev => prev.map(c => c.id === captionId ? { ...c, translated: data.translated } : c))
            }
        }).catch(() => { })
    }, [lang])

    const startListening = () => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SR) {
            setCaptions([{ id: Date.now(), text: 'Speech recognition not supported in this browser.', time: new Date(), final: true }])
            return
        }
        const r = new SR()
        r.lang = 'en-IN'
        r.interimResults = true
        r.continuous = true
        r.maxAlternatives = 1

        r.onresult = (e) => {
            let interimText = ''
            for (let i = e.resultIndex; i < e.results.length; i++) {
                const transcript = e.results[i][0].transcript
                if (e.results[i].isFinal) {
                    const id = Date.now() + Math.random()
                    setCaptions(prev => [...prev, { id, text: transcript, time: new Date(), final: true }])
                    setInterim('')
                    translateInBackground(id, transcript)
                } else {
                    interimText += transcript
                }
            }
            if (interimText) setInterim(interimText)
        }

        r.onerror = (e) => {
            console.log('Speech error:', e.error)
            if (e.error !== 'no-speech' && e.error !== 'aborted') {
                setListening(false)
                listeningRef.current = false
            }
        }

        r.onend = () => {
            // Auto-restart if still supposed to be listening
            if (listeningRef.current) {
                try { r.start() } catch { }
            }
        }

        try {
            r.start()
            recogRef.current = r
            listeningRef.current = true
            setListening(true)
        } catch (err) {
            console.error('Failed to start recognition:', err)
        }
    }

    const stopListening = () => {
        listeningRef.current = false
        setListening(false)
        setInterim('')
        if (recogRef.current) {
            try { recogRef.current.stop() } catch { }
            recogRef.current = null
        }
    }

    const downloadCaptions = () => {
        const lines = captions.filter(c => c.final).map(c => {
            const time = c.time.toLocaleTimeString()
            const main = c.translated || c.text
            const orig = c.translated ? ` [Original: ${c.text}]` : ''
            return `[${time}] ${main}${orig}`
        }).join('\n')
        const blob = new Blob([lines], { type: 'text/plain' })
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `captions_${Date.now()}.txt`; a.click()
    }

    const clearAll = () => { setCaptions([]); setInterim('') }

    const langNames = { en: 'English', hi: 'हिन्दी', mr: 'मराठी' }

    return (
        <div className="sdash-page">
            <header className="sdash-page-header">
                <Link to="/dashboard/speech" className="sdash-back-btn">← Back</Link>
                <h1>🎤 Live Captions</h1>
                <span className="sdash-lang-badge">{langNames[lang]}</span>
            </header>
            <div className="sdash-page-content">
                <p className="sdash-page-desc">
                    Real-time speech-to-text. Speak and see captions instantly.
                    {lang !== 'en' ? ` Translations to ${langNames[lang]} appear automatically.` : ''}
                </p>
                <div className="sdash-actions">
                    <button className={`btn ${listening ? 'btn-danger' : 'btn-primary'}`} onClick={listening ? stopListening : startListening}>
                        {listening ? '⏹ Stop Listening' : '🎤 Start Listening'}
                    </button>
                    {captions.length > 0 && !listening && (
                        <button className="btn btn-outline" onClick={downloadCaptions}>📥 Download .txt</button>
                    )}
                    {captions.length > 0 && <button className="btn btn-outline" onClick={clearAll}>🗑 Clear</button>}
                </div>
                {listening && <div className="sdash-status pulse">🔴 Listening... speak now</div>}
                <div className="sdash-captions-box" ref={scrollRef}>
                    {captions.length === 0 && !interim && <p className="sdash-empty">Captions will appear here as you speak...</p>}
                    {captions.map(c => (
                        <div key={c.id} className="sdash-caption-line">
                            <span className="sdash-caption-time">{c.time.toLocaleTimeString()}</span>
                            <span>{c.translated || c.text}</span>
                        </div>
                    ))}
                    {interim && (
                        <div className="sdash-caption-line interim">
                            <span className="sdash-caption-time">...</span>
                            <span>{interim}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
