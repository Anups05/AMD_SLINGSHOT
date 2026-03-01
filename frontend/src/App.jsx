import { useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login'
import NeurodiverseDashboard from './pages/Dashboard'
import VisionDashboard from './pages/VisionDashboard'
import VisionProfile from './pages/VisionProfile'
import VisionSettings from './pages/VisionSettings'
import VisionUpload from './pages/VisionUpload'
import VisionSummarise from './pages/VisionSummarise'
import VisionAssignment from './pages/VisionAssignment'
import VisionPlanner from './pages/VisionPlanner'
import VisionSimplified from './pages/VisionSimplified'
import SpeechDashboard from './pages/SpeechDashboard'
import SpeechCaptions from './pages/SpeechCaptions'
import SpeechSummary from './pages/SpeechSummary'
import SpeechTranscript from './pages/SpeechTranscript'
import SpeechChat from './pages/SpeechChat'
import SpeechPDF from './pages/SpeechPDF'
import SpeechTTS from './pages/SpeechTTS'
import SpeechAssignment from './pages/SpeechAssignment'
import SpeechSimplified from './pages/SpeechSimplified'
import SpeechPlanner from './pages/SpeechPlanner'
import SpeechCheckin from './pages/SpeechCheckin'
import SpeechProfile from './pages/SpeechProfile'
import SignLanguageDashboard from './pages/SignLanguageDashboard'
import './index.css'

/* ═══════ Feature Data ═══════ */
const features = [
  { icon: '👁️', title: 'Vision Support', desc: 'Text-to-speech, high contrast modes, adjustable fonts, and screen-reader compatibility.', id: 'vision' },
  { icon: '🧠', title: 'Neurodiverse Study Tools', desc: 'Task breakdowns, structured lecture notes, distraction-free modes, and cognitive support.', id: 'neuro' },
  { icon: '🗣️', title: 'Speech Assistance', desc: 'Real-time speech-to-text captions and voice-based navigation for seamless interaction.', id: 'speech' },
  { icon: '📄', title: 'PDF Accessibility', desc: 'Upload and read PDFs with TTS, annotations, highlights, and adjustable reading speed.', id: 'pdf' },
  { icon: '🤖', title: 'AI Lecture Summaries', desc: 'Get instant AI-generated summaries from your lectures, notes, and study material.', id: 'ai-summary' },
  { icon: '📷', title: 'Image-to-Text (OCR)', desc: 'Upload images of handwritten or printed text and extract readable content instantly.', id: 'ocr' },
  { icon: '📝', title: 'Assignment Breakdown', desc: 'Paste any assignment and get it broken down into small, manageable step-by-step tasks.', id: 'assignment' },
  { icon: '🎓', title: 'Reading Level Selector', desc: 'Simplify any text to age-appropriate reading levels for better comprehension.', id: 'reading-level' },
  { icon: '🎯', title: 'Confidence Check-In', desc: 'Quick micro-questions at the start and end of sessions to track your learning confidence.', id: 'checkin' },
  { icon: '🧘', title: 'Distraction Blocker', desc: 'Minimal, distraction-free UI mode that keeps you focused on what matters.', id: 'distraction' },
  { icon: '🌐', title: 'Multilingual Support', desc: 'Full interface support in multiple languages so everyone can learn in comfort.', id: 'multilingual' },
  { icon: '🎧', title: 'Live Lecture Companion', desc: 'Real-time captions, structured notes, and instant summaries during live lectures.', id: 'lecture' },
]

const aboutBadges = [
  '♿ WCAG 2.1 Compliant', '⌨️ Keyboard Navigation', '🖥️ Screen Reader Ready',
  '🎨 High Contrast Mode', '🔤 Dyslexia-Friendly Font', '🌍 Multilingual Interface',
]

/* ═══════ Landing Components ═══════ */
function Navbar({ menuOpen, setMenuOpen }) {
  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon" aria-hidden="true">A</span>
          AccessiLearn
        </Link>
        <ul className={`navbar-links${menuOpen ? ' open' : ''}`} id="nav-menu">
          <li><a href="#features" onClick={() => setMenuOpen(false)}>Features</a></li>
          <li><a href="#about" onClick={() => setMenuOpen(false)}>About</a></li>
          <li><a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a></li>
          <li>
            <Link to="/login" className="navbar-cta-btn" onClick={() => setMenuOpen(false)}>
              Get Started
            </Link>
          </li>
        </ul>
        <button className="navbar-toggle" onClick={() => setMenuOpen(o => !o)} aria-expanded={menuOpen} aria-controls="nav-menu" aria-label="Toggle navigation menu">
          {menuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          )}
        </button>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container">
        <div className="hero-content">
          <h1>Accessible Learning<br />for <span>Every Mind.</span></h1>
          <p>An AI-powered learning platform designed to adapt content, reduce cognitive overload, and provide real-time support for diverse learning needs.</p>
          <div className="hero-buttons">
            <Link to="/login" className="btn btn-primary">Start Using</Link>
            <a href="#about" className="btn btn-outline">Learn More</a>
          </div>
        </div>
        <div className="hero-image">
          <img src="/hero-brain.png" alt="Illustration of an interconnected brain representing inclusive learning technology" width="420" height="420" />
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ icon, title, desc }) {
  return (
    <article className="feature-card" tabIndex="0">
      <div className="feature-icon" aria-hidden="true">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
      <span className="feature-link">Explore →</span>
    </article>
  )
}

function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <>
      <a className="skip-link" href="#features">Skip to main content</a>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main>
        <Hero />
        <section className="section" id="features">
          <div className="container">
            <div className="section-header">
              <h2>Inclusive Tools That <span>Adapt to You</span></h2>
              <p>Designed to remove learning barriers and empower students with flexible, real-time academic assistance.</p>
            </div>
            <div className="features-grid">
              {features.map(f => <FeatureCard key={f.id} icon={f.icon} title={f.title} desc={f.desc} />)}
            </div>
          </div>
        </section>
        <section className="section about-section" id="about">
          <div className="container">
            <div className="section-header"><h2>Accessibility First, <span>Always.</span></h2></div>
            <div className="about-content">
              <p>Our platform is designed following WCAG accessibility standards, ensuring compatibility with assistive technologies and inclusive digital experiences for every learner.</p>
              <p>Whether you need screen-reader support, voice commands, adjustable fonts, or distraction-free study modes — AccessiLearn adapts to your unique learning style.</p>
              <div className="about-badges">{aboutBadges.map((b, i) => <span className="badge" key={i}>{b}</span>)}</div>
            </div>
          </div>
        </section>
        <section className="section contact-section" id="contact">
          <div className="container">
            <div className="section-header"><h2>Get in <span>Touch</span></h2><p>Have questions or feedback? We'd love to hear from you.</p></div>
            <div className="contact-cards">
              <div className="contact-card"><div className="contact-icon" aria-hidden="true">📧</div><div><h4>Email</h4><span>support@accessilearn.in</span></div></div>
              <div className="contact-card"><div className="contact-icon" aria-hidden="true">📞</div><div><h4>Phone</h4><span>+91 98765 43210</span></div></div>
            </div>
          </div>
        </section>
      </main>
      <footer className="footer" role="contentinfo"><div className="container"><p>© 2026 AccessiLearn. Built for inclusive education.</p></div></footer>
    </>
  )
}

/* ═══════ App ═══════ */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />

      {/* Vision Dashboard */}
      <Route path="/dashboard/vision" element={<VisionDashboard />} />
      <Route path="/dashboard/vision/profile" element={<VisionProfile />} />
      <Route path="/dashboard/vision/settings" element={<VisionSettings />} />
      <Route path="/dashboard/vision/upload" element={<VisionUpload />} />
      <Route path="/dashboard/vision/summarise" element={<VisionSummarise />} />
      <Route path="/dashboard/vision/assignment" element={<VisionAssignment />} />
      <Route path="/dashboard/vision/planner" element={<VisionPlanner />} />
      <Route path="/dashboard/vision/simplified" element={<VisionSimplified />} />

      {/* Speech Dashboard */}
      <Route path="/dashboard/speech" element={<SpeechDashboard />} />
      <Route path="/dashboard/speech/captions" element={<SpeechCaptions />} />
      <Route path="/dashboard/speech/summary" element={<SpeechSummary />} />
      <Route path="/dashboard/speech/transcript" element={<SpeechTranscript />} />
      <Route path="/dashboard/speech/chat" element={<SpeechChat />} />
      <Route path="/dashboard/speech/pdf" element={<SpeechPDF />} />
      <Route path="/dashboard/speech/tts" element={<SpeechTTS />} />
      <Route path="/dashboard/speech/assignment" element={<SpeechAssignment />} />
      <Route path="/dashboard/speech/simplified" element={<SpeechSimplified />} />
      <Route path="/dashboard/speech/planner" element={<SpeechPlanner />} />
      <Route path="/dashboard/speech/checkin" element={<SpeechCheckin />} />
      <Route path="/dashboard/speech/profile" element={<SpeechProfile />} />

      {/* Neurodiverse Dashboard */}
      <Route path="/dashboard/neurodiverse" element={<NeurodiverseDashboard />} />

      {/* Sign Language Dashboard */}
      <Route path="/dashboard/sign-language" element={<SignLanguageDashboard />} />
    </Routes>
  )
}
