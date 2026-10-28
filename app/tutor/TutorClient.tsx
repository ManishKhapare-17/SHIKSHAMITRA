'use client';

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, RotateCcw, Brain, AlertTriangle, Mic, MicOff, Volume2, VolumeX, Sparkles } from 'lucide-react';
import NavBar from '@/components/NavBar';
import { Button, Card, ThinkingDots } from '@/components/ui';
import { LESSON_MAP } from '@/lib/lessons';
import { SUBJECT_MAP } from '@/lib/subjects';
import {
  getTeacherPersona,
  getSpeechRate,
  getDocumentById,
} from '@/lib/progress';
import {
  speakText,
  stopSpeaking,
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
} from '@/lib/speech';
import { t, LANGUAGES } from '@/lib/i18n';
import { useLanguage } from '@/lib/LanguageContext';
import type { TutorMessage, Language, TeacherPersona, DocumentLearningData } from '@/lib/types';

function subscribeOnline(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getOnlineSnapshot() {
  return navigator.onLine;
}

function getServerOnlineSnapshot() {
  return true;
}

const MAX_INPUT_LENGTH = 800;

const TRILINGUAL_OFFLINE_HINTS: Record<string, Record<Language, string[]>> = {
  'math-fractions-g4': {
    en: [
      'A fraction has two parts: the numerator (top) shows how many parts you have, and the denominator (bottom) shows how many equal parts the whole is divided into.',
      'Think of a pizza cut into equal slices — each slice is a fraction of the whole pizza!',
      'To compare fractions with the same denominator, compare the numerators — bigger numerator = bigger fraction.',
    ],
    hi: [
      'भिन्न के दो भाग होते हैं: अंश (ऊपर) बताता है कि आपके पास कितने भाग हैं, और हर (नीचे) बताता है कि पूरी वस्तु को कितने बराबर भागों में बाँटा गया है।',
      'एक पिज्जा के बारे में सोचें जिसे बराबर टुकड़ों में काटा गया है - प्रत्येक टुकड़ा पूरे पिज्जा का एक भिन्न है!',
      'समान हर वाले भिन्नों की तुलना करने के लिए, अंशों की तुलना करें - बड़ा अंश = बड़ी भिन्न।',
    ],
    mr: [
      'अपूर्णांकाचे दोन भाग असतात: अंश (वरचा) दर्शवतो की तुमच्याकडे किती भाग आहेत आणि छेद (खालचा) दर्शवतो की संपूर्ण वस्तूचे किती समान भाग केले आहेत.',
      'एका पिझ्झाचा विचार करा ज्याचे समान तुकडे केले आहेत - प्रत्येक तुकडा संपूर्ण पिझ्झाचा एक अपूर्णांक आहे!',
      'समान छेद असलेल्या अपूर्णांकांची तुलना करण्यासाठी अंशांची तुलना करा - मोठा अंश = मोठा अपूर्णांक.',
    ],
  },
  'sci-water-cycle-g4': {
    en: [
      'The water cycle has four main stages: Evaporation → Condensation → Precipitation → Collection.',
      'Evaporation happens when the sun heats water and turns it into invisible water vapour.',
      'Condensation is when water vapour cools and turns back into tiny water droplets, forming clouds.',
    ],
    hi: [
      'जल चक्र के चार मुख्य चरण हैं: वाष्पीकरण → संघनन → वर्षण → संचयन।',
      'वाष्पीकरण तब होता है जब सूर्य पानी को गर्म करता है और उसे अदृश्य जलवाष्प में बदल देता है।',
      'संघनन तब होता है जब जलवाष्प ठंडी होकर पानी की नन्हीं बूंदों में बदल जाती है और बादल बनाती है।',
    ],
    mr: [
      'जलचक्राचे चार मुख्य टप्पे आहेत: बाष्पीभवन → संघनन → पर्जन्यवृष्टी → संचयन.',
      'जेव्हा सूर्य पाणी तापवतो आणि त्याचे अदृश्य पाण्याच्या वाफेमध्ये रूपांतर करतो तेव्हा बाष्पीभवन होते.',
      'जेव्हा पाण्याच्या वाफेला थंड हवा लागते आणि तिचे लहान थेंबांमध्ये रूपांतर होऊन ढग तयार होतात तेव्हा संघनन होते.',
    ],
  },
  'eng-nouns-g4': {
    en: [
      'A noun names a person, place, thing, or idea. Ask: "Is this a name of something?" If yes, it\'s a noun!',
      'Proper nouns are specific names and always start with a CAPITAL LETTER. Example: Mumbai, Priya.',
      'Abstract nouns are feelings or ideas you cannot touch: love, courage, happiness.',
    ],
    hi: [
      'संज्ञा किसी व्यक्ति, स्थान, वस्तु या भाव के नाम को कहते हैं। उदाहरण: राम, दिल्ली, किताब, खुशी।',
      'व्यक्तिवाचक संज्ञा किसी विशेष नाम को दर्शाती है और हमेशा बड़े अक्षर से शुरू होती है।',
      'भाववाचक संज्ञा ऐसी भावनाएँ या विचार हैं जिन्हें छुआ नहीं जा सकता: प्रेम, साहस, खुशी।',
    ],
    mr: [
      'नाम म्हणजे कोणत्याही व्यक्तीचे, ठिकाणाचे, वस्तूचे किंवा कल्पनेचे नाव. उदाहरण: राहुल, मुंबई, पुस्तक, आनंद.',
      'विशेष नाम विशिष्ट नाव दर्शवते आणि ते नेहमी मोठ्या अक्षराने सुरू होते.',
      'भाववाचक नाम म्हणजे अशा भावना ज्या आपण स्पर्श करू शकत नाही: प्रेम, धैर्य, आनंद.',
    ],
  },
};

function getOfflineHint(lessonId?: string, selectedSubj?: string, lang: Language = 'en'): string {
  const targetId = lessonId || (selectedSubj === 'mathematics' ? 'math-fractions-g4' : selectedSubj === 'science' ? 'sci-water-cycle-g4' : selectedSubj === 'english' ? 'eng-nouns-g4' : undefined);
  if (targetId && TRILINGUAL_OFFLINE_HINTS[targetId]) {
    const hints = TRILINGUAL_OFFLINE_HINTS[targetId][lang] || TRILINGUAL_OFFLINE_HINTS[targetId].en;
    return hints[Math.floor(Math.random() * hints.length)];
  }
  if (lang === 'hi') {
    return 'मैं ऑफ़लाइन मोड में हूँ। क्रमबद्ध व्याख्या और दैनिक उदाहरणों के लिए अपना पाठ देखें!';
  }
  if (lang === 'mr') {
    return 'मी ऑफलाइन मोडमध्ये आहे. टप्प्याटप्प्याने स्पष्टीकरणासाठी आपला धडा पहा!';
  }
  return "I'm in offline mode. Check your lesson for step-by-step explanations and real-life examples!";
}

type SubjectFilter = 'all' | 'mathematics' | 'science' | 'english';

const PROMPT_SUGGESTIONS: Record<SubjectFilter, Record<Language, string[]>> = {
  all: {
    en: [
      'How do I add fractions with the same denominator?',
      'Why do clouds make rain in the water cycle?',
      'What is the difference between common and proper nouns?',
    ],
    hi: [
      'समान हर वाले भिन्नों को कैसे जोड़ें?',
      'जल चक्र में बादल बारिश कैसे करते हैं?',
      'व्यक्तिवाचक और जातिवाचक संज्ञा में क्या अंतर है?',
    ],
    mr: [
      'समान छेद असलेले अपूर्णांक कसे जोडावेत?',
      'जलचक्रामध्ये ढगांमधून पाऊस कसा पडतो?',
      'विशेष नाम आणि सामान्य नाम यातील फरक काय?',
    ],
  },
  mathematics: {
    en: [
      'How to add 1/4 + 2/4 step by step?',
      'What is the difference between numerator and denominator?',
      'Which fraction is bigger: 1/3 or 1/2?',
    ],
    hi: [
      '1/4 + 2/4 को चरणबद्ध तरीके से कैसे जोड़ें?',
      'अंश और हर में क्या अंतर होता है?',
      '1/3 या 1/2 में से कौन सी भिन्न बड़ी है?',
    ],
    mr: [
      '1/4 + 2/4 टप्प्याटप्प्याने कसे जोडावे?',
      'अंश आणि छेद यामध्ये काय फरक आहे?',
      '1/3 आणि 1/2 यापैकी कोणता अपूर्णांक मोठा आहे?',
    ],
  },
  science: {
    en: [
      'Explain the 4 stages of the water cycle',
      'Why does water evaporate faster in the sun?',
      'What is condensation and where can we see it at home?',
    ],
    hi: [
      'जल चक्र के चारों चरण समझाइए',
      'धूप में पानी तेजी से वाष्प क्यों बन जाता है?',
      'संघनन क्या है और इसे घर में कहाँ देख सकते हैं?',
    ],
    mr: [
      'जलचक्राचे चार टप्पे स्पष्ट करा',
      'उन्हात पाण्याचे बाष्पीभवन जलद का होते?',
      'संघनन म्हणजे काय आणि ते घरात कुठे पाहता येते?',
    ],
  },
  english: {
    en: [
      'What is a proper noun? Give 3 examples',
      'How can I tell if a word is a noun or a verb?',
      'What are common nouns versus proper nouns?',
    ],
    hi: [
      'व्यक्तिवाचक संज्ञा क्या है? 3 उदाहरण दें',
      'शब्द संज्ञा है या क्रिया, यह कैसे पहचानें?',
      'जातिवाचक और व्यक्तिवाचक संज्ञा में अंतर बताएं',
    ],
    mr: [
      'विशेष नाम म्हणजे काय? ३ उदाहरणे द्या',
      'शब्द नाम आहे की क्रियापद हे कसे ओळखायचे?',
      'सामान्य नाम आणि विशेष नाम यातील फरक सांगा',
    ],
  },
};

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function renderContent(content: string) {
  return content.split('\n').map((line, i, arr) => (
    <span key={i}>
      {line.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={j}>{part.slice(2, -2)}</strong>
          : part
      )}
      {i < arr.length - 1 && <br />}
    </span>
  ));
}

export default function TutorClient() {
  const searchParams = useSearchParams();
  const lessonId = searchParams.get('lesson') ?? undefined;
  const docId = searchParams.get('docId') ?? undefined;

  const lesson = lessonId ? LESSON_MAP[lessonId] : undefined;
  const subject = lesson ? SUBJECT_MAP[lesson.subjectId] : undefined;

  const [doc, setDoc] = useState<DocumentLearningData | null>(null);
  const { language: lang, setLanguage: setLang } = useLanguage();
  const [teacher, setTeacher] = useState<TeacherPersona>('female');
  const [speechRate, setRate] = useState<number>(1);
  const [selectedSubject, setSelectedSubject] = useState<SubjectFilter>('all');

  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const online = useSyncExternalStore(subscribeOnline, getOnlineSnapshot, getServerOnlineSnapshot);
  const bottomRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognizerRef = useRef<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTeacher(getTeacherPersona());
      setRate(getSpeechRate());

      if (docId) {
        const d = getDocumentById(docId);
        if (d) setDoc(d);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [docId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    const timer = setTimeout(() => {
      let welcomeText = '';
      if (doc) {
        if (lang === 'hi') {
          welcomeText = `नमस्ते! 👋 मैं आपका शिक्षा मित्र एआई शिक्षक हूँ। मैं देख रहा हूँ कि आप अपने दस्तावेज़ **${doc.fileName}** का अध्ययन कर रहे हैं।\n\nइस दस्तावेज़ के बारे में कुछ भी पूछें - मैं इसे सरल शब्दों में समझाऊंगा!`;
        } else if (lang === 'mr') {
          welcomeText = `नमस्कार! 👋 मी तुमचा शिक्षामित्र एआय शिक्षक आहे. मी पाहत आहे की तुम्ही तुमच्या **${doc.fileName}** दस्तऐवजाचा अभ्यास करत आहात.\n\nया दस्तऐवजाबद्दल काहीही विचारा - मी ते सोप्या भाषेत समजावून सांगेन!`;
        } else {
          welcomeText = `Hello! 👋 I'm your ShikshaMitra AI Tutor. I see you're studying your document **${doc.fileName}**.\n\nAsk me anything about this document — I'll explain it step by step!`;
        }
      } else if (lesson) {
        const title = lesson.titleTranslations?.[lang] || lesson.title;
        const subjName = subject?.nameTranslations?.[lang] || subject?.name;
        if (lang === 'hi') {
          welcomeText = `नमस्ते! 👋 मैं आपका शिक्षा मित्र एआई शिक्षक हूँ। आप ${subjName} में **${title}** पढ़ रहे हैं।\n\nइस पाठ के बारे में कुछ भी पूछें - मैं आपको समझाऊंगा!`;
        } else if (lang === 'mr') {
          welcomeText = `नमस्कार! 👋 मी तुमचा शिक्षामित्र एआय शिक्षक आहे. तुम्ही ${subjName} मधील **${title}** शिकत आहात.\n\nया धड्याबद्दल काहीही विचारा - मी तुम्हाला समजावून सांगेन!`;
        } else {
          welcomeText = `Hello! 👋 I'm your ShikshaMitra AI Tutor. I see you're studying **${title}** in ${subjName}.\n\nAsk me anything about this topic — I'll explain it step by step!`;
        }
      } else {
        if (selectedSubject === 'mathematics') {
          if (lang === 'hi') {
            welcomeText = `नमस्ते! 👋 मैं आपका गणित शिक्षक हूँ! 🔢\n\nभिन्न, संख्याओं, आकृतियों या गणित के सवालों के बारे में पूछें। आइए इन्हें मिलकर चरणबद्ध तरीके से हल करें!`;
          } else if (lang === 'mr') {
            welcomeText = `नमस्कार! 👋 मी तुमचा गणित शिक्षक आहे! 🔢\n\nअपूर्णांक, संख्या, आकार किंवा गणिताच्या प्रश्नांबद्दल विचारा. चला एकत्र सोडवूया!`;
          } else {
            welcomeText = `Hello! 👋 I'm your Mathematics Tutor! 🔢\n\nAsk me about fractions, numbers, shapes, or word problems. Let's solve them together step by step!`;
          }
        } else if (selectedSubject === 'science') {
          if (lang === 'hi') {
            welcomeText = `नमस्ते! 👋 मैं आपका विज्ञान शिक्षक हूँ! 🔬\n\nजल चक्र, प्रकृति, मौसम, जानवरों या पौधों के बारे में पूछें। आइए मिलकर खोज करें!`;
          } else if (lang === 'mr') {
            welcomeText = `नमस्कार! 👋 मी तुमचा विज्ञान शिक्षक आहे! 🔬\n\nजलचक्र, निसर्ग, हवामान, प्राणी किंवा वनस्पतींबद्दल विचारा. चला एकत्र शोध घेऊया!`;
          } else {
            welcomeText = `Hello! 👋 I'm your Science & EVS Tutor! 🔬\n\nAsk me about the water cycle, nature, weather, animals, or plants. Let's explore together!`;
          }
        } else if (selectedSubject === 'english') {
          if (lang === 'hi') {
            welcomeText = `नमस्ते! 👋 मैं आपका अंग्रेज़ी शिक्षक हूँ! 📖\n\nसंज्ञा (Nouns), वाक्यों, क्रियाओं या पढ़ने के बारे में पूछें। आइए अभ्यास करें!`;
          } else if (lang === 'mr') {
            welcomeText = `नमस्कार! 👋 मी तुमचा इंग्रजी शिक्षक आहे! 📖\n\nनाम (Nouns), वाक्य, क्रियापद किंवा वाचनाबद्दल विचारा. चला एकत्र सराव करूया!`;
          } else {
            welcomeText = `Hello! 👋 I'm your English Tutor! 📖\n\nAsk me about nouns, sentences, verbs, reading, or vocabulary. Let's practice together!`;
          }
        } else {
          if (lang === 'hi') {
            welcomeText = `नमस्ते! 👋 मैं आपका शिक्षा मित्र एआई शिक्षक हूँ!\n\nगणित, विज्ञान या अंग्रेज़ी के बारे में मुझसे कुछ भी पूछें। आज आप क्या सीखना चाहते हैं?`;
          } else if (lang === 'mr') {
            welcomeText = `नमस्कार! 👋 मी तुमचा शिक्षामित्र एआय शिक्षक आहे!\n\nगणित, विज्ञान किंवा इंग्रजीबद्दल काहीही विचारा. आज तुम्हाला काय शिकायचे आहे?`;
          } else {
            welcomeText = `Hello! 👋 I'm your ShikshaMitra AI Tutor!\n\nAsk me anything about Mathematics, Science & EVS, or English. What would you like to learn today?`;
          }
        }
      }

      setMessages([{
        id: generateId(),
        role: 'assistant',
        content: welcomeText,
        timestamp: new Date().toISOString(),
      }]);
    }, 0);
    return () => clearTimeout(timer);
  }, [lesson, subject, doc, lang, selectedSubject]);

  // Clean up speech synthesis and recognition on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      recognizerRef.current?.stop();
    };
  }, []);

  const toggleSpeechRecognition = () => {
    if (isListening) {
      recognizerRef.current?.stop();
      setIsListening(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      alert('Speech recognition is not supported on this browser. You can type your question in the text box!');
      return;
    }

    const recognizer = createSpeechRecognizer(
      lang,
      (transcript) => {
        setInput(transcript);
      },
      (error) => {
        console.warn('Speech recognition error:', error);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    if (recognizer) {
      recognizerRef.current = recognizer;
      recognizer.start();
      setIsListening(true);
    }
  };

  const handleSpeakMessage = (msgId: string, text: string) => {
    if (speakingMsgId === msgId) {
      stopSpeaking();
      setSpeakingMsgId(null);
      return;
    }

    stopSpeaking();
    const ok = speakText({
      text,
      lang,
      persona: teacher,
      rate: speechRate,
      onStart: () => setSpeakingMsgId(msgId),
      onEnd: () => setSpeakingMsgId(null),
      onError: () => setSpeakingMsgId(null),
    });

    if (!ok) {
      setSpeakingMsgId(null);
    }
  };

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading || text.length > MAX_INPUT_LENGTH) return;

    if (isListening) {
      recognizerRef.current?.stop();
      setIsListening(false);
    }

    const userMsg: TutorMessage = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    if (!online) {
      const hint = getOfflineHint(lessonId, selectedSubject, lang);
      setTimeout(() => {
        setMessages((prev) => [...prev, {
          id: generateId(),
          role: 'assistant',
          content: `📚 **Built-in Hint** *(Offline — not a live AI response)*\n\n${hint}`,
          timestamp: new Date().toISOString(),
          isOffline: true,
        }]);
        setLoading(false);
      }, 600);
      return;
    }

    // Build API message history
    const apiMessages = messages
      .filter((m) => !m.isOffline && !m.isError)
      .map((m) => ({ role: m.role, content: m.content }))
      .concat({ role: 'user' as const, content: text })
      .slice(-18);

    const contextPayload = doc
      ? {
          lessonId: doc.id,
          lessonTitle: doc.fileName,
          subjectName: 'Uploaded Document',
          documentContent: doc.extractedText.slice(0, 4000),
        }
      : lesson
      ? {
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          subjectName: subject?.name ?? '',
        }
      : selectedSubject !== 'all'
      ? {
          lessonId: `subj-${selectedSubject}`,
          lessonTitle: `Grade 4 ${selectedSubject === 'mathematics' ? 'Mathematics' : selectedSubject === 'science' ? 'Science & EVS' : 'English'}`,
          subjectName: selectedSubject === 'mathematics' ? 'Mathematics' : selectedSubject === 'science' ? 'Science & EVS' : 'English',
        }
      : undefined;

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          language: lang,
          lessonContext: contextPayload,
        }),
      });

      const data = await res.json() as { reply?: string; error?: string };

      if (!res.ok || data.error) {
        const isUnconfigured = res.status === 503;
        const msg = isUnconfigured
          ? `⚠️ **AI Tutor not configured**\n\nA GEMINI_API_KEY is needed. Ask a parent or teacher to set it up.\n\n**Built-in hint:** ${getOfflineHint(lessonId, selectedSubject, lang)}`
          : `❌ **Temporary issue.** Please try again.\n\n**Built-in hint:** ${getOfflineHint(lessonId, selectedSubject, lang)}`;
        setMessages((prev) => [...prev, { id: generateId(), role: 'assistant', content: msg, timestamp: new Date().toISOString(), isError: true }]);
      } else {
        setMessages((prev) => [...prev, { id: generateId(), role: 'assistant', content: data.reply ?? '', timestamp: new Date().toISOString() }]);
      }
    } catch {
      setMessages((prev) => [...prev, {
        id: generateId(), role: 'assistant',
        content: `❌ **Couldn't reach the AI.** Check your internet connection and try again.\n\n**Built-in hint:** ${getOfflineHint(lessonId, selectedSubject, lang)}`,
        timestamp: new Date().toISOString(), isError: true,
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, online, messages, lesson, subject, lessonId, doc, lang, isListening, selectedSubject]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void sendMessage(); }
  };

  const handleSelectSuggestion = (promptText: string) => {
    setInput(promptText);
  };

  const clearChat = useCallback(() => {
    stopSpeaking();
    setSpeakingMsgId(null);
    let welcome = '';
    if (selectedSubject === 'mathematics') {
      welcome = lang === 'hi'
        ? 'चैट साफ हो गई! 👋 गणित के बारे में कुछ भी पूछें!'
        : lang === 'mr'
        ? 'चॅट साफ केली! 👋 गणिताबद्दल काहीही विचारा!'
        : 'Chat cleared! 👋 What math question can I help you with?';
    } else if (selectedSubject === 'science') {
      welcome = lang === 'hi'
        ? 'चैट साफ हो गई! 👋 विज्ञान के बारे में कुछ भी पूछें!'
        : lang === 'mr'
        ? 'चॅट साफ केली! 👋 विज्ञानाबद्दल काहीही विचारा!'
        : 'Chat cleared! 👋 What science question can I help you with?';
    } else if (selectedSubject === 'english') {
      welcome = lang === 'hi'
        ? 'चैट साफ हो गई! 👋 अंग्रेज़ी के बारे में कुछ भी पूछें!'
        : lang === 'mr'
        ? 'चॅट साफ केली! 👋 इंग्रजीबद्दल काहीही विचारा!'
        : 'Chat cleared! 👋 What English question can I help you with?';
    } else {
      welcome = lang === 'hi'
        ? 'चैट साफ हो गई! 👋 आप क्या पूछना चाहते हैं?'
        : lang === 'mr'
        ? 'चॅट साफ केली! 👋 तुम्हाला काय विचारायचे आहे?'
        : 'Chat cleared! 👋 What would you like to learn?';
    }
    setMessages([{
      id: generateId(),
      role: 'assistant',
      content: welcome,
      timestamp: new Date().toISOString(),
    }]);
  }, [lang, selectedSubject]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:pt-16">
      <NavBar />

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
          <Brain className="w-5 h-5 text-violet-700" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-slate-800 text-sm">{t('tutorTitle', lang)}</h1>
          <p className="text-xs text-slate-500 truncate">
            {doc
              ? `Document: ${doc.fileName}`
              : lesson
              ? `Lesson: ${lesson.titleTranslations?.[lang] || lesson.title}`
              : t('tutorSubtitle', lang)}
          </p>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code);
                stopSpeaking();
                setSpeakingMsgId(null);
              }}
              className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                lang === l.code ? 'bg-white text-violet-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {l.flag} {l.name}
            </button>
          ))}
        </div>

        {!online && (
          <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full font-medium">
            <AlertTriangle className="w-3 h-3" /> Offline
          </span>
        )}
        <button
          onClick={clearChat}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          title={t('clearChat', lang)}
          aria-label={t('clearChat', lang)}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Subject Filter Bar (when not in a specific lesson or document) */}
      {!lesson && !doc && (
        <div className="bg-white border-b border-slate-100 px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 mr-1">
            Subject:
          </span>
          {[
            { id: 'all' as const, label: { en: 'All Subjects 🌟', hi: 'सभी विषय 🌟', mr: 'सर्व विषय 🌟' } },
            { id: 'mathematics' as const, label: { en: 'Mathematics 🔢', hi: 'गणित 🔢', mr: 'गणित 🔢' } },
            { id: 'science' as const, label: { en: 'Science & EVS 🔬', hi: 'विज्ञान 🔬', mr: 'विज्ञान 🔬' } },
            { id: 'english' as const, label: { en: 'English 📖', hi: 'अंग्रेज़ी 📖', mr: 'इंग्रजी 📖' } },
          ].map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubject(sub.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedSubject === sub.id
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              {sub.label[lang] || sub.label.en}
            </button>
          ))}
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ paddingBottom: '140px' }}>
        {messages.map((msg) => {
          const isSpeakingCurrent = speakingMsgId === msg.id;

          return (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                  <Brain className="w-4 h-4 text-violet-700" />
                </div>
              )}
              <div className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-violet-600 text-white rounded-tr-sm'
                  : msg.isOffline
                  ? 'bg-amber-50 text-amber-900 border border-amber-200 rounded-tl-sm'
                  : msg.isError
                  ? 'bg-red-50 text-red-900 border border-red-200 rounded-tl-sm'
                  : 'bg-white text-slate-800 border border-slate-100 shadow-sm rounded-tl-sm'
              }`}>
                {renderContent(msg.content)}

                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100/40 text-xs">
                  <span className={msg.role === 'user' ? 'text-violet-200' : 'text-slate-400'}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {msg.isOffline && ' · Built-in hint'}
                  </span>

                  {msg.role === 'assistant' && isSpeechSynthesisSupported() && (
                    <button
                      onClick={() => handleSpeakMessage(msg.id, msg.content)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                        isSpeakingCurrent
                          ? 'bg-amber-100 text-amber-800'
                          : 'text-slate-500 hover:text-violet-700 hover:bg-slate-100'
                      }`}
                      title={isSpeakingCurrent ? t('stopSpeaking', lang) : t('speakAnswer', lang)}
                    >
                      {isSpeakingCurrent ? (
                        <>
                          <VolumeX className="w-3 h-3" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          <span>{t('speakAnswer', lang)}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Suggested Prompt Chips (when in general tutor mode) */}
        {!lesson && !doc && messages.length <= 3 && (
          <div className="bg-violet-50/80 border border-violet-100 rounded-2xl p-3.5 space-y-2 max-w-lg animate-fade-in">
            <div className="flex items-center gap-1.5 text-xs font-bold text-violet-800">
              <Sparkles className="w-3.5 h-3.5 text-violet-600" />
              <span>
                {lang === 'hi'
                  ? 'त्वरित प्रश्न (पूछने के लिए टैप करें):'
                  : lang === 'mr'
                  ? 'सुचवलेले प्रश्न (विचारण्यासाठी टॅप करा):'
                  : 'Quick questions to ask (tap to try):'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(PROMPT_SUGGESTIONS[selectedSubject]?.[lang] || PROMPT_SUGGESTIONS[selectedSubject]?.en || []).map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSuggestion(prompt)}
                  className="text-left text-xs bg-white hover:bg-violet-100/80 border border-violet-200 text-slate-700 hover:text-violet-900 rounded-xl px-3 py-1.5 font-medium transition-all shadow-2xs hover:scale-[1.01]"
                >
                  💡 {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mr-2">
              <Brain className="w-4 h-4 text-violet-700" />
            </div>
            <Card className="px-4 py-3 inline-flex">
              <ThinkingDots />
            </Card>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-3 z-30">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Active listening banner */}
          {isListening && (
            <div className="flex items-center justify-between bg-violet-50 border border-violet-200 rounded-xl px-3 py-1.5 text-xs text-violet-800 animate-pulse">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                {t('listeningNow', lang)}
              </span>
              <button
                onClick={toggleSpeechRecognition}
                className="text-violet-700 font-bold hover:underline"
              >
                {t('stopListening', lang)}
              </button>
            </div>
          )}

          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT_LENGTH))}
                onKeyDown={handleKeyDown}
                placeholder={online ? t('tutorInputPlaceholder', lang) : 'Ask for a hint (offline mode)…'}
                rows={1}
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-slate-50"
                style={{ minHeight: 44, maxHeight: 120 }}
                aria-label="Message to AI tutor"
              />
              {input.length > 700 && (
                <p className="absolute -top-5 right-0 text-xs text-amber-600">{MAX_INPUT_LENGTH - input.length} chars left</p>
              )}
            </div>

            {/* Voice input button */}
            <Button
              type="button"
              variant={isListening ? 'danger' : 'secondary'}
              onClick={toggleSpeechRecognition}
              aria-label={isListening ? t('stopListening', lang) : t('voiceInputBtn', lang)}
              title={isListening ? t('stopListening', lang) : t('voiceInputBtn', lang)}
              className="px-3"
            >
              {isListening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4" />}
            </Button>

            <Button onClick={() => void sendMessage()} disabled={!input.trim() || loading} size="md" aria-label="Send message">
              <Send className="w-4 h-4" />
            </Button>
          </div>

          <p className="text-[11px] text-center text-slate-400">
            AI explanations are for learning support — verify important answers with your teacher.
          </p>
        </div>
      </div>
    </div>
  );
}
