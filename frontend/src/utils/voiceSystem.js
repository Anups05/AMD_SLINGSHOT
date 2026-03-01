/* ═══════════════════════════════════════════
   AccessiLearn — Voice System Utility
   TTS + STT + Multilingual Translations
   ═══════════════════════════════════════════ */

const API = 'http://localhost:5000/api'

/* ─── Language voice map ─── */
const langVoiceMap = {
    en: { lang: 'en-IN', fallback: 'en-US', sttLang: 'en-IN' },
    hi: { lang: 'hi-IN', fallback: 'hi-IN', sttLang: 'hi-IN' },
    mr: { lang: 'mr-IN', fallback: 'hi-IN', sttLang: 'mr-IN' },
}

function pickVoice(lang) {
    const voices = window.speechSynthesis?.getVoices() || []
    const pref = langVoiceMap[lang] || langVoiceMap.en
    if (lang === 'mr') {
        const mrV = voices.find(v => v.lang === 'mr-IN') || voices.find(v => v.lang.startsWith('mr'))
        if (mrV) return mrV
    }
    return voices.find(v => v.lang === pref.lang) ||
        voices.find(v => v.lang === pref.fallback) ||
        voices.find(v => v.lang.startsWith(lang)) || null
}

/* ─── Translations ─── */
const translations = {
    en: {
        welcomeBack: (name) => `Hey ${name}, welcome back!`,
        askTasks: `Let's plan your day.`,
        askTaskN: (n) => `Tell me task ${n}.`,
        taskAdded: (n) => `Got it! Task ${n} saved.`,
        askNextOrDone: (n) => `Tell me task ${n}, or say "done".`,
        doneTasks: `Awesome, you're all set!`,
        speedIs: (s) => `Speed set to ${s}x.`,
        changeLangAsk: `Which language — English, Hindi, or Marathi?`,
        langChanged: (l) => `Switched to ${l}!`,
        langNotAvailable: `Not available yet. We have English, Hindi, and Marathi.`,
        uploadGranted: `Opening file picker, go ahead and select your file.`,
        taskAlert: (task) => `Hey, heads up! It's time for: ${task}`,
        listening: `I'm all ears...`,
        notAudible: `Couldn't hear you. Could you say that louder?`,
        notUnderstood: `Didn't get that. Could you try again?`,
        voiceStopped: `Going quiet. Say "start voice" when you need me.`,
        voiceStarted: `I'm back! What's next?`,
        navigating: (page) => `Taking you to ${page}.`,
        repeatIntro: `Here are your tasks:`,
        repeatTask: (n, text) => `Task ${n}: ${text}`,
        repeatNone: `No tasks yet. Want to add some?`,
        addMoreIntro: `Let's add more tasks.`,
        taskDeleted: (n) => `Task ${n} deleted.`,
        taskNotFound: (n) => `Task ${n} not found.`,
        deleteWhich: `Which task number to delete?`,
        uploadProcessing: `Processing your file, please wait...`,
        uploadDone: `Done! I'll read the extracted text now.`,
        uploadError: `Something went wrong processing the file.`,
        goUpload: `Taking you to the upload page.`,
        waitingCommand: `I'm here. Waiting for your command.`,
        logoutConfirm: `Are you sure you want to logout? Say yes or no.`,
        logoutBye: `Goodbye! See you soon.`,
        logoutCancel: `Okay, staying logged in.`,
        taskCompleted: (n, remaining) => `Great, task ${n} is done! You have ${remaining} tasks remaining.`,
        taskCompletedNone: (n) => `Task ${n} done! All tasks completed, well done!`,
        completeWhich: `Which task number did you complete?`,
        fileBrowseOpening: `Opening file picker, please select your file.`,
        fileBrowseSelected: (name) => `Selected ${name}. Processing now.`,
        fileBrowseNotSupported: `Using regular file picker.`,
        fileSelectedPdf: (name) => `${name} selected. This is a PDF file. Processing now.`,
        fileSelectedImage: (name) => `${name} selected. This is an image file. Processing now.`,
        fileSelectedAudio: (name) => `${name} selected. This is an audio file. Processing now.`,
        fileSelectedVideo: (name) => `${name} selected. This is a video file. Processing now.`,
        readingPaused: `Paused. Say "continue" to resume or "stop" to end.`,
        readingResumed: `Continuing.`,
        readingStopped: `Stopped reading.`,
        summariseProcessing: `Summarising your file, this may take a moment...`,
        summariseDone: `Summary is ready. Let me read it.`,
        summariseError: `Could not summarise the file.`,
        assignmentAsk: `Would you like to upload an assignment file, or do you want to describe it by speaking?`,
        assignmentUpload: `Go ahead, select your assignment file.`,
        assignmentSpeak: `Tell me about the assignment. What do you need help with?`,
        assignmentProcessing: `Analysing your assignment, please wait...`,
        assignmentDone: `Here's the step by step breakdown.`,
        assignmentError: `Could not analyse the assignment.`,
        goBack: `Going back to dashboard.`,
    },
    hi: {
        welcomeBack: (name) => `अरे ${name}, वापसी पर स्वागत!`,
        askTasks: `बताओ, आज क्या करना है?`,
        askTaskN: (n) => `काम नंबर ${n} बताओ।`,
        taskAdded: (n) => `बढ़िया, काम ${n} नोट कर लिया!`,
        askNextOrDone: (n) => `काम ${n} बताओ, या "बस" कहो।`,
        doneTasks: `शानदार! प्लान बन गया!`,
        speedIs: (s) => `स्पीड ${s}x पर सेट है।`,
        changeLangAsk: `कौन सी भाषा — अंग्रेजी, हिन्दी, या मराठी?`,
        langChanged: (l) => `${l} में बदल दिया!`,
        langNotAvailable: `अभी नहीं है। अंग्रेजी, हिन्दी और मराठी हैं।`,
        uploadGranted: `फ़ाइल पिकर खोल रहा हूँ, फ़ाइल चुनो।`,
        taskAlert: (task) => `सुनो, इसका टाइम हो गया: ${task}`,
        listening: `बोलो, सुन रहा हूँ...`,
        notAudible: `सुनाई नहीं दिया। ज़रा ज़ोर से बोलो?`,
        notUnderstood: `समझ नहीं आया। दूसरे तरीके से बोलो?`,
        voiceStopped: `चुप हो जाता हूँ। "आवाज़ चालू करो" बोलना।`,
        voiceStarted: `वापस आ गया! अगला क्या?`,
        navigating: (page) => `${page} पर ले चलता हूँ।`,
        repeatIntro: `आज के काम:`,
        repeatTask: (n, text) => `काम ${n}: ${text}`,
        repeatNone: `कोई काम नहीं है। जोड़ना है?`,
        addMoreIntro: `और काम जोड़ते हैं।`,
        taskDeleted: (n) => `काम ${n} हटा दिया!`,
        taskNotFound: (n) => `काम ${n} नहीं मिला।`,
        deleteWhich: `कौन सा काम नंबर हटाना है?`,
        uploadProcessing: `फ़ाइल प्रोसेस कर रहा हूँ, रुको...`,
        uploadDone: `हो गया! अब निकाला हुआ टेक्स्ट पढ़ता हूँ।`,
        uploadError: `फ़ाइल प्रोसेस करने में दिक्कत हुई।`,
        goUpload: `अपलोड पेज पर ले चलता हूँ।`,
        waitingCommand: `मैं यहाँ हूँ। बोलो क्या करना है?`,
        logoutConfirm: `सच में लॉगआउट करना है? हां या नहीं बोलो।`,
        logoutBye: `अलविदा! जल्दी मिलेंगे।`,
        logoutCancel: `ठीक है, रहते हैं।`,
        taskCompleted: (n, remaining) => `बढ़िया, काम ${n} हो गया! अभी ${remaining} काम बाकी हैं।`,
        taskCompletedNone: (n) => `काम ${n} पूरा! सब काम खत्म, शाबाश!`,
        completeWhich: `कौन सा काम नंबर पूरा हुआ?`,
        fileBrowseOpening: `फ़ाइल पिकर खोल रहा हूँ, फ़ाइल चुनो।`,
        fileBrowseSelected: (name) => `${name} चुन ली। प्रोसेस कर रहा हूँ।`,
        fileBrowseNotSupported: `नॉर्मल फ़ाइल पिकर इस्तेमाल करो।`,
        fileSelectedPdf: (name) => `${name} चुनी। यह एक पीडीएफ फ़ाइल है। प्रोसेस कर रहा हूँ।`,
        fileSelectedImage: (name) => `${name} चुनी। यह एक इमेज फ़ाइल है। प्रोसेस कर रहा हूँ।`,
        fileSelectedAudio: (name) => `${name} चुनी। यह एक ऑडियो फ़ाइल है। प्रोसेस कर रहा हूँ।`,
        fileSelectedVideo: (name) => `${name} चुनी। यह एक वीडियो फ़ाइल है। प्रोसेस कर रहा हूँ।`,
        readingPaused: `रुक गया। "जारी रखो" बोलो या "बंद करो" बोलो।`,
        readingResumed: `जारी रखता हूँ।`,
        readingStopped: `पढ़ना बंद कर दिया।`,
        summariseProcessing: `फ़ाइल का सारांश बना रहा हूँ, थोड़ा रुको...`,
        summariseDone: `सारांश तैयार है। पढ़ता हूँ।`,
        summariseError: `फ़ाइल का सारांश नहीं बना पाया।`,
        assignmentAsk: `क्या आप असाइनमेंट फ़ाइल अपलोड करना चाहते हैं, या बोलकर बताना चाहते हैं?`,
        assignmentUpload: `ठीक है, असाइनमेंट फ़ाइल चुनो।`,
        assignmentSpeak: `असाइनमेंट के बारे में बताओ। किसमें मदद चाहिए?`,
        assignmentProcessing: `असाइनमेंट का विश्लेषण कर रहा हूँ, रुको...`,
        assignmentDone: `यह रहा स्टेप बाय स्टेप ब्रेकडाउन।`,
        assignmentError: `असाइनमेंट का विश्लेषण नहीं कर पाया।`,
        goBack: `डैशबोर्ड पर वापस ले चलता हूँ।`,
    },
    mr: {
        welcomeBack: (name) => `अरे ${name}, पुन्हा स्वागत!`,
        askTasks: `बरं, आज काय करायचं?`,
        askTaskN: (n) => `काम नंबर ${n} सांग.`,
        taskAdded: (n) => `झालं, काम ${n} नोंदवलं!`,
        askNextOrDone: (n) => `काम ${n} सांग, किंवा "झालं" म्हण.`,
        doneTasks: `भारी! प्लॅन तयार!`,
        speedIs: (s) => `वेग ${s}x वर सेट.`,
        changeLangAsk: `कोणती भाषा — इंग्रजी, हिंदी, किंवा मराठी?`,
        langChanged: (l) => `${l} मध्ये बदललं!`,
        langNotAvailable: `ही भाषा नाही. इंग्रजी, हिंदी आणि मराठी आहेत.`,
        uploadGranted: `फाइल पिकर उघडतो, फाइल निवडा.`,
        taskAlert: (task) => `ऐक, याची वेळ झाली: ${task}`,
        listening: `बोल, ऐकतोय...`,
        notAudible: `नीट ऐकू आलं नाही. मोठ्याने बोल?`,
        notUnderstood: `कळलं नाही. वेगळ्या पद्धतीने सांग?`,
        voiceStopped: `शांत होतो. "आवाज सुरू कर" म्हणा.`,
        voiceStarted: `परत आलो! पुढचं काय?`,
        navigating: (page) => `${page} वर नेतो.`,
        repeatIntro: `आजची कामे:`,
        repeatTask: (n, text) => `काम ${n}: ${text}`,
        repeatNone: `कामे नाहीत. जोडायचं का?`,
        addMoreIntro: `आणखी कामे जोडूया.`,
        taskDeleted: (n) => `काम ${n} काढलं!`,
        taskNotFound: (n) => `काम ${n} सापडलं नाही.`,
        deleteWhich: `कोणता काम नंबर काढायचा?`,
        uploadProcessing: `फाइल प्रोसेस करतोय, थांब...`,
        uploadDone: `झालं! आता काढलेला मजकूर वाचतो.`,
        uploadError: `फाइल प्रोसेस करताना अडचण आली.`,
        goUpload: `अपलोड पेजवर नेतो.`,
        waitingCommand: `मी इथे आहे. सांग, काय करायचं?`,
        logoutConfirm: `खरंच लॉगआउट करायचं? होय किंवा नाही सांग.`,
        logoutBye: `बाय! पुन्हा भेटू.`,
        logoutCancel: `ठीक, राहतो.`,
        taskCompleted: (n, remaining) => `छान, काम ${n} झालं! अजून ${remaining} कामे बाकी.`,
        taskCompletedNone: (n) => `काम ${n} झालं! सगळी कामे पूर्ण, शाब्बास!`,
        completeWhich: `कोणता काम नंबर पूर्ण झाला?`,
        fileBrowseOpening: `फाइल पिकर उघडतो, फाइल निवडा.`,
        fileBrowseSelected: (name) => `${name} निवडली. प्रोसेस करतो.`,
        fileBrowseNotSupported: `नॉर्मल फाइल पिकर वापरा.`,
        fileSelectedPdf: (name) => `${name} निवडली. ही पीडीएफ फाइल आहे. प्रोसेस करतो.`,
        fileSelectedImage: (name) => `${name} निवडली. ही इमेज फाइल आहे. प्रोसेस करतो.`,
        fileSelectedAudio: (name) => `${name} निवडली. ही ऑडिओ फाइल आहे. प्रोसेस करतो.`,
        fileSelectedVideo: (name) => `${name} निवडली. ही व्हिडिओ फाइल आहे. प्रोसेस करतो.`,
        readingPaused: `थांबलो. "चालू कर" म्हणा किंवा "बंद कर" म्हणा.`,
        readingResumed: `पुढे चालू.`,
        readingStopped: `वाचणे बंद केलं.`,
        summariseProcessing: `फाइलचा सारांश बनवतो, थोडं थांब...`,
        summariseDone: `सारांश तयार. वाचतो.`,
        summariseError: `फाइलचा सारांश बनवता आला नाही.`,
        assignmentAsk: `असाइनमेंट फाइल अपलोड करायची की बोलून सांगायचं?`,
        assignmentUpload: `ठीक, असाइनमेंट फाइल निवडा.`,
        assignmentSpeak: `असाइनमेंटबद्दल सांग. कशात मदत हवी?`,
        assignmentProcessing: `असाइनमेंट विश्लेषण करतोय, थांब...`,
        assignmentDone: `हा स्टेप बाय स्टेप ब्रेकडाउन.`,
        assignmentError: `असाइनमेंट विश्लेषण करता आलं नाही.`,
        goBack: `डॅशबोर्डवर परत नेतो.`,
    },
}

export function t(lang, key, ...args) {
    const map = translations[lang] || translations.en
    const val = map[key]
    if (typeof val === 'function') return val(...args)
    return val || key
}

/* ─── Clean text for TTS (strip emojis, asterisks, markdown) ─── */
function cleanForTTS(text) {
    return text
        .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1') // **bold** or *italic* → just text
        .replace(/#{1,6}\s*/g, '')                // # headers
        .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{1FA00}-\u{1FAFF}\u{2702}-\u{27B0}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, '') // emojis
        .replace(/[*_~`]/g, '')                    // remaining markdown chars
        .replace(/\s{2,}/g, ' ')                   // collapse whitespace
        .trim()
}

/* ─── Speak ─── */
export function speak(text, lang = 'en', rate = 1.0) {
    return new Promise((resolve) => {
        if (!('speechSynthesis' in window)) { resolve(); return }
        window.speechSynthesis.cancel()
        const clean = cleanForTTS(text)
        if (!clean) { resolve(); return }
        const u = new SpeechSynthesisUtterance(clean)
        const v = pickVoice(lang)
        if (v) u.voice = v
        u.lang = (langVoiceMap[lang] || langVoiceMap.en).lang
        u.rate = rate
        u.volume = 0.9
        u.onend = () => resolve()
        u.onerror = () => resolve()
        window.speechSynthesis.speak(u)
    })
}

/* ─── Interruptible Read ───
   Reads text straight through. User can say pause/stop ONLY after
   the entire reading finishes via a prompt, or interrupt using the
   browser-level speechSynthesis.cancel() from the command loop.
   This avoids the TTS echo problem where listen() picks up the
   synthesized speech and misinterprets it as a command.
*/
export async function interruptibleRead(text, lang, rate, _onCommand) {
    if (!text) return
    // Just read the full text. The caller's command loop can cancel via speechSynthesis.cancel()
    await speak(text, lang, rate)
}

/* ─── Listen ─── */
export function listen(lang = 'en', timeout = 8000) {
    return new Promise((resolve, reject) => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SR) { reject(new Error('not-supported')); return }
        const r = new SR()
        r.lang = (langVoiceMap[lang] || langVoiceMap.en).sttLang
        r.interimResults = false; r.maxAlternatives = 1; r.continuous = false
        let done = false
        const tm = setTimeout(() => { if (!done) { done = true; r.stop(); reject(new Error('timeout')) } }, timeout)
        r.onresult = (e) => { if (!done) { done = true; clearTimeout(tm); resolve(e.results[0][0].transcript.trim()) } }
        r.onerror = (e) => { if (!done) { done = true; clearTimeout(tm); reject(new Error(e.error)) } }
        r.onend = () => { if (!done) { done = true; clearTimeout(tm); reject(new Error('no-speech')) } }
        r.start()
    })
}

/* ─── Parse time (12-hour format support) ─── */
export function parseTime(text) {
    const l = text.toLowerCase()
    const m12full = l.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i)
    if (m12full) {
        let h = parseInt(m12full[1]), min = parseInt(m12full[2])
        if (m12full[3] === 'pm' && h < 12) h += 12
        if (m12full[3] === 'am' && h === 12) h = 0
        return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
    }
    const m12 = l.match(/(\d{1,2})\s*(am|pm)/i)
    if (m12) {
        let h = parseInt(m12[1])
        if (m12[2] === 'pm' && h < 12) h += 12
        if (m12[2] === 'am' && h === 12) h = 0
        return `${String(h).padStart(2, '0')}:00`
    }
    const mAt = l.match(/(?:at|@)\s*(\d{1,2})(?::(\d{2}))?/i)
    if (mAt) {
        let h = parseInt(mAt[1]), min = mAt[2] ? parseInt(mAt[2]) : 0
        if (h >= 1 && h <= 8) h += 12
        return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
    }
    const mBaje = l.match(/(?:शाम|दोपहर)?\s*(\d{1,2})(?::(\d{2}))?\s*बजे/)
    if (mBaje) {
        let h = parseInt(mBaje[1]), min = mBaje[2] ? parseInt(mBaje[2]) : 0
        if (l.includes('शाम') || l.includes('दोपहर')) { if (h < 12) h += 12 }
        else if (h >= 1 && h <= 8) h += 12
        return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
    }
    const m24 = l.match(/(\d{2}):(\d{2})/)
    if (m24) return `${m24[1]}:${m24[2]}`
    return null
}

/* ─── Done ─── */
export function isDone(text, lang) {
    const l = text.toLowerCase().trim()
    const w = { en: ['done', 'finished', 'no more', "that's all", "that's it"], hi: ['बस', 'हो गया', 'और नहीं', 'बस हो गया'], mr: ['झाले', 'बस', 'आणखी नाही', 'झालं'] }
    return (w[lang] || w.en).some(x => l.includes(x))
}

/* ─── Voice toggle ─── */
export function parseVoiceToggle(text) {
    const l = text.toLowerCase().trim()
    if (['stop voice', 'stop listening', 'be quiet', 'go quiet', 'pause voice', 'voice off', 'आवाज़ बंद', 'बंद करो', 'चुप हो जाओ', 'आवाज बंद', 'voice बंद', 'थांब', 'शांत हो', 'आवाज थांबव'].some(w => l.includes(w))) return 'stop'
    if (['start voice', 'start listening', 'wake up', 'voice on', 'resume voice', 'आवाज़ चालू', 'शुरू करो', 'आवाज चालू करो', 'आवाज चालू', 'आवाज सुरू कर', 'चालू कर', 'voice चालू'].some(w => l.includes(w))) return 'start'
    return null
}

/* ─── Language command ─── */
export function parseLanguageCommand(text) {
    const l = text.toLowerCase()
    return ['change language', 'switch language', 'update language', 'language to',
        'switch to english', 'switch to hindi', 'switch to marathi',
        'change to english', 'change to hindi', 'change to marathi',
        'language english', 'language hindi', 'language marathi',
        'भाषा बदल', 'भाषा बदलो', 'अंग्रेजी में', 'हिंदी में', 'मराठी में',
        'इंग्लिश में बदलो', 'हिंदी में बदलो', 'मराठी में बदलो',
        'इंग्रजी मध्ये', 'हिंदी मध्ये', 'मराठी मध्ये'].some(w => l.includes(w))
}

export function parseLanguageChoice(text) {
    const l = text.toLowerCase()
    if (l.includes('english') || l.includes('अंग्रेजी') || l.includes('इंग्रजी') || l.includes('इंग्लिश')) return 'en'
    if (l.includes('hindi') || l.includes('हिन्दी') || l.includes('हिंदी')) return 'hi'
    if (l.includes('marathi') || l.includes('मराठी')) return 'mr'
    return null
}

/* ─── Speed command ─── */
export function parseSpeedCommand(text) {
    const l = text.toLowerCase()
    const specificMatch = text.match(/(?:speed|स्पी[ड]|वेग|velocity)\s*(?:to\s*)?(\d+(?:\.\d+)?)\s*x?/i)
    if (specificMatch) return { type: 'set', value: parseFloat(specificMatch[1]) }
    const setMatch = text.match(/(?:change|set|सेट)\s*(?:speed|स्पी[ड]|वेग)\s*(?:to\s*)?(\d+(?:\.\d+)?)/i)
    if (setMatch) return { type: 'set', value: parseFloat(setMatch[1]) }
    if (['slow down', 'decrease speed', 'reduce speed', 'speed down', 'slower', 'धीमा करो', 'धीमा कर', 'स्पीड कम करो', 'स्पीड कम', 'आवाज धीमी', 'हळू कर', 'वेग कमी कर', 'स्पीड कमी'].some(w => l.includes(w))) return { type: 'decrease' }
    if (['speed up', 'increase speed', 'faster', 'go faster', 'तेज करो', 'तेज कर', 'स्पीड बढ़ाओ', 'स्पीड बढ़ा', 'आवाज तेज', 'जलद कर', 'वेग वाढव', 'स्पीड वाढव'].some(w => l.includes(w))) return { type: 'increase' }
    return null
}

/* ─── Nav command ─── */
export function parseNavCommand(text) {
    const l = text.toLowerCase()
    if (l.includes('upload') || l.includes('अपलोड')) return 'upload'
    if (l.includes('summari') || l.includes('summarise') || l.includes('summary') || l.includes('सारांश')) return 'summarise'
    if (l.includes('assignment') || l.includes('असाइनमेंट')) return 'assignment'
    if (l.includes('planner') || l.includes('प्लानर') || l.includes('study plan')) return 'planner'
    if (l.includes('simplified') || l.includes('simple learning') || l.includes('सरल')) return 'simplified'
    if (l.includes('setting') || l.includes('सेटिंग')) return 'settings'
    if (l.includes('profile') || l.includes('प्रोफाइल') || l.includes('प्रोफ़ाइल')) return 'profile'
    // Dashboard / back — most robust matching
    if (l.includes('dashboard') || l.includes('home') || l.includes('go back') || l.includes('back') ||
        l.includes('main page') || l.includes('home page') || l.includes('take me back') ||
        l.includes('डैशबोर्ड') || l.includes('होम') || l.includes('डॅशबोर्ड') || l.includes('वापस') ||
        l.includes('वापस जाओ') || l.includes('पीछे') || l.includes('मागे') || l.includes('मागे जा') ||
        l.includes('घर') || l.includes('मुख्य')) return 'dashboard'
    return null
}

/* ─── Delete / Complete / Upload / Repeat / Add more ─── */
export function parseDeleteTaskCommand(text) {
    const l = text.toLowerCase()
    const triggers = ['delete task', 'remove task', 'काम हटाओ', 'काम डिलीट', 'डिलीट करो', 'हटाओ काम', 'काम काढ', 'डिलीट कर']
    if (!triggers.some(w => l.includes(w))) {
        const numMatch = l.match(/(?:delete|remove|हटाओ|काढ|डिलीट)\s*(\d+)/)
        if (numMatch) return parseInt(numMatch[1])
        return null
    }
    const numMatch = text.match(/(\d+)/)
    if (numMatch) return parseInt(numMatch[1])
    return 'ask'
}

export function parseCompleteTaskCommand(text) {
    const l = text.toLowerCase()
    const triggers = [
        'completed task', 'complete task', 'done with task', 'finished task', 'i have completed',
        'task done', 'mark done', 'mark complete',
        'काम पूरा', 'काम हो गया', 'काम ख़त्म', 'पूरा हो गया',
        'काम पूर्ण', 'काम झालं', 'काम संपलं',
    ]
    if (!triggers.some(w => l.includes(w))) {
        const numMatch = l.match(/(?:completed|complete|finished|done|पूरा|पूर्ण|झालं)\s*(\d+)/)
        if (numMatch) return parseInt(numMatch[1])
        return null
    }
    const numMatch = text.match(/(\d+)/)
    if (numMatch) return parseInt(numMatch[1])
    return 'ask'
}

export function parseRepeatCommand(text) {
    const l = text.toLowerCase()
    return ['repeat task', 'repeat my task', 'list task', 'my task', 'read task', 'what are my task',
        'काम दोहराओ', 'काम बताओ', 'मेरे काम', 'काम सुनाओ',
        'कामे सांग', 'माझी कामे', 'कामे वाच'].some(w => l.includes(w))
}

export function parseAddMoreCommand(text) {
    const l = text.toLowerCase()
    return ['add task', 'add more', 'new task', 'more task',
        'काम जोड़', 'और काम', 'नया काम',
        'काम जोड', 'नवीन काम', 'आणखी काम'].some(w => l.includes(w))
}

export function parseUploadCommand(text) {
    const l = text.toLowerCase()
    return l.includes('upload file') || l.includes('upload image') || l.includes('upload pdf') ||
        l.includes('फ़ाइल अपलोड') || l.includes('फाइल अपलोड') || l.includes('अपलोड करो') ||
        l.includes('फाइल अपलोड कर')
}

export function parseYesNo(text) {
    const l = text.toLowerCase().trim()
    // YES — simple includes matching (Indian English STT often returns 'is' for 'yes')
    if (['yes', 'yeah', 'yep', 'yup', 'sure', 'ok', 'okay', 'yah', 'ya',
        'of course', 'definitely', 'go ahead', 'do it', 'haan', 'haa',
        'हां', 'हाँ', 'ठीक है', 'होय', 'हो', 'करो', 'कर दो', 'हाँ जी'].some(w => l.includes(w))) return 'yes'
    // NO
    if (['no', 'nah', 'nope', 'cancel', "don't", 'dont', 'never',
        'नहीं', 'नाही', 'नको', 'रद्द', 'मत करो'].some(w => l.includes(w))) return 'no'
    // Short utterance guessing
    if (l.length < 6) {
        if (l.startsWith('y') || l.startsWith('हा') || l.startsWith('हो') || l === 'is') return 'yes'
        if (l.startsWith('n') || l.startsWith('ना') || l.startsWith('नह')) return 'no'
    }
    return null
}

export function isCommand(text) {
    return !!(parseVoiceToggle(text) || parseSpeedCommand(text) || parseLanguageCommand(text) ||
        parseUploadCommand(text) || parseNavCommand(text) || parseRepeatCommand(text) ||
        parseAddMoreCommand(text) || parseDeleteTaskCommand(text) || parseCompleteTaskCommand(text))
}

/* ─── Voice File Picker (uses showOpenFilePicker) ─── */
export async function voiceFilePicker(lang, speed, speakFn, acceptTypes) {
    if (!('showOpenFilePicker' in window)) {
        await speakFn(t(lang, 'fileBrowseNotSupported'), lang, speed)
        return null
    }

    await speakFn(t(lang, 'fileBrowseOpening'), lang, speed)

    try {
        const types = acceptTypes || [
            { description: 'Images & PDFs', accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'], 'application/pdf': ['.pdf'] } }
        ]
        const [fileHandle] = await window.showOpenFilePicker({ types, multiple: false, startIn: 'desktop' })
        const file = await fileHandle.getFile()
        await speakFn(t(lang, 'fileBrowseSelected', file.name), lang, speed)
        return file
    } catch {
        return null
    }
}

/* ─── Get localized file type announcement ─── */
export function getFileTypeAnnouncement(file, lang) {
    const name = file.name
    const type = file.type || ''
    if (type === 'application/pdf' || name.endsWith('.pdf')) return t(lang, 'fileSelectedPdf', name)
    if (type.startsWith('audio') || name.match(/\.(mp3|wav|ogg|aac|m4a)$/i)) return t(lang, 'fileSelectedAudio', name)
    if (type.startsWith('video') || name.match(/\.(mp4|webm|avi|mkv|mov)$/i)) return t(lang, 'fileSelectedVideo', name)
    return t(lang, 'fileSelectedImage', name)
}

/* ─── Sub-page voice command loop (for nav on any page) ─── */
export async function subPageCommandLoop(lang, speed, navigate, alive) {
    const routes = {
        dashboard: '/dashboard/vision', upload: '/dashboard/vision/upload',
        summarise: '/dashboard/vision/summarise', assignment: '/dashboard/vision/assignment',
        planner: '/dashboard/vision/planner', simplified: '/dashboard/vision/simplified',
        settings: '/dashboard/vision/settings', profile: '/dashboard/vision/profile',
    }
    const names = {
        dashboard: 'Dashboard', upload: 'Upload & Read', summarise: 'Summarise',
        assignment: 'Assignments', planner: 'Planner', simplified: 'Simple Learn',
        settings: 'Settings', profile: 'Profile',
    }

    // Small delay to let any ongoing TTS finish/cancel
    await new Promise(r => setTimeout(r, 500))

    while (alive.current) {
        try {
            const text = await listen(lang, 12000)
            console.log('[SubPage] Heard:', text)

            // Check voice toggle first
            if (parseVoiceToggle(text) === 'stop') {
                await speak(t(lang, 'voiceStopped'), lang, speed)
                while (alive.current) {
                    try {
                        const t2 = await listen(lang, 12000)
                        if (parseVoiceToggle(t2) === 'start') {
                            await speak(t(lang, 'voiceStarted'), lang, speed)
                            break
                        }
                    } catch { }
                }
                continue
            }

            // Check navigation
            const nav = parseNavCommand(text)
            if (nav && routes[nav]) {
                window.speechSynthesis?.cancel()
                if (nav === 'dashboard') {
                    await speak(t(lang, 'goBack'), lang, speed)
                } else {
                    await speak(t(lang, 'navigating', names[nav]), lang, speed)
                }
                navigate(routes[nav])
                return
            }
        } catch { /* timeout = no speech, keep listening */ }
    }
}

/* ─── API helpers ─── */
function getToken() { try { return localStorage.getItem('accessilearn_token') || '' } catch { return '' } }
function authHeaders() { return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` } }

export async function apiCreateTask(text, alertTime) {
    const r = await fetch(`${API}/tasks`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ text, alertTime }) })
    return r.json()
}
export async function apiGetTasks(date) {
    const d = date || new Date().toISOString().split('T')[0]
    const r = await fetch(`${API}/tasks?date=${d}`, { headers: authHeaders() })
    return r.json()
}
export async function apiDeleteTask(id) {
    const r = await fetch(`${API}/tasks/${id}`, { method: 'DELETE', headers: authHeaders() })
    return r.json()
}
export async function apiUpdateSpeed(speed) {
    const r = await fetch(`${API}/auth/speed`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ speed }) })
    return r.json()
}
export async function apiUpdateLanguage(language) {
    const r = await fetch(`${API}/auth/language`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ language }) })
    return r.json()
}
export async function apiUploadFile(file, language) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('language', language)
    const r = await fetch(`${API}/upload`, { method: 'POST', headers: { 'Authorization': `Bearer ${getToken()}` }, body: formData })
    return r.json()
}
export async function apiSummariseFile(file, language) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('language', language)
    const r = await fetch(`${API}/upload/summarise`, { method: 'POST', headers: { 'Authorization': `Bearer ${getToken()}` }, body: formData })
    return r.json()
}
export async function apiAssignmentBreakdown(file, language) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('language', language)
    const r = await fetch(`${API}/upload/assignment`, { method: 'POST', headers: { 'Authorization': `Bearer ${getToken()}` }, body: formData })
    return r.json()
}
export async function apiAssignmentBreakdownText(text, language) {
    const r = await fetch(`${API}/upload/assignment-text`, {
        method: 'POST',
        headers: { ...authHeaders() },
        body: JSON.stringify({ text, language })
    })
    return r.json()
}

export const langNames = { en: 'English', hi: 'हिन्दी', mr: 'मराठी' }

export function logVoices() {
    const voices = window.speechSynthesis?.getVoices() || []
    console.table(voices.map(v => ({ name: v.name, lang: v.lang, local: v.localService })))
    const mr = voices.find(v => v.lang === 'mr-IN')
    if (mr) console.log('✅ Marathi voice:', mr.name)
    else console.log('⚠️ No mr-IN voice. Install Marathi language pack.')
}
