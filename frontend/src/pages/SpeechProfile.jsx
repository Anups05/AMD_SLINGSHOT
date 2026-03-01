import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
const API = 'http://localhost:5000/api'
function getToken() { return localStorage.getItem('accessilearn_token') || '' }
const langNames = { en: 'English', hi: 'हिन्दी', mr: 'मराठी' }

export default function SpeechProfile() {
    const [user, setUser] = useState(null); const [name, setName] = useState(''); const [lang, setLang] = useState('en')
    const [oldPw, setOldPw] = useState(''); const [newPw, setNewPw] = useState(''); const [confirmPw, setConfirmPw] = useState('')
    const [msg, setMsg] = useState(''); const [pwMsg, setPwMsg] = useState(''); const [saving, setSaving] = useState(false)

    useEffect(() => {
        document.title = 'AccessiLearn — Profile'
        try { const u = JSON.parse(localStorage.getItem('accessilearn_user') || '{}'); setUser(u); setName(u.name || ''); setLang(u.language || 'en') } catch { }
    }, [])

    const saveProfile = async () => {
        setSaving(true); setMsg('')
        try {
            const r = await fetch(`${API}/auth/profile`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                body: JSON.stringify({ name, language: lang })
            })
            const data = await r.json()
            if (data.error) { setMsg('❌ ' + data.error) }
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
        <div className="sdash-page">
            <header className="sdash-page-header"><Link to="/dashboard/speech" className="sdash-back-btn">← Back</Link><h1>👤 Profile</h1></header>
            <div className="sdash-page-content">
                <section className="sdash-result-section">
                    <h2>Edit Profile</h2>
                    <div className="sdash-form-group">
                        <label>Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="sdash-input" />
                    </div>
                    <div className="sdash-form-group">
                        <label>Email <span style={{ color: '#888', fontSize: '0.85em' }}>(cannot be changed)</span></label>
                        <input type="email" value={user?.email || ''} disabled className="sdash-input" style={{ opacity: 0.6 }} />
                    </div>
                    <div className="sdash-form-group">
                        <label>Preferred Language</label>
                        <select value={lang} onChange={e => setLang(e.target.value)} className="sdash-input">
                            <option value="en">English</option>
                            <option value="hi">हिन्दी</option>
                            <option value="mr">मराठी</option>
                        </select>
                    </div>
                    <button className="btn btn-primary" onClick={saveProfile} disabled={saving} style={{ marginTop: '8px' }}>{saving ? 'Saving...' : 'Save Profile'}</button>
                    {msg && <div className="sdash-msg" style={{ marginTop: '8px' }}>{msg}</div>}
                </section>

                <section className="sdash-result-section" style={{ marginTop: '24px' }}>
                    <h2>Change Password</h2>
                    <div className="sdash-form-group"><label>Current Password</label><input type="password" value={oldPw} onChange={e => setOldPw(e.target.value)} className="sdash-input" /></div>
                    <div className="sdash-form-group"><label>New Password</label><input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} className="sdash-input" /></div>
                    <div className="sdash-form-group"><label>Confirm New Password</label><input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="sdash-input" /></div>
                    <button className="btn btn-primary" onClick={changePassword} disabled={!oldPw || !newPw || !confirmPw} style={{ marginTop: '8px' }}>Change Password</button>
                    {pwMsg && <div className="sdash-msg" style={{ marginTop: '8px' }}>{pwMsg}</div>}
                </section>

                {user && (
                    <section className="sdash-result-section" style={{ marginTop: '24px' }}>
                        <h2>Account Info</h2>
                        <p><strong>Support Type:</strong> {user.disability || 'N/A'}</p>
                        <p><strong>Speech Speed:</strong> {user.speechSpeed || 1.0}x</p>
                    </section>
                )}
            </div>
        </div>
    )
}
