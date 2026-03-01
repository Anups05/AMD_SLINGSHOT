import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { langNames, speak, subPageCommandLoop } from '../utils/voiceSystem'

const API = 'http://localhost:5000/api'
function getToken() { return localStorage.getItem('accessilearn_token') || '' }

export default function VisionProfile() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [name, setName] = useState('')
    const [lang, setLang] = useState('en')
    const [oldPw, setOldPw] = useState('')
    const [newPw, setNewPw] = useState('')
    const [confirmPw, setConfirmPw] = useState('')
    const [msg, setMsg] = useState('')
    const [pwMsg, setPwMsg] = useState('')
    const [saving, setSaving] = useState(false)
    const alive = useRef(true)

    useEffect(() => {
        document.title = 'AccessiLearn — Profile'
        try {
            const u = JSON.parse(localStorage.getItem('accessilearn_user') || '{}')
            setUser(u); setName(u.name || ''); setLang(u.language || 'en')
        } catch { }
        alive.current = true
        return () => { alive.current = false; window.speechSynthesis?.cancel() }
    }, [])

    const saveProfile = async () => {
        setSaving(true); setMsg('')
        try {
            const r = await fetch(`${API}/auth/profile`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                body: JSON.stringify({ name, language: lang })
            })
            const data = await r.json()
            if (data.error) setMsg('❌ ' + data.error)
            else { setUser(data.user); localStorage.setItem('accessilearn_user', JSON.stringify(data.user)); setMsg('✅ Profile updated!') }
        } catch (e) { setMsg('❌ ' + e.message) }
        setSaving(false)
    }

    const changePassword = async () => {
        setPwMsg('')
        if (newPw !== confirmPw) { setPwMsg('❌ New passwords do not match'); return }
        try {
            const r = await fetch(`${API}/auth/password`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                body: JSON.stringify({ oldPassword: oldPw, newPassword: newPw })
            })
            const data = await r.json()
            if (data.error) setPwMsg('❌ ' + data.error)
            else { setPwMsg('✅ ' + data.message); setOldPw(''); setNewPw(''); setConfirmPw('') }
        } catch (e) { setPwMsg('❌ ' + e.message) }
    }

    return (
        <div className="vdash vdash--hc" aria-label="Profile page">
            <header className="vdash-topbar" role="banner">
                <div className="vdash-topbar-left">
                    <Link to="/dashboard/vision" className="vdash-brand" aria-label="Back to dashboard">
                        <span className="brand-icon" aria-hidden="true">←</span>
                        <span>Back to Dashboard</span>
                    </Link>
                </div>
            </header>

            <div className="vdash-page-center">
                <section className="vdash-panel vdash-panel--page" aria-labelledby="profile-heading">
                    <h1 id="profile-heading" className="vdash-panel-title">👤 Edit Profile</h1>
                    <div className="vdash-panel-rows">
                        <div className="vdash-panel-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                            <label className="vdash-panel-label" style={{ marginBottom: '4px' }}>Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)}
                                style={{ background: '#111', color: '#fff', border: '1px solid #333', padding: '10px 14px', borderRadius: '8px', fontSize: '1rem', width: '100%' }} />
                        </div>
                        <div className="vdash-panel-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                            <label className="vdash-panel-label" style={{ marginBottom: '4px' }}>Email <span style={{ color: '#666', fontSize: '0.85rem' }}>(cannot be changed)</span></label>
                            <input type="email" value={user?.email || ''} disabled
                                style={{ background: '#111', color: '#888', border: '1px solid #222', padding: '10px 14px', borderRadius: '8px', fontSize: '1rem', width: '100%' }} />
                        </div>
                        <div className="vdash-panel-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                            <label className="vdash-panel-label" style={{ marginBottom: '4px' }}>Preferred Language</label>
                            <select value={lang} onChange={e => setLang(e.target.value)}
                                style={{ background: '#111', color: '#fff', border: '1px solid #333', padding: '10px 14px', borderRadius: '8px', fontSize: '1rem', width: '100%' }}>
                                <option value="en">English</option>
                                <option value="hi">हिन्दी</option>
                                <option value="mr">मराठी</option>
                            </select>
                        </div>
                        <button className="btn btn-primary" onClick={saveProfile} disabled={saving} style={{ marginTop: '8px', width: '100%' }}>
                            {saving ? 'Saving...' : '💾 Save Profile'}
                        </button>
                        {msg && <div style={{ marginTop: '8px', padding: '8px 12px', borderRadius: '8px', fontSize: '0.9rem' }}>{msg}</div>}
                    </div>
                </section>

                <section className="vdash-panel vdash-panel--page" style={{ marginTop: '24px' }}>
                    <h2 className="vdash-panel-title">🔒 Change Password</h2>
                    <div className="vdash-panel-rows">
                        <div className="vdash-panel-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                            <label className="vdash-panel-label" style={{ marginBottom: '4px' }}>Current Password</label>
                            <input type="password" value={oldPw} onChange={e => setOldPw(e.target.value)}
                                style={{ background: '#111', color: '#fff', border: '1px solid #333', padding: '10px 14px', borderRadius: '8px', fontSize: '1rem', width: '100%' }} />
                        </div>
                        <div className="vdash-panel-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                            <label className="vdash-panel-label" style={{ marginBottom: '4px' }}>New Password</label>
                            <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
                                style={{ background: '#111', color: '#fff', border: '1px solid #333', padding: '10px 14px', borderRadius: '8px', fontSize: '1rem', width: '100%' }} />
                        </div>
                        <div className="vdash-panel-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                            <label className="vdash-panel-label" style={{ marginBottom: '4px' }}>Confirm New Password</label>
                            <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                                style={{ background: '#111', color: '#fff', border: '1px solid #333', padding: '10px 14px', borderRadius: '8px', fontSize: '1rem', width: '100%' }} />
                        </div>
                        <button className="btn btn-primary" onClick={changePassword} disabled={!oldPw || !newPw || !confirmPw} style={{ marginTop: '8px', width: '100%' }}>
                            🔑 Change Password
                        </button>
                        {pwMsg && <div style={{ marginTop: '8px', padding: '8px 12px', borderRadius: '8px', fontSize: '0.9rem' }}>{pwMsg}</div>}
                    </div>
                </section>

                {user && (
                    <section className="vdash-panel vdash-panel--page" style={{ marginTop: '24px' }}>
                        <h2 className="vdash-panel-title">ℹ️ Account Info</h2>
                        <div className="vdash-panel-rows">
                            <div className="vdash-panel-row"><span className="vdash-panel-label">Support Type</span><span className="vdash-panel-value" style={{ textTransform: 'capitalize' }}>{user.disability || '—'}</span></div>
                            <div className="vdash-panel-row"><span className="vdash-panel-label">Speech Speed</span><span className="vdash-panel-value">{user.speechSpeed || 1.0}x</span></div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}
