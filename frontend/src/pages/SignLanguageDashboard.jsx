import { Link } from 'react-router-dom'

export default function SignLanguageDashboard() {
    return (
        <div className="sdash-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center' }}>
            <div style={{ maxWidth: '500px', padding: '40px' }}>
                <div style={{ fontSize: '5rem', marginBottom: '24px' }}>🤟</div>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '12px' }}>Sign Language Support</h1>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '24px' }}>
                    We're working hard to bring sign language recognition and translation features to AccessiLearn.
                    This module will include real-time sign language detection, gesture-to-text conversion, and educational sign language content.
                </p>
                <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                    <p style={{ color: '#93c5fd', fontWeight: '600', fontSize: '1rem' }}>🚧 Coming Soon</p>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '6px' }}>Stay tuned for updates! This feature is currently in development.</p>
                </div>
                <Link to="/" className="btn btn-primary" style={{ display: 'inline-block', padding: '12px 28px', borderRadius: '10px', fontSize: '1rem' }}>← Back to Home</Link>
            </div>
        </div>
    )
}
