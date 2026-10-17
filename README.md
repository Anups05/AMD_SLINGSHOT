# AccessiLearn

**Accessible Learning for Every Mind.**

AccessiLearn is an AI-powered learning platform designed to adapt educational content, reduce cognitive overload, and provide real-time assistance for diverse learning needs. Built with accessibility principles and WCAG guidelines in mind, the application aims to improve compatibility with assistive technologies and create a more inclusive digital learning experience.

By combining AI-powered content processing, speech assistance, reading simplification, and personalized study tools, AccessiLearn helps learners interact with educational material in ways that better suit their individual needs.

---

## 🌟 Features

- **👁️ Vision Support:** Offers text-to-speech, high-contrast modes, adjustable font sizes, and screen-reader-friendly interfaces.
- **🧠 Neurodiverse Study Tools:** Provides task breakdowns, organized lecture notes, distraction-free modes, and structured study support.
- **🗣️ Speech Assistance:** Enables speech-to-text conversion, transcription, and voice-based interaction.
- **📄 PDF Accessibility:** Supports PDF uploads, text-to-speech, text highlighting, and translation to improve document accessibility.
- **🤖 AI Lecture Summaries:** Generates topic-based summaries from study materials, including notes, images, and supported audio or video files.
- **📷 Image-to-Text (OCR):** Extracts readable text from images containing printed or handwritten content using AI vision models.
- **📝 Assignment Breakdown:** Converts assignment instructions into smaller, manageable steps to make complex tasks easier to approach.
- **🎓 Reading Level Selector:** Simplifies complex texts and concepts into easier explanations with relevant examples.
- **🎯 Confidence Check-In:** Uses short questions at the beginning and end of study sessions to help learners reflect on their understanding and confidence.
- **🧘 Distraction-Free Mode:** Provides a minimal interface to help learners concentrate on their current task.
- **🌐 Multilingual Support:** Supports English, Hindi, and Marathi interfaces, alongside AI-assisted translation of study materials.
- **🎧 Live Lecture Companion:** Supports live captions, organized notes, and lecture summaries for real-time learning assistance.

---

## 💡 How It Helps Learners

AccessiLearn brings multiple accessibility and learning-support tools together in one platform.

- **Improves content accessibility:** Converts text into speech and extracts text from images and documents.
- **Makes complex material easier to understand:** Summarizes lengthy content and explains difficult concepts in simpler language.
- **Supports task organization:** Breaks assignments and larger study tasks into smaller steps.
- **Offers flexible learning formats:** Allows learners to work with text, documents, images, and supported audio or video content.
- **Encourages self-reflection:** Confidence check-ins help learners reflect on their understanding during study sessions.
- **Reduces interface barriers:** Adjustable visual settings and distraction-free layouts support different learning preferences.

---

## 🛠️ Technology Stack

### Frontend Frameworks & Libraries
- [React 19](https://react.dev/)
- [Vite](https://vitejs.dev/)
- React Router v7
- Custom CSS interfaces

### Backend API & Services
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Better-SQLite3](https://github.com/JoshuaWise/better-sqlite3) for local database storage
- [Multer](https://github.com/expressjs/multer) for file uploads
- [PDF-Parse](https://gitlab.com/autokent/pdf-parse) for PDF processing

### AI Integrations
- [Groq API](https://groq.com/)
- Llama models for supported text generation, summarization, explanations, translation, and vision-based tasks
- Whisper for audio and video transcription

---

## ⚙️ Core Workflows

### 1. AI-Powered Study Assistance
1. The learner provides study material.
2. The application processes the supported input format.
3. AI models generate summaries, simplified explanations, or topic-based notes.
4. The resulting content is presented in a more manageable format.

### 2. Accessible Document Reading
1. The learner uploads a supported PDF document.
2. The application extracts readable text.
3. The learner can use available reading assistance, including text-to-speech and highlighting.
4. Translation and simplification features help make the content more accessible.

### 3. Assignment Breakdown
1. The learner submits assignment instructions.
2. The AI processes the task requirements.
3. The instructions are organized into smaller steps.
4. The learner can use the breakdown to plan and track their work.

### 4. Image and Audio Processing
1. The learner uploads an image or supported media file.
2. The appropriate OCR or transcription process extracts the content.
3. The extracted text can be used for further study assistance.
4. Available AI tools can summarize or explain the processed content.

---

## ♿ Accessibility Approach

Accessibility is a central design consideration for AccessiLearn.

- Keyboard-friendly navigation and clearly identifiable interface controls.
- Adjustable text sizes and high-contrast display options.
- Screen-reader-friendly labels and semantic interface elements.
- Text alternatives to audio-based content where supported.
- Reduced visual distractions through simplified layouts.
- Multiple ways to access and understand educational content.

The application is designed with WCAG accessibility principles in mind. Actual compliance depends on implementation and accessibility testing.

---

## 🚀 Getting Started

### Prerequisites

- Node.js installed on your system.
- A Groq API key for AI-powered features.

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Configure your Groq API key in a `.env` file inside the `backend` directory:

   ```env
   GROQ_API_KEY=your_api_key_here
   ```

4. Start the backend development server:

   ```bash
   npm run dev
   ```

### Frontend Setup

1. Open a separate terminal and navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Start the Vite development server:

   ```bash
   npm run dev
   ```

---

## 🔒 Privacy & Responsible AI

- API credentials should be stored in environment variables rather than committed to version control.
- Uploaded educational materials should be handled with appropriate care.
- AI-generated summaries, translations, and explanations may contain errors and should be reviewed when accuracy is important.
- Accessibility tools are intended to support learners and should not replace individualized accommodations where these are needed.

---

## 🔮 Future Scope

- Expand support for additional Indian languages.
- Improve personalization of study materials and learning preferences.
- Enhance keyboard navigation and compatibility testing with assistive technologies.
- Extend support for additional document and media formats.
- Improve organization and retrieval of lecture notes and summaries.
- Expand learning progress insights and study-session customization.

---

AccessiLearn aims to make digital learning more accessible, flexible, and manageable by bringing AI assistance and inclusive design into a single learning platform.
