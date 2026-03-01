import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { langNames } from '../utils/voiceSystem'

export default function VisionSettings() {
    const [user, setUser] = useState(null)

    useEffect(() => {
        document.title = 'AccessiLearn — Settings'
        try {
            const raw = localStorage.getItem('accessilearn_user')
            if (raw) setUser(JSON.parse(raw))
        } catch { }
    }, [])

    return (
        <div className="vdash vdash--hc" aria-label="Settings page">
            <header className="vdash-topbar" role="banner">
                <div className="vdash-topbar-left">
                    <Link to="/dashboard/vision" className="vdash-brand" aria-label="Back to dashboard">
                        <span className="brand-icon" aria-hidden="true">←</span>
                        <span>Back to Dashboard</span>
                    </Link>
                </div>
            </header>

            <div className="vdash-page-center">
                <section className="vdash-panel vdash-panel--page" aria-labelledby="settings-heading">
                    <h1 id="settings-heading" className="vdash-panel-title">⚙️ Settings</h1>
                    <div className="vdash-panel-rows">
                        <div className="vdash-panel-row">
                            <span className="vdash-panel-label">Current Language</span>
                            <span className="vdash-panel-value">{langNames[user?.language] || 'English'}</span>
                        </div>
                        <div className="vdash-panel-row">
                            <span className="vdash-panel-label">Speech Speed</span>
                            <span className="vdash-panel-value">{user?.speechSpeed || 1.0}x</span>
                        </div>
                    </div>
                    <p className="vdash-panel-hint">
                        Say "increase speed" / "decrease speed" or "change language to hindi" to adjust via voice commands from the dashboard.
                    </p>
                </section>
            </div>
        </div>
    )
}
