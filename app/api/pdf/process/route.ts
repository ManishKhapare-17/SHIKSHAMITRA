import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Language, QuizQuestion, Lesson, SubjectId, Difficulty } from '@/lib/types';

interface ProcessRequest {
  text: string;
  fileName: string;
  language?: Language;
}

interface ProcessResponse {
  title: string;
  subjectId: SubjectId;
  explanation: string;
  summary: string;
  keyConcepts: string[];
  realLifeExamples: string[];
  quiz: QuizQuestion[];
  generatedLesson?: Lesson;
  isAiGenerated: boolean;
}

function detectSubjectFromText(text: string): SubjectId {
  const lower = text.toLowerCase();
  const mathKeywords = ['fraction', 'denominator', 'numerator', 'multiply', 'division', 'addition', 'subtract', 'triangle', 'geometry', 'perimeter', 'area', 'angle', 'decimal', 'equation', 'digit', 'number'];
  const englishKeywords = ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'sentence', 'grammar', 'paragraph', 'rhyme', 'poem', 'tense', 'punctuation', 'vowel'];

  const mathMatches = mathKeywords.filter((k) => lower.includes(k)).length;
  const englishMatches = englishKeywords.filter((k) => lower.includes(k)).length;

  if (mathMatches > englishMatches && mathMatches > 0) return 'mathematics';
  if (englishMatches > mathMatches && englishMatches > 0) return 'english';
  return 'science';
}

function generateFallbackLesson(
  cleanTitle: string,
  subjectId: SubjectId,
  paragraphs: string[],
  sentences: string[],
  keyConcepts: string[],
  realLifeExamples: string[],
  quizQuestions: QuizQuestion[]
): Lesson {
  const lessonId = `doc-lesson-${Date.now().toString(36)}`;
  const p1 = paragraphs[0] || 'In this lesson, we explore the fundamental ideas presented in your study document.';
  const p2 = paragraphs[1] || paragraphs[0] || 'Understanding how each concept connects helps us solve problems step by step.';
  const p3 = paragraphs[2] || paragraphs[1] || 'We can find many examples of this topic in our everyday environment and daily routines.';

  const isDevanagari = (str: string) => /[\u0900-\u097F]/.test(str);

  const step1Hi = isDevanagari(p1)
    ? p1
    : `नमस्ते बच्चों! आज हम ${cleanTitle} के बारे में समझेंगे। इस पाठ में हम इस विषय के मुख्य सिद्धांतों और बुनियादी अवधारणाओं को सरल तरीके से सीखेंगे।`;
  const step1HiNarr = isDevanagari(p1)
    ? p1
    : `नमस्ते बच्चों! आज हम ${cleanTitle} के बारे में समझेंगे। ध्यान से सुनिए, हम इस पाठ के महत्वपूर्ण नियमों और आवश्यक बातों को बहुत आसान भाषा में सीखेंगे।`;
  const step1Mr = isDevanagari(p1)
    ? p1
    : `नमस्कार मुलांनो! आज आपण ${cleanTitle} बद्दल शिकणार आहोत. या धड्यात आपण या विषयाचे मुख्य नियम आणि मूलभूत संकल्पना सोप्या पद्धतीने शिकू.`;
  const step1MrNarr = isDevanagari(p1)
    ? p1
    : `नमस्कार मुलांनो! आज आपण ${cleanTitle} बद्दल शिकणार आहोत. लक्षपूर्वक ऐका, आपण या पाठातील महत्त्वाचे नियम आणि मूलभूत गोष्टी अतिशय सोप्या भाषेत शिकणार आहोत.`;

  const step2Hi = isDevanagari(p2)
    ? p2
    : `आइए अब इसके मुख्य नियमों और उदाहरणों को समझें। जब हम हर बिंदु को ध्यान से देखते हैं, तो कठिन विषय भी बहुत सरल और आसान लगने लगता है।`;
  const step2HiNarr = isDevanagari(p2)
    ? p2
    : `आइए अब इसके मुख्य नियमों और उदाहरणों को समझें। हर संकल्पना को समझने के लिए हमारे आसपास के उदाहरणों को देखना बहुत मददगार होता है।`;
  const step2Mr = isDevanagari(p2)
    ? p2
    : `आता याचे मुख्य नियम आणि उदाहरणे समजून घेऊया. जेव्हा आपण प्रत्येक मुद्दा लक्षपूर्वक अभ्यासतो, तेव्हा कठीण संकल्पनाही अगदी सोपी आणि स्पष्ट होते.`;
  const step2MrNarr = isDevanagari(p2)
    ? p2
    : `आता याचे मुख्य नियम आणि उदाहरणे समजून घेऊया. प्रत्येक संकल्पना चांगल्या प्रकारे समजण्यासाठी दैनंदिन जीवनातील उदाहरणे पाहणे खूप उपयुक्त ठरते.`;

  const step3Hi = isDevanagari(p3)
    ? p3
    : `हम इस ज्ञान का उपयोग अपने दैनिक जीवन में कैसे करते हैं? नियमित अभ्यास और अवलोकन से आपकी समझ और मजबूत होगी।`;
  const step3HiNarr = isDevanagari(p3)
    ? p3
    : `बहुत बढ़िया! इस विषय को याद रखने के लिए सोचें कि यह हमारे दैनिक जीवन और आसपास कहाँ दिखाई देता है। नियमित अभ्यास से आपकी समझ और मजबूत होगी।`;
  const step3Mr = isDevanagari(p3)
    ? p3
    : `आपण या ज्ञानाचा उपयोग दैनंदिन जीवनात कसा करतो? सातत्यपूर्ण सरावाने आणि निरीक्षणाने तुमचा अभ्यास अधिक पक्का होईल.`;
  const step3MrNarr = isDevanagari(p3)
    ? p3
    : `खूप छान! हा विषय लक्षात ठेवण्यासाठी विचार करा की हा आपल्या दैनंदिन जीवनात आणि सभोवताली कोठे आढळतो. नियमित सरावाने तुमचा अभ्यास अधिक पक्का होईल.`;

  return {
    id: lessonId,
    subjectId,
    grade: 4,
    title: cleanTitle,
    titleTranslations: {
      en: cleanTitle,
      hi: `${cleanTitle} (दस्तावेज़ पाठ)`,
      mr: `${cleanTitle} (दस्तऐवज धडा)`,
    },
    summary: sentences.slice(0, 2).join(' ') || `Study notes and concepts from ${cleanTitle}.`,
    summaryTranslations: {
      en: sentences.slice(0, 2).join(' ') || `Study notes and concepts from ${cleanTitle}.`,
      hi: `इस पाठ में ${cleanTitle} के मुख्य सिद्धांतों और उदाहरणों को सरल भाषा में समझाया गया है।`,
      mr: `या धड्यात ${cleanTitle} चे मुख्य मुद्दे आणि उदाहरणे सोप्या भाषेत स्पष्ट केली आहेत.`,
    },
    objectives: [
      {
        id: 'obj-1',
        description: `Understand the core principles and definitions of ${cleanTitle}.`,
        descriptionTranslations: {
          en: `Understand the core principles and definitions of ${cleanTitle}.`,
          hi: `${cleanTitle} के मूलभूत सिद्धांतों और परिभाषाओं को समझें।`,
          mr: `${cleanTitle} ची मूलभूत तत्त्वे आणि व्याख्या समजून घ्या.`,
        },
      },
      {
        id: 'obj-2',
        description: `Identify real-life applications and examples of this topic.`,
        descriptionTranslations: {
          en: `Identify real-life applications and examples of this topic.`,
          hi: `इस विषय के दैनिक जीवन में अनुप्रयोगों और उदाहरणों को पहचानें।`,
          mr: `या विषयाचे दैनंदिन जीवनातील उपयोग आणि उदाहरणे ओळखा.`,
        },
      },
    ],
    explanation: paragraphs.slice(0, 3).join('\n\n'),
    realLifeExample: realLifeExamples[0] || `Think about how "${cleanTitle}" relates to items you see at home or school!`,
    realLifeExampleTranslations: {
      en: realLifeExamples[0] || `Think about how "${cleanTitle}" relates to items you see at home or school!`,
      hi: `सोचें कि "${cleanTitle}" आपके घर या स्कूल में देखी जाने वाली चीज़ों से कैसे जुड़ा है!`,
      mr: `विचार करा की "${cleanTitle}" तुमच्या घरी किंवा शाळेत दिसणाऱ्या गोष्टींशी कसे जोडलेले आहे!`,
    },
    steps: [
      {
        title: 'Step 1: Introduction to the Topic',
        titleTranslations: {
          en: 'Step 1: Introduction to the Topic',
          hi: 'चरण 1: विषय का परिचय',
          mr: 'पायरी 1: विषयाची ओळख',
        },
        content: p1,
        contentTranslations: {
          en: p1,
          hi: step1Hi,
          mr: step1Mr,
        },
        narrationText: {
          en: `Hello students! Today we are learning about ${cleanTitle}. ${p1}`,
          hi: step1HiNarr,
          mr: step1MrNarr,
        },
        example: realLifeExamples[0],
        visualDescription: `Illustrated overview diagram representing ${cleanTitle}`,
      },
      {
        title: 'Step 2: Core Concepts & Details',
        titleTranslations: {
          en: 'Step 2: Core Concepts & Details',
          hi: 'चरण 2: मुख्य अवधारणाएँ और विस्तार',
          mr: 'पायरी 2: मुख्य संकल्पना आणि तपशील',
        },
        content: p2,
        contentTranslations: {
          en: p2,
          hi: step2Hi,
          mr: step2Mr,
        },
        narrationText: {
          en: `Now let us look at the key rules and steps. ${p2}`,
          hi: step2HiNarr,
          mr: step2MrNarr,
        },
        example: realLifeExamples[1] || realLifeExamples[0],
        visualDescription: `Detailed schematic diagram highlighting key terms: ${keyConcepts.slice(0, 2).join(', ')}`,
      },
      {
        title: 'Step 3: Real-World Applications & Summary',
        titleTranslations: {
          en: 'Step 3: Real-World Applications & Summary',
          hi: 'चरण 3: दैनिक जीवन में उपयोग और सारांश',
          mr: 'पायरी 3: दैनंदिन जीवनातील उपयोग आणि सारांश',
        },
        content: p3,
        contentTranslations: {
          en: p3,
          hi: step3Hi,
          mr: step3Mr,
        },
        narrationText: {
          en: `Great work! To remember this topic, think about where it appears in nature and daily life. ${p3}`,
          hi: step3HiNarr,
          mr: step3MrNarr,
        },
        example: realLifeExamples[0],
        visualDescription: `Interactive real-life connection illustration showing practical applications`,
      },
    ],
    knowledgeCheck: {
      question: quizQuestions[0]?.question || `What is the main topic of this document?`,
      questionTranslations: {
        en: quizQuestions[0]?.question || `What is the main topic of this document?`,
        hi: `इस दस्तावेज़ का मुख्य विषय क्या है?`,
        mr: `या दस्तऐवजाचा मुख्य विषय काय आहे?`,
      },
      options: quizQuestions[0]?.options.map((o) => o.text) || [cleanTitle, 'None of the above', 'Other', 'Unknown'],
      optionsTranslations: {
        en: quizQuestions[0]?.options.map((o) => o.text) || [cleanTitle, 'None of the above', 'Other', 'Unknown'],
        hi: [cleanTitle, 'इनमें से कोई नहीं', 'अन्य', 'अज्ञात'],
        mr: [cleanTitle, 'यांपैकी काहीही नाही', 'इतर', 'अज्ञात'],
      },
      correctIndex: 0,
      explanation: quizQuestions[0]?.explanation || `This document specifically focuses on ${cleanTitle}.`,
      explanationTranslations: {
        en: quizQuestions[0]?.explanation || `This document specifically focuses on ${cleanTitle}.`,
        hi: `यह दस्तावेज़ विशेष रूप से ${cleanTitle} पर केंद्रित है।`,
        mr: `हा दस्तऐवज विशेषतः ${cleanTitle} वर आधारित आहे.`,
      },
    },
    shortNotes: {
      summary: paragraphs.slice(0, 2).join(' ') || `Summary notes for ${cleanTitle}.`,
      summaryTranslations: {
        en: paragraphs.slice(0, 2).join(' ') || `Summary notes for ${cleanTitle}.`,
        hi: `संक्षिप्त सारांश: ${cleanTitle} के मुख्य बिंदु और महत्वपूर्ण परिभाषाएँ।`,
        mr: `थोडक्यात सारांश: ${cleanTitle} चे मुख्य मुद्दे आणि महत्त्वाच्या व्याख्या.`,
      },
      keyPoints: sentences.slice(0, 4).map((s) => s.trim()),
      keyPointsTranslations: {
        en: sentences.slice(0, 4).map((s) => s.trim()),
        hi: [
          `• ${cleanTitle} के मुख्य सिद्धांतों को समझें और याद रखें।`,
          `• पाठ में दिए गए आवश्यक नियमों का अभ्यास करें।`,
          `• दैनिक जीवन में दिखने वाले उदाहरणों से संकल्पना स्पष्ट करें।`,
          `• नियमित पुनरावलोकन से अपनी समझ को मजबूत बनाएं।`,
        ],
        mr: [
          `• ${cleanTitle} ची मुख्य तत्त्वे समजून घ्या आणि लक्षात ठेवा.`,
          `• पाठातील महत्त्वाच्या नियमांचा सराव करा.`,
          `• दैनंदिन जीवनातील उदाहरणांच्या मदतीने संकल्पना स्पष्ट करा.`,
          `• नियमित उजळणी करून आपला अभ्यास अधिक पक्का करा.`,
        ],
      },
      definitions: keyConcepts.map((k) => {
        const parts = k.split(':');
        return {
          term: parts[0]?.trim() || 'Concept',
          meaning: parts[1]?.trim() || 'Essential concept explained in this document.',
        };
      }),
      rememberTip: `Always break down complex concepts into small, observable everyday steps!`,
      rememberTipTranslations: {
        en: `Always break down complex concepts into small, observable everyday steps!`,
        hi: `हमेशा कठिन विषयों को छोटे और समझने योग्य चरणों में बाँटकर सीखें!`,
        mr: `नेहमी कठीण संकल्पनांना लहान आणि समजण्याजोग्या पायऱ्यांमध्ये विभागून शिका!`,
      },
    },
    quizId: `quiz-doc-${Date.now().toString(36)}`,
    durationMinutes: 5,
    tags: ['pdf-generated', subjectId],
  };
}

function generateFallbackLearningContent(
  text: string,
  fileName: string,
  language: Language
): ProcessResponse {
  const cleanTitle = fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const subjectId = detectSubjectFromText(text);

  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter((p) => p.length > 20);

  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter((s) => s.length > 15 && s.length < 160);

  const summaryBullets = sentences.slice(0, 4).map((s) => `• ${s}.`);
  const summaryText = summaryBullets.length > 0
    ? summaryBullets.join('\n\n')
    : `• ${paragraphs[0] || 'Important concept from your document'}.`;

  const words = text.match(/[A-Z][a-z]{3,}/g) || ['Concept', 'Learning', 'Topic'];
  const uniqueWords = Array.from(new Set(words)).slice(0, 3);
  const keyConcepts = uniqueWords.map(
    (w) => `${w}: An essential concept covered in your notes.`
  );

  const realLifeExamples = [
    `Think about how "${cleanTitle}" connects to what you see every day at home or school!`,
    `Notice where this topic appears in nature or during everyday activities with your friends.`,
  ];

  const primaryExplanation = paragraphs.slice(0, 3).join('\n\n') || text.slice(0, 500);

  // Generate 3 comprehension questions with difficulty tags
  const quiz: QuizQuestion[] = [];
  const candidateSentences = sentences.slice(0, 3);
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

  candidateSentences.forEach((sentence, idx) => {
    const diff = difficulties[idx] || 'medium';
    quiz.push({
      id: `doc-q${idx + 1}`,
      lessonId: 'pdf-document',
      difficulty: diff,
      question: language === 'hi'
        ? `दस्तावेज़ के अनुसार, इनमें से कौन सा कथन सही है?`
        : language === 'mr'
        ? `दस्तऐवजानुसार, खालीलपैकी कोणते विधान बरोबर आहे?`
        : `According to your document, which of these statements is correct?`,
      options: [
        { id: 'a', text: sentence },
        { id: 'b', text: language === 'hi' ? 'यह कथन दस्तावेज़ में नहीं दिया गया है।' : language === 'mr' ? 'हे विधान दस्तऐवजात दिलेले नाही.' : 'This statement was not mentioned in the text.' },
        { id: 'c', text: language === 'hi' ? 'उपरोक्त के विपरीत।' : language === 'mr' ? 'वरील विधानाच्या उलट.' : 'The opposite of this occurs.' },
        { id: 'd', text: language === 'hi' ? 'इनमें से कोई नहीं।' : language === 'mr' ? 'यांपैकी काहीही नाही.' : 'None of the above.' },
      ],
      correctOptionId: 'a',
      explanation: language === 'hi'
        ? `यह जानकारी सीधे आपके अपलोड किए गए दस्तावेज़ से ली गई है: "${sentence}".`
        : language === 'mr'
        ? `ही माहिती थेट तुमच्या अपलोड केलेल्या दस्तऐवजातून घेतली आहे: "${sentence}".`
        : `This fact comes directly from your uploaded document: "${sentence}".`,
      incorrectExplanation: language === 'hi'
        ? `दस्तावेज़ को ध्यान से पढ़ें: "${sentence}".`
        : language === 'mr'
        ? `दस्तऐवज काळजीपूर्वक वाचा: "${sentence}".`
        : `Review the document carefully: "${sentence}".`,
    });
  });

  if (quiz.length === 0) {
    quiz.push({
      id: 'doc-q1',
      lessonId: 'pdf-document',
      difficulty: 'easy',
      question: `What is the primary subject of "${cleanTitle}"?`,
      options: [
        { id: 'a', text: `The concepts and facts described in ${cleanTitle}` },
        { id: 'b', text: 'Unrelated general knowledge' },
        { id: 'c', text: 'Fictional story facts' },
        { id: 'd', text: 'None of the above' },
      ],
      correctOptionId: 'a',
      explanation: `This document focuses on the study of ${cleanTitle}.`,
      incorrectExplanation: `Check the title and main content of ${cleanTitle}.`,
    });
  }

  const generatedLesson = generateFallbackLesson(
    cleanTitle,
    subjectId,
    paragraphs,
    sentences,
    keyConcepts,
    realLifeExamples,
    quiz
  );

  return {
    title: cleanTitle,
    subjectId,
    explanation: primaryExplanation,
    summary: summaryText,
    keyConcepts,
    realLifeExamples,
    quiz,
    generatedLesson,
    isAiGenerated: false,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ProcessRequest;
    const { text, fileName, language = 'en' } = body;

    if (!text || typeof text !== 'string' || text.trim().length < 15) {
      return NextResponse.json(
        { error: 'Document text must contain at least 15 characters of readable content.' },
        { status: 400 }
      );
    }

    const safeLanguage: Language = ['en', 'hi', 'mr'].includes(language) ? language : 'en';
    const sampleText = text.slice(0, 20000); // Process up to first 20k characters

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      const fallback = generateFallbackLearningContent(sampleText, fileName, safeLanguage);
      return NextResponse.json(fallback);
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.3,
          responseMimeType: 'application/json',
        },
      });

      const prompt = `You are a supportive, friendly primary school teacher helping a 4th-grade student understand this study document: "${fileName}".
Carefully read the extracted text:
"""
${sampleText}
"""

Generate a complete, structured learning breakdown in strict JSON adhering exactly to this schema:
{
  "title": "Short, clear topic title",
  "subjectId": "science" or "mathematics" or "english",
  "explanation": "Clear, friendly step-by-step explanation for a 9-10 year old with 2-3 short paragraphs in English.",
  "summary": "Short revision notes: 4-5 bullet points highlighting the core concepts in English.",
  "keyConcepts": [
    "Key Term 1: simple definition",
    "Key Term 2: simple definition",
    "Key Term 3: simple definition"
  ],
  "realLifeExamples": [
    "Everyday example 1 showing where this happens in daily life",
    "Everyday example 2 showing a relatable situation"
  ],
  "steps": [
    {
      "title": "Step 1: Introduction",
      "titleHi": "चरण 1: परिचय",
      "titleMr": "पायरी 1: ओळख",
      "narrationEn": "Warm, child-friendly spoken explanation for step 1 in English.",
      "narrationHi": "सरल और स्पष्ट हिंदी में चरण 1 का भाषण।",
      "narrationMr": "सोप्या मराठीत पायरी 1 चे कथन.",
      "example": "Daily life example for step 1",
      "visualDescription": "Description of the visual illustration"
    },
    {
      "title": "Step 2: Core Concept",
      "titleHi": "चरण 2: मुख्य सिद्धांत",
      "titleMr": "पायरी 2: मुख्य संकल्पना",
      "narrationEn": "Step-by-step spoken explanation for step 2 in English.",
      "narrationHi": "सरल और स्पष्ट हिंदी में चरण 2 का भाषण।",
      "narrationMr": "सोप्या मराठीत पायरी 2 चे कथन.",
      "example": "Daily life example for step 2",
      "visualDescription": "Description of the visual illustration"
    },
    {
      "title": "Step 3: Summary & Application",
      "titleHi": "चरण 3: दैनिक उपयोग",
      "titleMr": "पायरी 3: दैनंदिन उपयोग",
      "narrationEn": "Concluding encouragement and application in English.",
      "narrationHi": "सरल और स्पष्ट हिंदी में चरण 3 का भाषण।",
      "narrationMr": "सोप्या मराठीत पायरी 3 चे कथन.",
      "example": "Daily life example for step 3",
      "visualDescription": "Description of the visual illustration"
    }
  ],
  "quiz": [
    {
      "id": "q1",
      "difficulty": "easy",
      "question": "Easy multiple-choice question testing basic understanding",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctOptionIndex": 0,
      "explanation": "Simple explanation why this answer is correct"
    },
    {
      "id": "q2",
      "difficulty": "medium",
      "question": "Medium multiple-choice question testing concept application",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctOptionIndex": 1,
      "explanation": "Simple explanation"
    },
    {
      "id": "q3",
      "difficulty": "hard",
      "question": "Challenging multiple-choice question testing deeper understanding",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctOptionIndex": 2,
      "explanation": "Simple explanation"
    }
  ]
}`;

      const result = await model.generateContent(prompt);
      const rawText = result.response.text();

      const parsed = JSON.parse(rawText) as {
        title?: string;
        subjectId?: string;
        explanation?: string;
        summary?: string;
        keyConcepts?: string[];
        realLifeExamples?: string[];
        steps?: Array<{
          title: string;
          titleHi?: string;
          titleMr?: string;
          narrationEn: string;
          narrationHi?: string;
          narrationMr?: string;
          example?: string;
          visualDescription?: string;
        }>;
        quiz?: Array<{
          id?: string;
          difficulty?: Difficulty;
          question: string;
          options: string[];
          correctOptionIndex: number;
          explanation: string;
        }>;
      };

      if (!parsed.explanation || !parsed.quiz || !Array.isArray(parsed.quiz)) {
        throw new Error('Incomplete response structure from AI model');
      }

      const cleanTitle = parsed.title || fileName.replace(/\.[^/.]+$/, '');
      const subjectId: SubjectId = ['mathematics', 'science', 'english'].includes(parsed.subjectId as SubjectId)
        ? (parsed.subjectId as SubjectId)
        : detectSubjectFromText(sampleText);

      const letterIds = ['a', 'b', 'c', 'd'];
      const mappedQuiz: QuizQuestion[] = parsed.quiz.map((q, idx) => {
        const rawOptions = Array.isArray(q.options) && q.options.length >= 2 ? q.options : ['Yes', 'No'];
        const options = rawOptions.map((optText, oIdx) => ({
          id: letterIds[oIdx] || `opt-${oIdx}`,
          text: optText,
        }));
        const correctIndex =
          typeof q.correctOptionIndex === 'number' &&
          q.correctOptionIndex >= 0 &&
          q.correctOptionIndex < options.length
            ? q.correctOptionIndex
            : 0;

        return {
          id: q.id || `doc-ai-q${idx + 1}`,
          lessonId: 'pdf-document',
          difficulty: q.difficulty || (idx === 0 ? 'easy' : idx === 1 ? 'medium' : 'hard'),
          question: q.question,
          options,
          correctOptionId: options[correctIndex]?.id || 'a',
          explanation: q.explanation || 'Great job understanding this concept!',
          incorrectExplanation: 'Review the explanation section for this document.',
        };
      });

      // Construct Lesson object from AI generated scenes
      const generatedLesson: Lesson = {
        id: `doc-lesson-${Date.now().toString(36)}`,
        subjectId,
        grade: 4,
        title: cleanTitle,
        titleTranslations: {
          en: cleanTitle,
          hi: `${cleanTitle} (दस्तावेज़ पाठ)`,
          mr: `${cleanTitle} (दस्तऐवज धडा)`,
        },
        summary: parsed.summary || 'Summary generated from your uploaded document.',
        summaryTranslations: {
          en: parsed.summary || 'Summary generated from your uploaded document.',
          hi: `इस पाठ में ${cleanTitle} के मुख्य सिद्धांतों को सरल भाषा में समझाया गया है।`,
          mr: `या धड्यात ${cleanTitle} चे मुख्य मुद्दे सोप्या भाषेत स्पष्ट केले आहेत.`,
        },
        objectives: [
          {
            id: 'obj-1',
            description: `Understand the key facts and concepts presented in ${cleanTitle}.`,
          },
        ],
        explanation: parsed.explanation,
        realLifeExample: parsed.realLifeExamples?.[0] || 'Observe where this occurs in your home or school!',
        steps: Array.isArray(parsed.steps) && parsed.steps.length > 0
          ? parsed.steps.map((st, sIdx) => ({
              title: st.title || `Step ${sIdx + 1}`,
              titleTranslations: {
                en: st.title || `Step ${sIdx + 1}`,
                hi: st.titleHi || `चरण ${sIdx + 1}`,
                mr: st.titleMr || `पायरी ${sIdx + 1}`,
              },
              content: st.narrationEn,
              contentTranslations: {
                en: st.narrationEn,
                hi: st.narrationHi && /[\u0900-\u097F]/.test(st.narrationHi) ? st.narrationHi : `नमस्ते बच्चों! आज हम ${cleanTitle} के इस चरण को समझेंगे।`,
                mr: st.narrationMr && /[\u0900-\u097F]/.test(st.narrationMr) ? st.narrationMr : `नमस्कार मुलांनो! आज आपण ${cleanTitle} च्या या पायरीबद्दल शिकणार आहोत.`,
              },
              narrationText: {
                en: st.narrationEn,
                hi: st.narrationHi && /[\u0900-\u097F]/.test(st.narrationHi) ? st.narrationHi : `नमस्ते बच्चों! आज हम ${cleanTitle} के इस चरण को समझेंगे।`,
                mr: st.narrationMr && /[\u0900-\u097F]/.test(st.narrationMr) ? st.narrationMr : `नमस्कार मुलांनो! आज आपण ${cleanTitle} च्या या पायरीबद्दल शिकणार आहोत.`,
              },
              example: st.example,
              visualDescription: st.visualDescription,
            }))
          : [
              {
                title: 'Step 1: Introduction',
                content: parsed.explanation,
                narrationText: { en: parsed.explanation, hi: parsed.explanation, mr: parsed.explanation },
              },
            ],
        knowledgeCheck: {
          question: mappedQuiz[0]?.question || `What is the primary topic of ${cleanTitle}?`,
          options: mappedQuiz[0]?.options.map((o) => o.text) || [cleanTitle, 'None of the above'],
          correctIndex: 0,
          explanation: mappedQuiz[0]?.explanation || `This document specifically covers ${cleanTitle}.`,
        },
        shortNotes: {
          summary: parsed.summary || '',
          keyPoints: parsed.keyConcepts || [],
          definitions: (parsed.keyConcepts || []).map((k) => {
            const p = k.split(':');
            return { term: p[0]?.trim() || 'Term', meaning: p[1]?.trim() || 'Key definition' };
          }),
          rememberTip: `Review the short notes and practice with the quiz to reinforce your understanding!`,
        },
        quizId: `quiz-doc-${Date.now().toString(36)}`,
        durationMinutes: 5,
        tags: ['pdf-generated', subjectId],
      };

      return NextResponse.json({
        title: cleanTitle,
        subjectId,
        explanation: parsed.explanation,
        summary: parsed.summary || '',
        keyConcepts: Array.isArray(parsed.keyConcepts) ? parsed.keyConcepts : [],
        realLifeExamples: Array.isArray(parsed.realLifeExamples) ? parsed.realLifeExamples : [],
        quiz: mappedQuiz,
        generatedLesson,
        isAiGenerated: true,
      });
    } catch (aiErr) {
      console.warn('[pdf-process] Gemini API unavailable or parse failed, falling back:', aiErr);
      const fallback = generateFallbackLearningContent(sampleText, fileName, safeLanguage);
      return NextResponse.json(fallback);
    }
  } catch (err: unknown) {
    console.error('[pdf-process] Request error:', err instanceof Error ? err.message : 'Unknown');
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing the document.' },
      { status: 500 }
    );
  }
}
