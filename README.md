# AccessiLearn

**Accessible Learning for Every Mind.**

AccessiLearn is an AI-powered learning platform developed to adapt educational content, minimize cognitive overload, and offer real-time assistance for diverse learning needs. Built with WCAG accessibility standards in mind, the application promotes compatibility with assistive technologies and creates an inclusive digital learning experience for every learner.

---

## 🌟 Features

- **👁️ Vision Support:** Offers text-to-speech, high-contrast modes, adjustable font sizes, and complete screen-reader compatibility.
- **🧠 Neurodiverse Study Tools:** Provides task breakdowns, organized lecture notes, distraction-free modes, and ongoing cognitive support.
- **🗣️ Speech Assistance:** Enables real-time speech-to-text captions, transcription, and voice-based interaction.
- **📄 PDF Accessibility:** Allows users to upload and read PDFs with Text-To-Speech (TTS), text highlighting, and language translation.
- **🤖 AI Lecture Summaries:** Generates instant, AI-powered topic-based summaries from lectures, notes, images, audio/video files, and other study materials.
- **📷 Image-to-Text (OCR):** Enables users to upload images containing handwritten or printed text and extract readable content instantly using AI Vision models.
- **📝 Assignment Breakdown:** Allows users to paste assignment text or upload a file and transform it into smaller, manageable, step-by-step tasks.
- **🎓 Reading Level Selector (Simplification):** Converts complex texts and concepts into engaging, easy-to-understand explanations with relevant examples.
- **🎯 Confidence Check-In:** Uses quick micro-questions at the beginning and end of sessions to monitor and strengthen learning confidence.
- **🧘 Distraction Blocker:** Provides a minimal, distraction-free interface that helps users stay focused on their learning goals.
- **🌐 Multilingual Support:** Provides comprehensive interface support in multiple languages (English, Hindi, Marathi), along with built-in AI translation for study materials.
- **🎧 Live Lecture Companion:** Delivers real-time captions, organized notes, and instant summaries dynamically generated during live lectures.

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
- [Multer](https://github.com/expressjs/multer) & [PDF-Parse](https://gitlab.com/autokent/pdf-parse) for file uploading, handling, and processing
- **AI Integrations:** Powered by the [Groq API](https://groq.com/):
  - **Llama 3 Versatile (70B & Vision models):** Supports OCR, summarization, explanations, assignment breakdowns, and translations.
  - **Whisper:** Enables fast audio and video transcription.

---

## 🚀 Getting Started

### Prerequisites

Make sure Node.js is installed on your system. A **Groq API Key** is also required to enable the AI-powered features.

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install the required dependencies:

   ```bash
   npm install
   ```

3. Configure your Groq API key:

   Create a `.env` file inside the `backend` folder and add the following:

   ```env
   GROQ_API_KEY=your_api_key_here
   ```

4. Run the backend development server:

   ```bash
   npm run dev
   ```

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install the frontend dependencies:

   ```bash
   npm install
   ```

3. Launch the Vite development server:

   ```bash
   npm run dev
   ```

Enjoy building a more accessible and inclusive digital learning environment!
