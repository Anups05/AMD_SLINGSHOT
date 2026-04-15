# AccessiLearn

**Accessible Learning for Every Mind.**

AccessiLearn is an AI-powered learning platform designed to adapt content, reduce cognitive overload, and provide real-time support for diverse learning needs. Designed with WCAG accessibility standards in mind, this application ensures compatibility with assistive technologies and delivers inclusive digital experiences for every learner.

---

## 🌟 Features

- **👁️ Vision Support:** Text-to-speech, high contrast modes, adjustable fonts, and full screen-reader compatibility.
- **🧠 Neurodiverse Study Tools:** Task breakdowns, structured lecture notes, distraction-free modes, and continuous cognitive support.
- **🗣️ Speech Assistance:** Real-time speech-to-text captions, transcription, and voice-based interaction.
- **📄 PDF Accessibility:** Upload and read PDFs easily with Text-To-Speech (TTS), highlights, and language translation.
- **🤖 AI Lecture Summaries:** Get instant AI-generated topic-based summaries from lectures, notes, images, audio/video files, and study material.
- **📷 Image-to-Text (OCR):** Upload images of handwritten or printed text and extract readable content instantly using AI Vision models.
- **📝 Assignment Breakdown:** Paste any assignment text or upload a file and get it broken down into small, manageable step-by-step tasks.
- **🎓 Reading Level Selector (Simplification):** Simplify complex texts or concepts into fun, engaging, and easy-to-understand explanations with examples.
- **🎯 Confidence Check-In:** Quick micro-questions at the start and end of sessions to track and build learning confidence.
- **🧘 Distraction Blocker:** Minimal, distraction-free UI mode that keeps you completely focused on what matters.
- **🌐 Multilingual Support:** Comprehensive interface support in multiple languages (English, Hindi, Marathi) and built-in AI translation for study materials.
- **🎧 Live Lecture Companion:** Real-time captions, structured notes, and instant summaries dynamically created during live lectures.

---

## 🛠️ Technology Stack

**Frontend Frameworks & Libraries**
- [React (v19)](https://react.dev/)
- [Vite](https://vitejs.dev/)
- React Router v7
- Custom CSS Interfaces

**Backend API & Services**
- [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- [Better-SQLite3](https://github.com/JoshuaWise/better-sqlite3) (Fast local database)
- [Multer](https://github.com/expressjs/multer) & [PDF-Parse](https://gitlab.com/autokent/pdf-parse) for file handling and processing
- **AI Integrations**: Powered intimately by [Groq API](https://groq.com/):
  - **Llama 3 Versatile (70B & Vision models)**: Used for OCR, Summarization, Explanations, Assignment breakdowns, and Translations.
  - **Whisper**: Used for fast audio/video transcription.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have Node.js installed. You will also need a **Groq API Key** for the AI functionalities to work.

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set your Groq API key:
   Create a `.env` file in the `backend` folder and add:
   ```env
   GROQ_API_KEY=your_api_key_here
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

Enjoy building a more accessible and inclusive digital learning environment!
