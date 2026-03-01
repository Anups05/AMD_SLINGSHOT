const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const pdfParse = require('pdf-parse')
const auth = require('../middleware/auth')

const router = express.Router()
router.use(auth)

// Ensure uploads directory
const uploadDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1e4) + path.extname(file.originalname)),
})
const fileFilter = (req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf']
    if (allowed.includes(file.mimetype) || file.mimetype.startsWith('audio') || file.mimetype.startsWith('video')) cb(null, true)
    else cb(new Error('Unsupported file type'), false)
}
const upload = multer({ storage, fileFilter, limits: { fileSize: 20 * 1024 * 1024 } })

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_KEY = process.env.GROQ_API_KEY

/* ═══════ Groq Chat Helper ═══════ */
async function callGroq(messages, model = 'llama-3.3-70b-versatile') {
    const res = await fetch(GROQ_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_KEY}` },
        body: JSON.stringify({ model, messages, temperature: 0.2, max_tokens: 4096 }),
    })
    if (!res.ok) {
        const errText = await res.text()
        console.error(`Groq API error (${res.status}):`, errText)
        throw new Error(`Groq API error: ${res.status}`)
    }
    const data = await res.json()
    return data.choices[0].message.content
}

/* ═══════ OCR via Groq Vision ═══════ */
async function ocrImage(imagePath) {
    const imageBuffer = fs.readFileSync(imagePath)
    const base64 = imageBuffer.toString('base64')
    const ext = path.extname(imagePath).toLowerCase()
    const mimeMap = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' }
    const mime = mimeMap[ext] || 'image/png'

    const messages = [{
        role: 'user',
        content: [
            { type: 'text', text: 'Extract ALL text from this image. Return ONLY the extracted text, nothing else. If no text is found, return "No text found in image."' },
            { type: 'image_url', image_url: { url: `data:${mime};base64,${base64}` } },
        ],
    }]

    // Try 11b first (more widely available), then 90b
    try {
        return await callGroq(messages, 'llama-3.2-11b-vision-preview')
    } catch (err) {
        console.log('11b vision failed, trying 90b...')
        try {
            return await callGroq(messages, 'llama-3.2-90b-vision-preview')
        } catch (err2) {
            // Last resort: try meta-llama model  
            console.log('90b failed too, trying meta model...')
            return await callGroq(messages, 'meta-llama/llama-4-scout-17b-16e-instruct')
        }
    }
}

/* ═══════ Extract PDF text ═══════ */
async function extractPdfText(pdfPath) {
    const buffer = fs.readFileSync(pdfPath)
    const data = await pdfParse(buffer)
    return data.text || 'No text found in PDF.'
}

/* ═══════ Translate via Groq ═══════ */
async function translateText(text, targetLang) {
    const langNames = { en: 'English', hi: 'Hindi', mr: 'Marathi' }
    const langName = langNames[targetLang] || 'English'

    const translated = await callGroq([{
        role: 'system',
        content: `You are a translator. Translate the following text to ${langName}. Return ONLY the translated text. Keep formatting.`
    }, {
        role: 'user',
        content: text.substring(0, 8000) // Limit to avoid token overflow
    }])

    return translated
}

/* ═══════ Transcribe Audio/Video via Groq Whisper ═══════ */
async function transcribeAudio(filePath) {
    try {
        const formData = new (require('form-data'))()
        formData.append('file', fs.createReadStream(filePath))
        formData.append('model', 'whisper-large-v3-turbo')
        formData.append('response_format', 'text')

        const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_KEY}`, ...formData.getHeaders() },
            body: formData,
        })

        if (!res.ok) {
            const errText = await res.text()
            console.error('Whisper transcription error:', res.status, errText)
            // Fallback: describe based on filename
            const fileName = path.basename(filePath)
            return `[Audio/Video file: ${fileName}] — Could not transcribe audio. The file may be too large or in an unsupported format.`
        }

        const text = await res.text()
        return text || 'No speech detected in the audio/video.'
    } catch (err) {
        console.error('Transcription error:', err.message)
        const fileName = path.basename(filePath)
        return `[Audio/Video file: ${fileName}] — Transcription failed: ${err.message}`
    }
}

/* ═══════ POST /api/upload ═══════ */
router.post('/', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

        const filePath = req.file.path
        const fileName = req.file.originalname
        const fileUrl = `/uploads/${req.file.filename}`
        const mimeType = req.file.mimetype
        const targetLang = req.body.language || 'en'

        let extractedText = ''

        if (mimeType === 'application/pdf') {
            extractedText = await extractPdfText(filePath)
        } else {
            extractedText = await ocrImage(filePath)
        }

        // Translate if user language is not English
        let translatedText = null
        if (targetLang !== 'en' && extractedText && extractedText !== 'No text found in image.' && extractedText !== 'No text found in PDF.') {
            translatedText = await translateText(extractedText, targetLang)
        }

        res.json({
            success: true,
            fileName,
            fileUrl,
            fileType: mimeType.startsWith('image') ? 'image' : 'pdf',
            extractedText,
            translatedText,
            language: targetLang,
        })
    } catch (err) {
        console.error('Upload/OCR error:', err)
        res.status(500).json({ error: err.message || 'Failed to process file' })
    }
})

/* ═══════ POST /api/upload/translate ═══════ */
router.post('/translate', async (req, res) => {
    try {
        const { text, targetLang } = req.body
        if (!text) return res.status(400).json({ error: 'Text is required' })
        const translated = await translateText(text, targetLang || 'en')
        res.json({ success: true, translatedText: translated || text })
    } catch (err) {
        console.error('Translation error:', err)
        res.status(500).json({ error: err.message || 'Translation failed' })
    }
})
/* ═══════ POST /api/upload/summarise ═══════ */
router.post('/summarise', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

        const filePath = req.file.path
        const fileName = req.file.originalname
        const fileUrl = `/uploads/${req.file.filename}`
        const mimeType = req.file.mimetype
        const targetLang = req.body.language || 'en'

        let extractedText = ''

        if (mimeType === 'application/pdf') {
            extractedText = await extractPdfText(filePath)
        } else if (mimeType.startsWith('image')) {
            extractedText = await ocrImage(filePath)
        } else if (mimeType.startsWith('audio') || mimeType.startsWith('video')) {
            // Transcribe audio/video via Whisper
            extractedText = await transcribeAudio(filePath)
        }

        // Generate TOPIC-BASED summary via Groq
        let summary = ''
        if (extractedText && extractedText.length > 10) {
            summary = await callGroq([{
                role: 'system',
                content: `You are an expert summariser. Given the following content:
1. First, identify all the MAIN TOPICS in the content
2. For each topic, provide a detailed summary (3-4 sentences each)
3. Format as:

**Topic 1: [Name]**
[Summary of this topic]

**Topic 2: [Name]**
[Summary of this topic]

...and so on for all topics found. Be thorough and include key details, important facts, and relevant examples. Return ONLY the formatted summary.`
            }, {
                role: 'user',
                content: extractedText.substring(0, 8000)
            }])
        } else {
            summary = 'No meaningful content found to summarise.'
        }

        // Translate summary if needed
        let translatedSummary = null
        if (targetLang !== 'en' && summary && summary !== 'No meaningful content found to summarise.') {
            translatedSummary = await translateText(summary, targetLang)
        }

        res.json({
            success: true, fileName, fileUrl,
            fileType: mimeType.startsWith('image') ? 'image' : mimeType.startsWith('audio') ? 'audio' : mimeType.startsWith('video') ? 'video' : 'pdf',
            extractedText, summary, translatedSummary, language: targetLang,
        })
    } catch (err) {
        console.error('Summarise error:', err)
        res.status(500).json({ error: err.message || 'Failed to summarise file' })
    }
})

/* ═══════ POST /api/upload/assignment — file-based ═══════ */
router.post('/assignment', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
        const filePath = req.file.path
        const fileName = req.file.originalname
        const mimeType = req.file.mimetype
        const targetLang = req.body.language || 'en'

        let extractedText = ''
        if (mimeType === 'application/pdf') extractedText = await extractPdfText(filePath)
        else if (mimeType.startsWith('image')) extractedText = await ocrImage(filePath)

        if (!extractedText || extractedText.length < 5) {
            return res.json({ success: true, extractedText: '', breakdown: 'Could not read the assignment. Please try a clearer image or PDF.', language: targetLang })
        }

        const breakdown = await callGroq([{
            role: 'system',
            content: `You are a helpful tutor. Analyze the assignment and provide:
1. A brief understanding of what the assignment asks
2. Step-by-step instructions on how to complete it
3. Tips and important things to remember
4. Estimated time for each step
Format with numbered steps. Be encouraging. Use simple language.`
        }, { role: 'user', content: `Here is my assignment:\n\n${extractedText.substring(0, 6000)}` }])

        let translatedBreakdown = null
        if (targetLang !== 'en' && breakdown) translatedBreakdown = await translateText(breakdown, targetLang)

        res.json({ success: true, extractedText, breakdown, translatedBreakdown, language: targetLang, fileName })
    } catch (err) {
        console.error('Assignment error:', err)
        res.status(500).json({ error: err.message || 'Failed to analyse assignment' })
    }
})

/* ═══════ POST /api/upload/assignment-text — spoken ═══════ */
router.post('/assignment-text', async (req, res) => {
    try {
        const { text, language } = req.body
        if (!text) return res.status(400).json({ error: 'No text provided' })

        const breakdown = await callGroq([{
            role: 'system',
            content: `You are a helpful tutor. Analyze the assignment and provide:
1. A brief understanding of what the assignment asks
2. Step-by-step instructions on how to complete it
3. Tips and important things to remember
4. Estimated time for each step
Format with numbered steps. Be encouraging. Use simple language.`
        }, { role: 'user', content: `My assignment is: ${text}` }])

        let translatedBreakdown = null
        if (language !== 'en' && breakdown) translatedBreakdown = await translateText(breakdown, language)

        res.json({ success: true, spokenText: text, breakdown, translatedBreakdown, language })
    } catch (err) {
        console.error('Assignment text error:', err)
        res.status(500).json({ error: err.message || 'Failed to analyse assignment' })
    }
})

/* ═══════ POST /api/upload/study-plan ═══════ */
router.post('/study-plan', async (req, res) => {
    try {
        const { details, language } = req.body
        if (!details) return res.status(400).json({ error: 'No study details provided' })

        const plan = await callGroq([{
            role: 'system',
            content: `You are a study planner expert. Based on the student's input, create a detailed, structured study plan. Include:
1. Subject/Topic breakdown
2. Number of questions to practice per topic
3. Time allocation for each section
4. Break times
5. Revision slots
6. Priority order (most important first)
7. Tips for effective studying

Format it clearly with sections, time blocks, and action items. Be specific with times like "9:00 AM - 9:45 AM: Topic X". Make it practical and achievable.`
        }, { role: 'user', content: `Here are my study details: ${details}` }])

        let translatedPlan = null
        if (language !== 'en' && plan) translatedPlan = await translateText(plan, language)

        res.json({ success: true, plan, translatedPlan, language })
    } catch (err) {
        console.error('Study plan error:', err)
        res.status(500).json({ error: err.message || 'Failed to create study plan' })
    }
})

/* ═══════ POST /api/upload/simplify — file-based ═══════ */
router.post('/simplify', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
        const filePath = req.file.path
        const mimeType = req.file.mimetype
        const targetLang = req.body.language || 'en'

        let extractedText = ''
        if (mimeType === 'application/pdf') extractedText = await extractPdfText(filePath)
        else if (mimeType.startsWith('image')) extractedText = await ocrImage(filePath)

        if (!extractedText || extractedText.length < 5) {
            return res.json({ success: true, explanation: 'Could not read the file. Please try a clearer image or PDF.' })
        }

        const explanation = await callGroq([{
            role: 'system',
            content: `You are a teacher explaining concepts to a 5-10 year old child. Take the content and:
1. Explain every concept in very simple words
2. Use fun examples and analogies kids can relate to (toys, cartoons, food, games)
3. Break complex ideas into tiny, easy-to-understand pieces
4. Use short sentences
5. Be enthusiastic and encouraging
6. Add emojis where appropriate

Make it fun and engaging! The child should feel excited to learn.`
        }, { role: 'user', content: `Please explain this simply:\n\n${extractedText.substring(0, 6000)}` }])

        let translatedExplanation = null
        if (targetLang !== 'en' && explanation) translatedExplanation = await translateText(explanation, targetLang)

        res.json({ success: true, extractedText, explanation, translatedExplanation, language: targetLang })
    } catch (err) {
        console.error('Simplify error:', err)
        res.status(500).json({ error: err.message || 'Failed to simplify content' })
    }
})

/* ═══════ POST /api/upload/simplify-text — spoken topic ═══════ */
router.post('/simplify-text', async (req, res) => {
    try {
        const { text, language } = req.body
        if (!text) return res.status(400).json({ error: 'No text provided' })

        const explanation = await callGroq([{
            role: 'system',
            content: `You are a teacher explaining concepts to a 5-10 year old child. Take the topic and:
1. Explain every concept in very simple words
2. Use fun examples and analogies kids can relate to (toys, cartoons, food, games)
3. Break complex ideas into tiny, easy-to-understand pieces
4. Use short sentences
5. Be enthusiastic and encouraging
6. Add emojis where appropriate

Make it fun and engaging! The child should feel excited to learn.`
        }, { role: 'user', content: `Please explain this topic simply: ${text}` }])

        let translatedExplanation = null
        if (language !== 'en' && explanation) translatedExplanation = await translateText(explanation, language)

        res.json({ success: true, spokenText: text, explanation, translatedExplanation, language })
    } catch (err) {
        console.error('Simplify text error:', err)
        res.status(500).json({ error: err.message || 'Failed to simplify topic' })
    }
})

/* ═══════ POST /api/upload/transcript — audio transcription ═══════ */
router.post('/transcript', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
        const filePath = req.file.path
        const targetLang = req.body.language || 'en'

        const transcript = await transcribeAudio(filePath)
        if (!transcript) return res.json({ error: 'Could not transcribe audio. Please try a different file.' })

        let translatedTranscript = null
        if (targetLang !== 'en' && transcript) translatedTranscript = await translateText(transcript, targetLang)

        res.json({ success: true, transcript, translatedTranscript, language: targetLang })
    } catch (err) {
        console.error('Transcript error:', err)
        res.status(500).json({ error: err.message || 'Failed to transcribe audio' })
    }
})

/* ═══════ POST /api/upload/chat-file — chat with file context ═══════ */
router.post('/chat-file', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
        const filePath = req.file.path
        const mimeType = req.file.mimetype
        const question = req.body.question || 'Summarize this file.'
        const targetLang = req.body.language || 'en'

        let extractedText = ''
        if (mimeType === 'application/pdf') extractedText = await extractPdfText(filePath)
        else if (mimeType.startsWith('image')) extractedText = await ocrImage(filePath)
        else if (mimeType.startsWith('audio') || mimeType.startsWith('video')) extractedText = await transcribeAudio(filePath)

        if (!extractedText || extractedText.length < 5) {
            return res.json({ reply: 'Could not read the file content. Please try a different file.' })
        }

        const langNames = { en: 'English', hi: 'Hindi', mr: 'Marathi' }
        const langInstruction = targetLang !== 'en' ? ` Respond in ${langNames[targetLang] || 'English'}.` : ''

        const reply = await callGroq([{
            role: 'system',
            content: `You are a helpful study assistant. You have been given the content of a file. Answer the user's question based on this content accurately and thoroughly.${langInstruction}`
        }, {
            role: 'user',
            content: `File content:\n\n${extractedText.substring(0, 8000)}\n\nQuestion: ${question}`
        }])

        res.json({ reply, extractedText: extractedText.substring(0, 500) + '...' })
    } catch (err) {
        console.error('Chat file error:', err)
        res.status(500).json({ error: err.message || 'Failed to process file' })
    }
})

/* ═══════ POST /api/upload/pdf-highlight — extract + highlight main points ═══════ */
router.post('/pdf-highlight', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
        const filePath = req.file.path
        const mimeType = req.file.mimetype

        let extractedText = ''
        if (mimeType === 'application/pdf') extractedText = await extractPdfText(filePath)
        else if (mimeType.startsWith('image')) extractedText = await ocrImage(filePath)

        if (!extractedText || extractedText.length < 5) {
            return res.json({ extractedText: 'Could not read the file.', highlights: [] })
        }

        const highlightResult = await callGroq([{
            role: 'system',
            content: `You are an expert at identifying key information. Given the text, identify the MOST IMPORTANT sentences or phrases (main points, key facts, definitions, conclusions). Return ONLY a JSON array of strings, each being an exact substring from the original text that should be highlighted. Return 5-15 highlights. Return ONLY the JSON array, nothing else.`
        }, {
            role: 'user',
            content: extractedText.substring(0, 6000)
        }])

        let highlights = []
        try {
            const cleaned = highlightResult.replace(/```json\n?/g, '').replace(/```/g, '').trim()
            highlights = JSON.parse(cleaned)
        } catch { highlights = [] }

        res.json({ extractedText, highlights })
    } catch (err) {
        console.error('PDF highlight error:', err)
        res.status(500).json({ error: err.message || 'Failed to process file' })
    }
})

/* ═══════ POST /api/upload/translate-text — translate text ═══════ */
router.post('/translate-text', async (req, res) => {
    try {
        const { text, targetLang } = req.body
        if (!text) return res.status(400).json({ error: 'No text provided' })
        if (targetLang === 'en') return res.json({ translated: text })
        const translated = await translateText(text, targetLang)
        res.json({ translated })
    } catch (err) {
        console.error('Translate text error:', err)
        res.status(500).json({ error: err.message || 'Translation failed' })
    }
})

module.exports = router
