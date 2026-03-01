import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

const API = 'http://localhost:5000/api'
function getToken() { return localStorage.getItem('accessilearn_token') || '' }

export default function SpeechChat() {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [lang, setLang] = useState('en')
    const [attachedFile, setAttachedFile] = useState(null)
    const [fileContext, setFileContext] = useState(null)
    const scrollRef = useRef(null)
    const fileRef = useRef(null)

    useEffect(() => {
        document.title = 'AccessiLearn — Chat Assistant'
        try { const u = JSON.parse(localStorage.getItem('accessilearn_user') || '{}'); setLang(u.language || 'en') } catch { }
    }, [])

    useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight) }, [messages])

    const sendMessage = async () => {
        if (!input.trim() || loading) return
        const userMsg = { role: 'user', content: input.trim() }
        setMessages(m => [...m, userMsg])
        const question = input.trim()
        setInput('')
        setLoading(true)

        try {
            if (attachedFile && !fileContext) {
                // First message with file — upload and ask
                const fd = new FormData()
                fd.append('file', attachedFile)
                fd.append('question', question)
                fd.append('language', lang)
                const r = await fetch(`${API}/upload/chat-file`, {
                    method: 'POST', headers: { 'Authorization': `Bearer ${getToken()}` }, body: fd
                })
                const data = await r.json()
                if (data.reply) {
                    setMessages(m => [...m, { role: 'assistant', content: data.reply }])
                    setFileContext(data.extractedText)
                } else {
                    setMessages(m => [...m, { role: 'assistant', content: 'Sorry, I could not process that file.' }])
                }
            } else {
                // Regular chat or follow-up with file context
                const r = await fetch(`${API}/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                    body: JSON.stringify({
                        message: fileContext ? `[File context: ${fileContext}]\n\nQuestion: ${question}` : question,
                        history: messages.slice(-10),
                        language: lang
                    })
                })
                const data = await r.json()
                if (data.reply) setMessages(m => [...m, { role: 'assistant', content: data.reply }])
                else setMessages(m => [...m, { role: 'assistant', content: 'Sorry, I could not process that.' }])
            }
        } catch { setMessages(m => [...m, { role: 'assistant', content: 'Connection error. Please try again.' }]) }
        setLoading(false)
    }

    const handleFileAttach = (e) => {
        const f = e.target.files?.[0]
        if (f) { setAttachedFile(f); setFileContext(null) }
    }

    const removeFile = () => { setAttachedFile(null); setFileContext(null) }

    return (
        <div className="sdash-page">
            <header className="sdash-page-header">
                <Link to="/dashboard/speech" className="sdash-back-btn">← Back</Link>
                <h1>💬 Chat Assistant</h1>
            </header>
            <div className="sdash-page-content sdash-chat-layout">
                <div className="sdash-chat-messages" ref={scrollRef}>
                    {messages.length === 0 && <p className="sdash-empty">Ask me anything about your studies! Attach a file 📎 to ask questions about it.</p>}
                    {messages.map((m, i) => (
                        <div key={i} className={`sdash-chat-msg ${m.role}`}>
                            <div className="sdash-chat-bubble">
                                <span className="sdash-chat-role">{m.role === 'user' ? 'You' : 'AI'}</span>
                                <p style={{ whiteSpace: 'pre-wrap' }}>{m.content}</p>
                            </div>
                        </div>
                    ))}
                    {loading && <div className="sdash-chat-msg assistant"><div className="sdash-chat-bubble"><span className="sdash-typing">Thinking...</span></div></div>}
                </div>

                {attachedFile && (
                    <div className="sdash-file-info" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        📎 {attachedFile.name}
                        <button onClick={removeFile} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                    </div>
                )}

                <input type="file" ref={fileRef} style={{ display: 'none' }} accept="application/pdf,image/*,audio/*" onChange={handleFileAttach} />

                <form className="sdash-chat-input" onSubmit={e => { e.preventDefault(); sendMessage() }}>
                    <button type="button" className="sdash-attach-btn" onClick={() => fileRef.current?.click()} title="Attach file">📎</button>
                    <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Type your question..." disabled={loading} autoFocus />
                    <button type="submit" className="btn btn-primary" disabled={!input.trim() || loading}>Send</button>
                </form>
            </div>
        </div>
    )
}
