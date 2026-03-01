import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { speak, listen, t, langNames, subPageCommandLoop, parseYesNo, isDone } from '../utils/voiceSystem'

const API = 'http://localhost:5000/api'

function getToken() { try { return localStorage.getItem('accessilearn_token') || '' } catch { return '' } }

export default function VisionPlanner() {
    const navigate = useNavigate()
    const [lang, setLang] = useState('en')
    const [speed, setSpeed] = useState(1.0)
    const [plan, setPlan] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const alive = useRef(true)
    const langRef = useRef('en')
    const speedRef = useRef(1.0)

    useEffect(() => { langRef.current = lang }, [lang])
    useEffect(() => { speedRef.current = speed }, [speed])

    useEffect(() => {
        document.title = 'AccessiLearn — Study Planner'
        try {
            const raw = localStorage.getItem('accessilearn_user')
            if (raw) {
                const u = JSON.parse(raw)
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
        const timer = setTimeout(() => startPlannerFlow(), 1500)
        return () => { alive.current = false; clearTimeout(timer); window.speechSynthesis?.cancel() }
    }, [])

    const startPlannerFlow = async () => {
        const L = langRef.current, S = speedRef.current
        const msgs = {
            en: 'I am here to help you plan your studies. Tell me what subjects or topics you want to study, how many questions to practice, and how much time you have. I will create a proper study plan for you.',
            hi: 'मैं यहाँ आपकी पढ़ाई की योजना बनाने में मदद करने आया हूँ। बताओ कौन से विषय या टॉपिक पढ़ने हैं, कितने प्रश्न अभ्यास करने हैं, और कितना समय है। मैं एक अच्छा स्टडी प्लान बनाऊँगा।',
            mr: 'मी तुमच्या अभ्यासाची योजना बनवायला आलोय. सांग कोणते विषय किंवा टॉपिक शिकायचे आहेत, किती प्रश्न सोडवायचे आहेत, आणि किती वेळ आहे. मी एक योग्य स्टडी प्लॅन बनवतो.'
        }
        await speak(msgs[L] || msgs.en, L, S)
        await collectStudyDetails()
    }

    const collectStudyDetails = async () => {
        const L = langRef.current, S = speedRef.current
        let details = ''

        // Listen for study details
        const prompts = {
            en: ['What subject or topic do you want to study?', 'How many questions do you want to practice?', 'How much time do you have? For example, 2 hours or 30 minutes.', 'Any specific goals or priorities? Say done if nothing else.'],
            hi: ['कौन सा विषय या टॉपिक पढ़ना है?', 'कितने प्रश्न अभ्यास करने हैं?', 'कितना समय है? जैसे 2 घंटे या 30 मिनट।', 'कोई और लक्ष्य? बस बोलो अगर कुछ नहीं।'],
            mr: ['कोणता विषय किंवा टॉपिक शिकायचा?', 'किती प्रश्न सोडवायचे?', 'किती वेळ आहे? जसे 2 तास किंवा 30 मिनिटे.', 'आणखी काही? झालं म्हणा नसेल तर.']
        }
        const pList = prompts[L] || prompts.en

        for (let i = 0; i < pList.length; i++) {
            await speak(pList[i], L, S)
            try {
                const resp = await listen(L, 15000)
                if (isDone(resp, L)) break
                details += resp + '. '
            } catch {
                // No response, continue
            }
        }

        if (details.trim().length > 5) {
            await generatePlan(details)
        } else {
            const noInput = { en: 'I did not get enough information. You can try again or say go back to return.', hi: 'पर्याप्त जानकारी नहीं मिली। फिर से कोशिश करो या वापस जाने के लिए बोलो।', mr: 'पुरेशी माहिती मिळाली नाही. पुन्हा प्रयत्न करा किंवा मागे जायला बोला.' }
            await speak(noInput[L] || noInput.en, L, S)
            subPageCommandLoop(L, S, navigate, alive)
        }
    }

    const generatePlan = async (details) => {
        const L = langRef.current, S = speedRef.current
        setLoading(true)
        setError('')
        const processingMsg = { en: 'Creating your study plan, please wait...', hi: 'स्टडी प्लान बना रहा हूँ, रुको...', mr: 'स्टडी प्लॅन बनवतोय, थांब...' }
        await speak(processingMsg[L] || processingMsg.en, L, S)

        try {
            const res = await fetch(`${API}/upload/study-plan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                body: JSON.stringify({ details, language: L })
            })
            const data = await res.json()
            if (data.error) {
                setError(data.error)
                await speak(data.error, L, S)
            } else {
                setPlan(data)
                const doneMsg = { en: 'Your study plan is ready. Let me read it to you.', hi: 'स्टडी प्लान तैयार है। पढ़ता हूँ।', mr: 'स्टडी प्लॅन तयार. वाचतो.' }
                await speak(doneMsg[L] || doneMsg.en, L, S)
                await speak(data.translatedPlan || data.plan, L, S)
            }
        } catch (err) {
            setError(err.message)
        }
        setLoading(false)
        subPageCommandLoop(langRef.current, speedRef.current, navigate, alive)
    }

    const readAloud = async (text) => { if (text) await speak(text, langRef.current, speedRef.current) }

    return (
        <div className="vdash vdash--hc" aria-label="Study Planner">
            <header className="vdash-topbar" role="banner">
                <div className="vdash-topbar-left">
                    <Link to="/dashboard/vision" className="vdash-brand"><span className="brand-icon" aria-hidden="true">←</span><span>Back to Dashboard</span></Link>
                </div>
                <div className="vdash-topbar-right">
                    <span className="vdash-lang-badge">{langNames[lang]}</span>
                    <span className="vdash-speed-badge">{speed}x</span>
                </div>
            </header>
            <div className="vdash-page-center">
                <div className="upload-page">
                    <h1 className="upload-title">📋 Study Planner</h1>
                    <p className="upload-subtitle">Tell me your subjects, topics, number of questions, and available time. I'll create a study plan for you.</p>

                    <div className="upload-actions" style={{ marginTop: '24px' }}>
                        <button className="btn btn-primary upload-btn" onClick={() => startPlannerFlow()} disabled={loading}>
                            🎤 {loading ? 'Creating Plan...' : 'Start Planning'}
                        </button>
                    </div>

                    {error && <div className="upload-error" role="alert">❌ {error}</div>}
                    {loading && <div className="upload-browse-status" role="status">⏳ Creating your study plan...</div>}

                    {plan && (
                        <div className="upload-results">
                            <section className="upload-result-section">
                                <div className="upload-result-header">
                                    <h2>📋 Your Study Plan</h2>
                                    <button className="btn btn-outline btn-sm" onClick={() => readAloud(plan.translatedPlan || plan.plan)}>🔊 Read Aloud</button>
                                </div>
                                <div className="upload-result-text" style={{ whiteSpace: 'pre-wrap' }}>{plan.translatedPlan || plan.plan}</div>
                            </section>
                        </div>
                    )}

                    <div className="vdash-a11y-info" role="note" style={{ marginTop: '32px' }}>
                        <h2>How It Works</h2>
                        <ul>
                            <li>🎤 Tell me your subjects, topics, and time available</li>
                            <li>📋 I'll create a structured study plan</li>
                            <li>🗣️ Say "go back" / "dashboard" to return</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
