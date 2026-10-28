// ============================================================
// ShikshaMitra AI — Multilingual (i18n) Engine
// Supported: English ('en'), Hindi ('hi'), Marathi ('mr')
// ============================================================

import type { Language } from './types';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  speechLocale: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    speechLocale: 'en-IN',
    flag: '🇮🇳',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिंदी',
    speechLocale: 'hi-IN',
    flag: '🇮🇳',
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    speechLocale: 'mr-IN',
    flag: '🇮🇳',
  },
];

export const UI_STRINGS = {
  // Navigation
  navDashboard: { en: 'Dashboard', hi: 'डैशबोर्ड', mr: 'डॅशबोर्ड' },
  navSubjects: { en: 'Subjects', hi: 'विषय', mr: 'विषय' },
  navTutor: { en: 'AI Tutor', hi: 'एआई शिक्षक', mr: 'एआय शिक्षक' },
  navDocuments: { en: 'My PDFs', hi: 'मेरी पीडीएफ', mr: 'माझी पीडीएफ' },
  navProgress: { en: 'Progress', hi: 'प्रगति', mr: 'प्रगती' },
  navSettings: { en: 'Settings', hi: 'सेटिंग्स', mr: 'सेटिंग्ज' },

  // Dashboard
  welcomeGreeting: { en: 'Welcome back', hi: 'नमस्ते', mr: 'स्वागत आहे' },
  demoGrade: { en: 'Grade 4 Demo', hi: 'कक्षा 4 डेमो', mr: 'इयत्ता 4 थी डेमो' },
  dayStreak: { en: 'Day streak', hi: 'दिनों का स्ट्रीक', mr: 'दिवसांची स्ट्रीक' },
  lessonsDone: { en: 'Lessons done', hi: 'पूरे किए गए पाठ', mr: 'पूर्ण केलेले धडे' },
  quizAverage: { en: 'Quiz average', hi: 'प्रश्नोत्तरी औसत', mr: 'क्विझ सरासरी' },
  todaysGoal: { en: "Today's Goal", hi: 'आज का लक्ष्य', mr: 'आजचे ध्येय' },
  recommendedForYou: { en: 'Recommended for You', hi: 'आपके लिए सुझाव', mr: 'तुमच्यासाठी शिफारस' },
  allSubjects: { en: 'Subjects', hi: 'सभी विषय', mr: 'सर्व विषय' },
  allLessons: { en: 'All Lessons', hi: 'सभी पाठ', mr: 'सर्व धडे' },
  continueLearning: { en: 'Continue Learning', hi: 'पढ़ाई जारी रखें', mr: 'शिकणे सुरू ठेवा' },
  startLesson: { en: 'Start', hi: 'शुरू करें', mr: 'सुरू करा' },
  completedBadge: { en: 'Completed', hi: 'पूर्ण हुआ', mr: 'पूर्ण झाले' },
  inProgressBadge: { en: 'In Progress', hi: 'प्रगति पर', mr: 'सुरू आहे' },

  // Lesson & Player
  videoLessonMode: { en: 'Animated Lesson', hi: 'एनिमेटेड पाठ', mr: 'अ‍ॅनिमेटेड धडा' },
  notesMode: { en: 'Short Notes & Summary', hi: 'संक्षिप्त नोट्स और सारांश', mr: 'थोडक्यात टिपा व सारांश' },
  practiceQuizBtn: { en: 'Start Practice Quiz', hi: 'अभ्यास क्विज़ शुरू करें', mr: 'सराव क्विझ सुरू करा' },
  askDoubtBtn: { en: 'Ask a Doubt', hi: 'शंका पूछें', mr: 'शंका विचारा' },
  markCompleteBtn: { en: 'Mark Complete', hi: 'पूर्ण चिह्नित करें', mr: 'पूर्ण म्हणून चिन्हांकित करा' },
  listenNarration: { en: 'Listen Narration', hi: 'आवाज़ सुनें', mr: 'आवाज ऐका' },
  pauseNarration: { en: 'Pause', hi: 'रोकें', mr: 'थांबवा' },
  replayNarration: { en: 'Replay', hi: 'फिर से सुनें', mr: 'पुन्हा ऐका' },
  speedLabel: { en: 'Speed', hi: 'गति', mr: 'गती' },
  teacherPersona: { en: 'Teacher', hi: 'शिक्षक', mr: 'शिक्षक' },
  ananyaMaam: { en: "Ananya Ma'am", hi: 'अनन्या मैम', mr: 'अनन्या मॅडम' },
  rahulSir: { en: 'Rahul Sir', hi: 'राहुल सर', mr: 'राहुल सर' },
  keyConceptsTitle: { en: 'Key Concepts to Remember', hi: 'महत्वपूर्ण बातें', mr: 'महत्त्वाचे मुद्दे' },
  realLifeExampleTitle: { en: 'Real-life Example', hi: 'दैनिक जीवन का उदाहरण', mr: 'दैनंदिन जीवनातील उदाहरण' },
  stepByStepTitle: { en: 'Step-by-Step Explanation', hi: 'क्रमबद्ध व्याख्या', mr: 'टप्प्याटप्प्याने स्पष्टीकरण' },
  quickKnowledgeCheck: { en: 'Quick Knowledge Check', hi: 'त्वरित ज्ञान परख', mr: 'झटपट ज्ञान चाचणी' },

  // In-Lesson Doubt
  doubtAssistantTitle: { en: 'In-Lesson Doubt Assistant', hi: 'पाठ शंका सहायक', mr: 'धडा शंका सहाय्यक' },
  doubtInputPlaceholder: {
    en: 'Ask anything about this step or lesson...',
    hi: 'इस चरण या पाठ के बारे में कुछ भी पूछें...',
    mr: 'या पायरी किंवा धड्याबद्दल काहीही विचारा...',
  },
  sendDoubtBtn: { en: 'Ask', hi: 'पूछें', mr: 'विचारा' },
  voiceInputBtn: { en: 'Speak', hi: 'बोलें', mr: 'बोला' },
  closeDoubtBtn: { en: 'Resume Lesson', hi: 'पाठ जारी रखें', mr: 'धडा सुरू ठेवा' },

  // PDF Document Learning
  pdfTitle: { en: 'Learn from Your Own PDF', hi: 'अपनी पीडीएफ से सीखें', mr: 'तुमच्या स्वतःच्या पीडीएफ मधून शिका' },
  pdfSubtitle: {
    en: 'Upload school notes, textbook chapters, or worksheets to get simple explanations, summaries, and quizzes.',
    hi: 'सरल व्याख्या, सारांश और क्विज़ प्राप्त करने के लिए स्कूल नोट्स या पाठ्यपुस्तक पीडीएफ अपलोड करें।',
    mr: 'सोपे स्पष्टीकरण, सारांश आणि क्विझ मिळवण्यासाठी शाळेच्या नोट्स किंवा पाठ्यपुस्तक पीडीएफ अपलोड करा.',
  },
  uploadPdfBtn: { en: 'Choose a PDF file', hi: 'पीडीएफ फाइल चुनें', mr: 'पीडीएफ फाइल निवडा' },
  pdfDragDrop: { en: 'or drag & drop here (Max 10MB)', hi: 'या यहाँ खींचकर छोड़ें (अधिकतम 10MB)', mr: 'किंवा येथे ड्रॅग आणि ड्रॉप करा (कमाल 10MB)' },
  pdfExtracting: { en: 'Extracting text from PDF...', hi: 'पीडीएफ से टेक्स्ट निकाला जा रहा है...', mr: 'पीडीएफ मधून मजकूर काढला जात आहे...' },
  pdfExplanationBtn: { en: 'Simple Explanation', hi: 'सरल व्याख्या', mr: 'सोपे स्पष्टीकरण' },
  pdfSummaryBtn: { en: 'Short Notes & Summary', hi: 'संक्षिप्त नोट्स', mr: 'थोडक्यात टिपा' },
  pdfQuizBtn: { en: 'Generate Practice Quiz', hi: 'क्विज़ बनाएं', mr: 'क्विझ तयार करा' },
  pdfAskDoubtBtn: { en: 'Ask Doubts on Document', hi: 'दस्तावेज़ पर प्रश्न पूछें', mr: 'दस्तऐवजावर प्रश्न विचारा' },

  // Quiz
  chooseDifficulty: { en: 'Choose Difficulty', hi: 'कठिनाई स्तर चुनें', mr: 'काठिण्य पातळी निवडा' },
  easyDifficulty: { en: 'Easy', hi: 'सरल', mr: 'सोपे' },
  mediumDifficulty: { en: 'Medium', hi: 'मध्यम', mr: 'मध्यम' },
  hardDifficulty: { en: 'Hard', hi: 'कठिन', mr: 'कठीण' },
  submitAnswer: { en: 'Submit Answer', hi: 'उत्तर जमा करें', mr: 'उत्तर सबमिट करा' },
  nextQuestion: { en: 'Next Question', hi: 'अगला प्रश्न', mr: 'पुढील प्रश्न' },
  seeResults: { en: 'See Results', hi: 'परिणाम देखें', mr: 'निकाल पहा' },
  reviewAnswers: { en: 'Review Answers', hi: 'उत्तरों की समीक्षा करें', mr: 'उत्तरांचे पुनरावलोकन करा' },
  tryAgain: { en: 'Try Again', hi: 'पुनः प्रयास करें', mr: 'पुन्हा प्रयत्न करा' },
  backToLesson: { en: 'Back to Lesson', hi: 'पाठ पर वापस जाएं', mr: 'धड्याकडे परत जा' },

  // AI Tutor
  tutorTitle: { en: 'ShikshaMitra AI Tutor', hi: 'शिक्षा मित्र एआई शिक्षक', mr: 'शिक्षामित्र एआय शिक्षक' },
  tutorSubtitle: {
    en: 'Ask questions about your active lesson. I explain step-by-step!',
    hi: 'अपने सक्रिय पाठ के बारे में पूछें। मैं क्रमबद्ध समझाऊंगा!',
    mr: 'तुमच्या चालू धड्याबद्दल विचारा. मी टप्प्याटप्प्याने समजावून सांगेन!',
  },
  tutorInputPlaceholder: {
    en: 'Ask a question about this lesson... (or click the mic)',
    hi: 'इस पाठ के बारे में एक प्रश्न पूछें... (या माइक पर क्लिक करें)',
    mr: 'या धड्याबद्दल प्रश्न विचारा... (किंवा माइकवर क्लिक करा)',
  },
  listeningNow: { en: 'Listening... Speak now', hi: 'सुन रहे हैं... अब बोलें', mr: 'ऐकत आहे... आता बोला' },
  stopListening: { en: 'Stop', hi: 'रोकें', mr: 'थांबवा' },
  speakAnswer: { en: 'Read Aloud', hi: 'बोलकर सुनाएं', mr: 'वाचून दाखवा' },
  stopSpeaking: { en: 'Stop Audio', hi: 'आवाज रोकें', mr: 'आवाज थांबवा' },
  clearChat: { en: 'Clear Chat', hi: 'चैट साफ करें', mr: 'चॅट साफ करा' },

  // Offline
  offlineNotice: {
    en: 'You are offline — bundled lessons and quizzes still work!',
    hi: 'आप ऑफ़लाइन हैं — लोड किए गए पाठ और क्विज़ अभी भी काम कर रहे हैं!',
    mr: 'तुम्ही ऑफलाइन आहात — सेव्ह केलेले धडे आणि क्विझ चालू राहतील!',
  },

  // Additional Dashboard & General Strings
  resumeBtn: { en: 'Resume', hi: 'जारी रखें', mr: 'सुरू ठेवा' },
  startBtn: { en: 'Start', hi: 'शुरू करें', mr: 'सुरू करा' },
  reviewAnytime: { en: 'Completed · Review anytime', hi: 'पूर्ण हुआ · कभी भी दोहराएं', mr: 'पूर्ण झाले · कधीही उजळणी करा' },
  pickUpLeftOff: { en: 'In progress · Pick up where you left off', hi: 'जारी है · जहाँ छोड़ा था वहीं से शुरू करें', mr: 'सुरू आहे · जिथे थांबलात तिथून पुढे जा' },
  uploadPdfDesc: {
    en: 'Upload your school notes or homework PDF to get simple summaries, key concepts, and quizzes!',
    hi: 'सरल सारांश, मुख्य बिंदु और क्विज़ प्राप्त करने के लिए स्कूल नोट्स या होमवर्क पीडीएफ अपलोड करें!',
    mr: 'सोपे सारांश, महत्त्वाचे मुद्दे आणि क्विझ मिळवण्यासाठी शाळेच्या नोट्स किंवा गृहपाठ पीडीएफ अपलोड करा!',
  },
  openTutorDesc: {
    en: 'Have a doubt? Ask by voice or typing! Your AI teacher explains step by step in Hindi, Marathi, or English.',
    hi: 'कोई शंका है? बोलकर या लिखकर पूछें! शिक्षक हिंदी, मराठी या अंग्रेज़ी में समझाएंगे।',
    mr: 'काही शंका आहे? बोलून किंवा टाईप करून विचारा! शिक्षक मराठी, हिंदी किंवा इंग्रजीत समजावून सांगतील.',
  },
  openTutorBtn: { en: 'Open Tutor', hi: 'शिक्षक से पूछें', mr: 'शिक्षकांना विचारा' },
  retryQuiz: { en: 'Retry Quiz', hi: 'क्विज़ पुनः करें', mr: 'क्विझ पुन्हा सोडवा' },
  continueBtn: { en: 'Continue', hi: 'जारी रखें', mr: 'पुढे सुरू ठेवा' },
  goalComplete: { en: '🎉 Goal complete! Great work today!', hi: '🎉 आज का लक्ष्य पूरा हुआ! बहुत बढ़िया काम!', mr: '🎉 आजचे ध्येय पूर्ण झाले! उत्तम कामगिरी!' },
  lessonsUnit: { en: 'lessons', hi: 'पाठ', mr: 'धडे' },
  easyDesc: { en: 'Basic understanding & recognition', hi: 'मूलभूत समझ और पहचान', mr: 'मूलभूत समज आणि ओळख' },
  mediumDesc: { en: 'Applying concepts to examples', hi: 'अवधारणाओं को उदाहरणों में लागू करना', mr: 'संकल्पनांचा उदाहरणांमध्ये वापर' },
  hardDesc: { en: 'Multi-step reasoning challenge', hi: 'बहु-चरणीय तार्किक चुनौती', mr: 'टप्प्याटप्प्याने विचार करण्याचे आव्हान' },
  voiceMissingNotice: {
    en: 'Native voice for this language is not installed on your browser/device. Displaying subtitles and captions on screen.',
    hi: 'इस भाषा की आवाज़ आपके डिवाइस पर स्थापित नहीं है। स्क्रीन पर सबटाइटल दिखाए जा रहे हैं।',
    mr: 'या भाषेचा आवाज तुमच्या डिव्हाइसवर उपलब्ध नाही. स्क्रीनवर मथळे दाखवले जात आहेत.',
  },
  ocrExtracting: { en: 'Running OCR on scanned pages...', hi: 'स्कैन किए गए पन्नों पर ओसीआर चलाया जा रहा है...', mr: 'स्कॅन केलेल्या पानांवर ओसीआर चालवले जात आहे...' },
  ocrSuccess: { en: 'Text extracted via OCR', hi: 'ओसीआर द्वारा टेक्स्ट निकाला गया', mr: 'ओसीआर द्वारे मजकूर काढला गेला' },
  reviewExtractedText: { en: 'Review & Edit Extracted Text', hi: 'निकाले गए टेक्स्ट की समीक्षा और संपादन करें', mr: 'काढलेल्या मजकुराचे पुनरावलोकन आणि संपादन करा' },
  generateLessonFromPdf: { en: 'Generate Interactive Video Lesson', hi: 'इंटरैक्टिव वीडियो पाठ बनाएं', mr: 'परस्परसंवादी व्हिडिओ धडा तयार करा' },
  recentQuizScores: { en: 'Recent Quiz Scores', hi: 'हाल के क्विज़ अंक', mr: 'नुकतेच क्विझ गुण' },
  thisWeek: { en: 'This Week', hi: 'इस सप्ताह', mr: 'या आठवड्यात' },
  browseAll: { en: 'Browse all', hi: 'सभी देखें', mr: 'सर्व पहा' },
  uploadPdfCardBtn: { en: 'Upload PDF', hi: 'पीडीएफ अपलोड करें', mr: 'पीडीएफ अपलोड करा' },
  gradeLabel: { en: 'Grade', hi: 'कक्षा', mr: 'इयत्ता' },
  minLabel: { en: 'min', hi: 'मिनट', mr: 'मि' },
  reachGoalPrefix: { en: 'Complete', hi: 'लक्ष्य पाने के लिए', mr: 'ध्येय गाठण्यासाठी अजून' },
  reachGoalSuffix: { en: 'more lesson(s) to reach today’s goal', hi: 'और पाठ पूरे करें', mr: 'धडा/धडे पूर्ण करा' },
} as const;

export type TranslationKey = keyof typeof UI_STRINGS;

export function t(key: TranslationKey, lang: Language = 'en'): string {
  const item = UI_STRINGS[key];
  if (!item) return key;
  return item[lang] || item.en;
}
