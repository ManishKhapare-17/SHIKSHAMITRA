// ============================================================
// ShikshaMitra AI — Multilingual Lesson Curriculum (Grade 4)
// Supported Languages: English ('en'), Hindi ('hi'), Marathi ('mr')
// ============================================================

import type { Lesson } from './types';

export const LESSONS: Lesson[] = [
  // ──────────────────────────────────────────────────────────
  // 1. MATHEMATICS — Fractions
  // ──────────────────────────────────────────────────────────
  {
    id: 'math-fractions-g4',
    subjectId: 'mathematics',
    grade: 4,
    title: 'Understanding Fractions',
    titleTranslations: {
      en: 'Understanding Fractions',
      hi: 'भिन्न को समझें (Fractions)',
      mr: 'अपूर्णांक समजून घेऊया (Fractions)',
    },
    summary: 'Learn what fractions are and how to read and write them using numerators and denominators.',
    summaryTranslations: {
      en: 'Learn what fractions are and how to read and write them using numerators and denominators.',
      hi: 'जानें कि भिन्न क्या हैं और अंश तथा हर की मदद से उन्हें कैसे पढ़ा और लिखा जाता है।',
      mr: 'अपूर्णांक म्हणजे काय आणि अंश व छेदाच्या साहाय्याने ते कसे वाचायचे व लिहायचे ते शिका.',
    },
    objectives: [
      {
        id: 'obj-frac-1',
        description: 'Understand that a fraction represents equal parts of a whole',
        descriptionTranslations: {
          en: 'Understand that a fraction represents equal parts of a whole',
          hi: 'समझें कि भिन्न किसी पूरी वस्तु के समान हिस्सों को दर्शाती है',
          mr: 'अपूर्णांक म्हणजे संपूर्ण वस्तूचे समान भाग असतात हे समजून घेणे',
        },
      },
      {
        id: 'obj-frac-2',
        description: 'Identify the numerator and denominator in a fraction',
        descriptionTranslations: {
          en: 'Identify the numerator and denominator in a fraction',
          hi: 'भिन्न में अंश (Numerator) और हर (Denominator) की पहचान करना',
          mr: 'अपूर्णांकामधील अंश (Numerator) आणि छेद (Denominator) ओळखणे',
        },
      },
      {
        id: 'obj-frac-3',
        description: 'Compare simple fractions using visual models',
        descriptionTranslations: {
          en: 'Compare simple fractions using visual models',
          hi: 'चित्रों और मॉडलों की मदद से सरल भिन्नों की तुलना करना',
          mr: 'चित्रांच्या मदतीने सोप्या अपूर्णांकांची तुलना करणे',
        },
      },
    ],
    explanation: `A **fraction** tells us about a **part of a whole**.

When we divide something into equal parts, each part is a fraction of the whole thing.

Every fraction has two numbers:
• The **numerator** (top number) — tells us *how many parts we have*
• The **denominator** (bottom number) — tells us *how many equal parts the whole is divided into*

We write fractions like this: 1/2, 3/4, 2/5. The line in between is called the fraction bar!`,
    explanationTranslations: {
      en: `A **fraction** tells us about a **part of a whole**.

When we divide something into equal parts, each part is a fraction of the whole thing.

Every fraction has two numbers:
• The **numerator** (top number) — tells us *how many parts we have*
• The **denominator** (bottom number) — tells us *how many equal parts the whole is divided into*

We write fractions like this: 1/2, 3/4, 2/5.`,
      hi: `एक **भिन्न (Fraction)** हमें किसी **पूरी वस्तु के हिस्से** के बारे में बताती है।

जब हम किसी चीज़ को समान भागों में बाँटते हैं, तो प्रत्येक भाग उस पूरी वस्तु की एक भिन्न कहलाता है।

प्रत्येक भिन्न में दो संख्याएँ होती हैं:
• **अंश (Numerator - ऊपर की संख्या)** — यह बताती है कि *हमारे पास कितने हिस्से हैं*
• **हर (Denominator - नीचे की संख्या)** — यह बताती है कि *पूरी वस्तु को कुल कितने बराबर भागों में बाँटा गया है*

हम भिन्न को ऐसे लिखते हैं: 1/2, 3/4, 2/5।`,
      mr: `**अपूर्णांक (Fraction)** म्हणजे **एका संपूर्ण वस्तूचा समान भाग** होय.

जेव्हा आपण कोणतीही वस्तू समान भागांमध्ये वाटतो, तेव्हा प्रत्येक भागाला अपूर्णांक म्हणतात.

प्रत्येक अपूर्णांकामध्ये दोन संख्या असतात:
• **अंश (Numerator - वरची संख्या)** — आपल्याकडे *त्या वस्तूचे किती भाग आहेत* ते दाखवतो.
• **छेद (Denominator - खालची संख्या)** — वस्तूचे *एकूण किती समान भाग केले आहेत* ते दाखवतो.

आपण अपूर्णांक असे लिहितो: 1/2, 3/4, 2/5.`,
    },
    realLifeExample: `🍕 **Pizza Example!**

Imagine you order a pizza and it is cut into **8 equal slices**.
You eat **3 slices**. What fraction did you eat?

You ate → 3/8 of the pizza!
• Numerator = 3 (slices you ate)
• Denominator = 8 (total slices)
• Remaining = 5/8 (5 slices left)`,
    realLifeExampleTranslations: {
      en: `🍕 **Pizza Example!**

Imagine you order a pizza and it is cut into **8 equal slices**.
You eat **3 slices**. What fraction did you eat?

You ate → 3/8 of the pizza!
• Numerator = 3 (slices you ate)
• Denominator = 8 (total slices)
• Remaining = 5/8 (5 slices left)`,
      hi: `🍕 **पिज़्ज़ा का उदाहरण!**

मान लीजिए आपके पास एक पिज़्ज़ा है जिसे **8 बराबर स्लाइस** में काटा गया है।
आपने **3 स्लाइस** खाए। आपने पिज़्ज़ा का कितना भिन्न हिस्सा खाया?

आपने खाया → 3/8 पिज़्ज़ा!
• अंश = 3 (जो स्लाइस आपने खाए)
• हर = 8 (कुल स्लाइस)
• बचा हुआ पिज़्ज़ा = 5/8`,
      mr: `🍕 **पिझ्झाचे उदाहरण!**

समजा तुमच्याकडे एक पिझ्झा आहे आणि त्याचे **८ समान तुकडे** केले आहेत.
तुम्ही त्यातील **३ तुकडे** खाल्ले. तर तुम्ही पिझ्झाचा किती भाग खाल्ला?

तुम्ही खाल्ला → ३/८ भाग!
• अंश = ३ (तुम्ही खाल्लेले तुकडे)
• छेद = ८ (एकूण समान तुकडे)
• शिल्लक राहिलेला पिझ्झा = ५/८ भाग`,
    },
    steps: [
      {
        title: 'Step 1 — What is a Whole?',
        titleTranslations: {
          en: 'Step 1 — What is a Whole?',
          hi: 'चरण 1 — पूर्ण (Whole) क्या है?',
          mr: 'पायरी १ — पूर्ण वस्तू म्हणजे काय?',
        },
        content: 'A "whole" is a complete object — like a full pizza, an unbroken chocolate bar, or a full glass of milk. When we divide it into equal parts, we get fractions.',
        contentTranslations: {
          en: 'A "whole" is a complete object — like a full pizza, an unbroken chocolate bar, or a full glass of milk. When we divide it into equal parts, we get fractions.',
          hi: 'एक "पूर्ण" वस्तु पूरी चीज़ होती है — जैसे पूरा पिज़्ज़ा, साबुत चॉकलेट, या भरा हुआ गिलास। जब हम इसे समान भागों में बाँटते हैं, तो भिन्न बनती है।',
          mr: 'कोणतीही न कापलेली संपूर्ण वस्तू म्हणजे पूर्ण — जसे की पूर्ण पिझ्झा किंवा पूर्ण चॉकलेट. जेव्हा आपण त्याचे समान भाग करतो, तेव्हा अपूर्णांक तयार होतो.',
        },
        narrationText: {
          en: 'Welcome to Fractions! A whole is an undivided object. When we split it fairly into equal parts, each piece becomes a fraction.',
          hi: 'भिन्न के पाठ में आपका स्वागत है! एक पूर्ण वस्तु पूरी होती है। जब हम उसे बराबर हिस्सों में बाँटते हैं तो हर हिस्सा भिन्न बनता है।',
          mr: 'अपूर्णांकाच्या धड्यात तुमचे स्वागत आहे! कोणतीही न तोडलेली वस्तू म्हणजे पूर्ण. जेव्हा आपण त्याचे समान तुकडे करतो, तेव्हा प्रत्येक तुकडा अपूर्णांक बनतो.',
        },
        example: 'A chocolate bar split into 4 equal pieces — each piece is 1/4.',
        exampleTranslations: {
          en: 'A chocolate bar split into 4 equal pieces — each piece is 1/4.',
          hi: 'एक चॉकलेट बार जिसे 4 बराबर भागों में बाँटा गया — हर हिस्सा 1/4 है।',
          mr: 'एका चॉकलेटचे ४ समान भाग केले — प्रत्येक तुकडा म्हणजे १/४ भाग.',
        },
      },
      {
        title: 'Step 2 — Equal Parts Matter',
        titleTranslations: {
          en: 'Step 2 — Equal Parts Matter',
          hi: 'चरण 2 — हिस्से हमेशा बराबर होने चाहिए',
          mr: 'पायरी २ — भाग नेहमी समान असायला हवेत',
        },
        content: 'For something to be a fraction, ALL parts must be exactly the SAME size. If pieces are uneven, they are not fractions.',
        contentTranslations: {
          en: 'For something to be a fraction, ALL parts must be exactly the SAME size. If pieces are uneven, they are not fractions.',
          hi: 'भिन्न कहलाने के लिए सभी टुकड़े बिल्कुल एक ही आकार के होने चाहिए। यदि टुकड़े छोटे-बड़े हैं, तो वे भिन्न नहीं हैं।',
          mr: 'अपूर्णांक होण्यासाठी सर्व भाग अगदी एकाच आकाराचे असावे लागतात. तुकडे लहान-मोठे असतील तर ते अपूर्णांक नसतात.',
        },
        narrationText: {
          en: 'Remember rule number one: equal parts are essential. If you cut a cake unevenly, those pieces are not proper fractions.',
          hi: 'याद रखें पहला नियम: सभी भाग बराबर होने चाहिए। अगर टुकड़े असमान हैं तो वे सही भिन्न नहीं हैं।',
          mr: 'पहिला नियम लक्षात ठेवा: सर्व भाग एकसारखे समान असावे लागतात. जर केकचे तुकडे विषम असतील तर ते अपूर्णांक नाहीत.',
        },
        example: 'Cutting an apple into 2 equal halves gives two 1/2 pieces.',
        exampleTranslations: {
          en: 'Cutting an apple into 2 equal halves gives two 1/2 pieces.',
          hi: 'सेब को 2 बराबर हिस्सों में काटने पर दो 1/2 टुकड़े मिलते हैं।',
          mr: 'सफरचंद २ समान भागांत कापल्यास दोन १/२ भाग मिळतात.',
        },
      },
      {
        title: 'Step 3 — Numerator and Denominator',
        titleTranslations: {
          en: 'Step 3 — Numerator and Denominator',
          hi: 'चरण 3 — अंश और हर',
          mr: 'पायरी ३ — अंश आणि छेद',
        },
        content: 'The BOTTOM number (denominator) tells how many equal pieces the whole is divided into. The TOP number (numerator) tells how many of those pieces we have.',
        contentTranslations: {
          en: 'The BOTTOM number (denominator) tells how many equal pieces the whole is divided into. The TOP number (numerator) tells how many of those pieces we have.',
          hi: 'नीचे की संख्या (हर) बताती है कि कुल कितने बराबर टुकड़े किए गए हैं। ऊपर की संख्या (अंश) बताती है कि हम कितने टुकड़ों की बात कर रहे हैं।',
          mr: 'खालची संख्या (छेद) एकूण समान भाग दाखवते. वरची संख्या (अंश) त्यातील किती भाग आपण घेतले आहेत ते दाखवते.',
        },
        narrationText: {
          en: 'In 3 over 4: four is the denominator at the bottom, and three is the numerator at the top.',
          hi: 'भिन्न 3 बटे 4 में: 4 नीचे का हर है और 3 ऊपर का अंश है।',
          mr: '३ छेद ४ मध्ये: ४ हा खालचा छेद आहे आणि ३ हा वरचा अंश आहे.',
        },
        example: 'In 3/4 → denominator is 4, numerator is 3.',
        exampleTranslations: {
          en: 'In 3/4 → denominator is 4, numerator is 3.',
          hi: '3/4 में → हर 4 है, अंश 3 है।',
          mr: '३/४ मध्ये → छेद ४ आहे आणि अंश ३ आहे.',
        },
      },
      {
        title: 'Step 4 — Comparing Simple Fractions',
        titleTranslations: {
          en: 'Step 4 — Comparing Simple Fractions',
          hi: 'चरण 4 — भिन्नों की तुलना करना',
          mr: 'पायरी ४ — अपूर्णांकांची तुलना करणे',
        },
        content: 'When denominators are the same, the fraction with the larger numerator is bigger. 3/4 is greater than 2/4.',
        contentTranslations: {
          en: 'When denominators are the same, the fraction with the larger numerator is bigger. 3/4 is greater than 2/4.',
          hi: 'जब हर समान होते हैं, तो बड़े अंश वाली भिन्न बड़ी होती है। 3/4, 2/4 से बड़ा है।',
          mr: 'जेव्हा छेद सारखे असतात, तेव्हा ज्याचा अंश मोठा तो अपूर्णांक मोठा असतो. ३/४ हा २/४ पेक्षा मोठा आहे.',
        },
        narrationText: {
          en: 'When comparing fractions with the same denominator, simply look at the numerator. More slices means a bigger amount!',
          hi: 'जब हर समान हों तो बस अंश को देखें। अधिक टुकड़े मतलब अधिक भाग!',
          mr: 'छेद सारखा असेल तर फक्त अंश पाहा. जास्त तुकडे म्हणजे जास्त भाग!',
        },
        example: '3/8 of pizza is more than 1/8 of pizza.',
        exampleTranslations: {
          en: '3/8 of pizza is more than 1/8 of pizza.',
          hi: 'पिज़्ज़ा का 3/8 हिस्सा, 1/8 हिस्से से बड़ा है।',
          mr: 'पिझ्झाचा ३/८ भाग हा १/८ भागापेक्षा मोठा आहे.',
        },
      },
    ],
    shortNotes: {
      summary: 'A fraction represents equal parts of a whole object or group. Written as Numerator / Denominator.',
      summaryTranslations: {
        en: 'A fraction represents equal parts of a whole object or group. Written as Numerator / Denominator.',
        hi: 'भिन्न किसी वस्तु या समूह के बराबर हिस्सों को दर्शाती है। इसे अंश / हर के रूप में लिखा जाता है।',
        mr: 'अपूर्णांक संपूर्ण वस्तूचे समान भाग दर्शवतो. तो अंश / छेद असा लिहिला जातो.',
      },
      keyPoints: [
        'A fraction requires all parts to be equal in size.',
        'Numerator (top) = parts we have or are talking about.',
        'Denominator (bottom) = total equal parts the whole is divided into.',
        '1/2 is called "one half", 1/4 is called "one fourth" or "quarter".',
      ],
      keyPointsTranslations: {
        en: [
          'A fraction requires all parts to be equal in size.',
          'Numerator (top) = parts we have or are talking about.',
          'Denominator (bottom) = total equal parts the whole is divided into.',
          '1/2 is called "one half", 1/4 is called "one fourth" or "quarter".',
        ],
        hi: [
          'भिन्न के लिए सभी भागों का समान होना अनिवार्य है।',
          'अंश (ऊपर) = हमारे पास मौजूद हिस्सों की संख्या।',
          'हर (नीचे) = पूरी वस्तु के कुल समान हिस्से।',
          '1/2 को "आधा" और 1/4 को "चौथाई" कहते हैं।',
        ],
        mr: [
          'अपूर्णांकासाठी सर्व भाग समान आकाराचे असणे आवश्यक आहे.',
          'अंश (वर) = आपल्याकडील घेतलेले भाग.',
          'छेद (खाली) = एकूण केलेले समान भाग.',
          '१/२ ला "अर्धा" आणि १/४ ला "पाव" म्हणतात.',
        ],
      },
      definitions: [
        { term: 'Numerator', meaning: 'The top number showing selected parts' },
        { term: 'Denominator', meaning: 'The bottom number showing total equal parts' },
      ],
      definitionsTranslations: {
        en: [
          { term: 'Numerator', meaning: 'The top number showing selected parts' },
          { term: 'Denominator', meaning: 'The bottom number showing total equal parts' },
        ],
        hi: [
          { term: 'अंश (Numerator)', meaning: 'ऊपर की संख्या जो चुने गए हिस्से दिखाती है' },
          { term: 'हर (Denominator)', meaning: 'नीचे की संख्या जो कुल बराबर भाग दिखाती है' },
        ],
        mr: [
          { term: 'अंश (Numerator)', meaning: 'वरची संख्या जी घेतलेले भाग दर्शवते' },
          { term: 'छेद (Denominator)', meaning: 'खालची संख्या जी एकूण समान भाग दर्शवते' },
        ],
      },
      rememberTip: 'Remember: Denominator is Down at the Bottom (D for Down, D for Denominator)!',
      rememberTipTranslations: {
        en: 'Remember: Denominator is Down at the Bottom (D for Down, D for Denominator)!',
        hi: 'याद रखें: Denominator नीचे (Down) होता है — D से Down, D से Denominator!',
        mr: 'लक्षात ठेवा: छेद नेहमी खाली (Down) असतो!',
      },
    },
    knowledgeCheck: {
      question: 'A watermelon is cut into 6 equal pieces. If you take 2 pieces, what fraction do you have?',
      questionTranslations: {
        en: 'A watermelon is cut into 6 equal pieces. If you take 2 pieces, what fraction do you have?',
        hi: 'एक तरबूज को 6 बराबर भागों में काटा गया है। यदि आप 2 टुकड़े लेते हैं, तो आपके पास कितना भिन्न भाग है?',
        mr: 'एका कलिंगडाचे ६ समान तुकडे केले आहेत. तुम्ही २ तुकडे घेतले, तर तुमच्याकडे कलिंगडाचा किती अपूर्णांक भाग आहे?',
      },
      options: ['2/6', '6/2', '2/8', '4/6'],
      optionsTranslations: {
        en: ['2/6', '6/2', '2/8', '4/6'],
        hi: ['2/6', '6/2', '2/8', '4/6'],
        mr: ['२/६', '६/२', '२/८', '४/६'],
      },
      correctIndex: 0,
      explanation: 'You took 2 pieces (numerator) out of 6 total pieces (denominator), which is 2/6.',
      explanationTranslations: {
        en: 'You took 2 pieces (numerator) out of 6 total pieces (denominator), which is 2/6.',
        hi: 'आपने कुल 6 टुकड़ों (हर) में से 2 टुकड़े (अंश) लिए हैं, इसलिए भिन्न 2/6 है।',
        mr: 'तुम्ही एकूण ६ तुकड्यांपैकी (छेद) २ तुकडे (अंश) घेतले आहेत, म्हणून अपूर्णांक २/६ आहे.',
      },
    },
    quizId: 'quiz-math-fractions-g4',
    durationMinutes: 15,
    tags: ['fractions', 'numerator', 'denominator', 'parts', 'whole'],
  },

  // ──────────────────────────────────────────────────────────
  // 2. SCIENCE — The Water Cycle
  // ──────────────────────────────────────────────────────────
  {
    id: 'sci-water-cycle-g4',
    subjectId: 'science',
    grade: 4,
    title: 'The Water Cycle',
    titleTranslations: {
      en: 'The Water Cycle',
      hi: 'जल चक्र (The Water Cycle)',
      mr: 'जलचक्र (The Water Cycle)',
    },
    summary: 'Discover how water moves through nature — from oceans to clouds to rain and back again.',
    summaryTranslations: {
      en: 'Discover how water moves through nature — from oceans to clouds to rain and back again.',
      hi: 'जानें कि प्रकृति में जल कैसे घूमता है — समुद्र से बादलों में, बारिश के रूप में धरती पर और फिर वापस समुद्र में।',
      mr: 'निसर्गात पाणी कसे फिरते ते जाणून घ्या — समुद्रातून ढगांत, पावसाच्या रूपात जमिनीवर आणि पुन्हा समुद्रात.',
    },
    objectives: [
      {
        id: 'obj-wc-1',
        description: 'Name the four main stages of the water cycle',
        descriptionTranslations: {
          en: 'Name the four main stages of the water cycle',
          hi: 'जल चक्र के चार प्रमुख चरणों के नाम बताना',
          mr: 'जलचक्राच्या चार प्रमुख टप्प्यांची नावे सांगणे',
        },
      },
      {
        id: 'obj-wc-2',
        description: 'Explain evaporation and condensation in simple terms',
        descriptionTranslations: {
          en: 'Explain evaporation and condensation in simple terms',
          hi: 'वाष्पीकरण (Evaporation) और संघनन (Condensation) को सरल शब्दों में समझाना',
          mr: 'बाष्पीभवन आणि संघनन सोप्या शब्दांत स्पष्ट करणे',
        },
      },
      {
        id: 'obj-wc-3',
        description: 'Understand why the water cycle is important for life on Earth',
        descriptionTranslations: {
          en: 'Understand why the water cycle is important for life on Earth',
          hi: 'समझना कि पृथ्वी पर जीवन के लिए जल चक्र क्यों आवश्यक है',
          mr: 'पृथ्वीवरील सजीवांसाठी जलचक्र का महत्त्वाचे आहे हे समजून घेणे',
        },
      },
    ],
    explanation: `The **water cycle** is the continuous journey of water through nature.

Water never disappears — it just keeps changing form between liquid, gas (vapour), and ice!

The four main stages are:
1. **Evaporation** — Liquid water heats up and turns into invisible water vapour.
2. **Condensation** — Water vapour cools down and turns into tiny droplets, forming clouds.
3. **Precipitation** — Droplets get heavy and fall as rain, snow, or hail.
4. **Collection** — Water gathers in rivers, lakes, oceans, and underground.`,
    explanationTranslations: {
      en: `The **water cycle** is the continuous journey of water through nature.

Water never disappears — it just keeps changing form between liquid, gas (vapour), and ice!

The four main stages are:
1. **Evaporation** — Liquid water heats up and turns into invisible water vapour.
2. **Condensation** — Water vapour cools down and turns into tiny droplets, forming clouds.
3. **Precipitation** — Droplets get heavy and fall as rain, snow, or hail.
4. **Collection** — Water gathers in rivers, lakes, oceans, and underground.`,
      hi: `**जल चक्र** प्रकृति में पानी का निरंतर चलने वाला सफर है।

पानी कभी खत्म नहीं होता — यह केवल तरल, गैस (वाष्प) और बर्फ के रूप में अपना रूप बदलता रहता है!

इसके चार प्रमुख चरण हैं:
1. **वाष्पीकरण (Evaporation)** — सूरज की गर्मी से पानी भाप बनकर हवा में उड़ता है।
2. **संघनन (Condensation)** — भाप ऊपर जाकर ठंडी होती है और बादलों का रूप ले लेती है।
3. **वर्षा (Precipitation)** — बादल भारी होकर बारिश, बर्फ या ओले के रूप में गिरते हैं।
4. **संग्रहण (Collection)** — पानी नदियों, झीलों और समुद्रों में इकट्ठा होता है।`,
      mr: `**जलचक्र** म्हणजे निसर्गातील पाण्याचा अविरत चालणारा प्रवास होय.

पाणी कधीही नष्ट होत नाही — ते फक्त द्रव, वायू (वाफ) आणि बर्फ या रूपात बदलत राहते!

याचे चार मुख्य टप्पे आहेत:
१. **बाष्पीभवन (Evaporation)** — सूर्याच्या उष्णतेने पाण्याचे रूपांतर वाफेमध्ये होते.
२. **संघनन (Condensation)** — हवेतील वाफ थंड होऊन त्याचे ढग बनतात.
३. **पर्जन्यवृष्टी (Precipitation)** — ढग जड झाल्यावर पाऊस किंवा गारांच्या रूपात पाणी जमिनीवर पडते.
४. **पाणी साठणे (Collection)** — हे पाणी नदी, तलाव, समुद्र आणि जमिनीत साठवले जाते.`,
    },
    realLifeExample: `☁️ **Kitchen Science Example!**

When water boils in a pot:
• Steam rises → **Evaporation**
• If you hold a cold lid over it, drops form on the lid → **Condensation**
• When the drops fall down → **Precipitation**!`,
    realLifeExampleTranslations: {
      en: `☁️ **Kitchen Science Example!**

When water boils in a pot:
• Steam rises → **Evaporation**
• If you hold a cold lid over it, drops form on the lid → **Condensation**
• When the drops fall down → **Precipitation**!`,
      hi: `☁️ **रसोईघर का विज्ञान!**

जब रसोई में पतीले में पानी उबलता है:
• भाप ऊपर उठती है → **वाष्पीकरण (Evaporation)**
• यदि उस पर ठंडा ढक्कन रखें, तो ढक्कन पर पानी की बूँदें जम जाती हैं → **संघनन (Condensation)**
• जब वे बूँदें नीचे टपकती हैं → **वर्षा (Precipitation)**!`,
      mr: `☁️ **स्वयंपाकघरातील सोपा प्रयोग!**

जेव्हा पातेल्यात पाणी उकळते:
• वाफ वर जाते → **बाष्पीभवन (Evaporation)**
• त्यावर थंड झाकण धरल्यास त्यावर पाण्याचे थेंब जमतात → **संघनन (Condensation)**
• ते थेंब खाली पडतात → **पाऊस (Precipitation)**!`,
    },
    steps: [
      {
        title: 'Stage 1 — Evaporation',
        titleTranslations: {
          en: 'Stage 1 — Evaporation',
          hi: 'चरण 1 — वाष्पीकरण (Evaporation)',
          mr: 'टप्पा १ — बाष्पीभवन (Evaporation)',
        },
        content: 'The sun heats water in oceans and rivers. Water changes into invisible water vapour and rises into the sky.',
        contentTranslations: {
          en: 'The sun heats water in oceans and rivers. Water changes into invisible water vapour and rises into the sky.',
          hi: 'सूरज की धूप समुद्र, नदियों और झीलों के पानी को गर्म करती है। पानी भाप बनकर आसमान में ऊपर उठता है।',
          mr: 'सूर्याची उष्णता समुद्र, नद्या आणि तलावांचे पाणी तापवते. पाण्याचे रूपांतर वाफेत होऊन ती आकाशात वर जाते.',
        },
        narrationText: {
          en: 'In stage one, the sun provides heat energy. Liquid water warms up and turns into water vapour gas, rising up.',
          hi: 'पहले चरण में सूरज गर्मी देता है। पानी गर्म होकर भाप बनता है और आसमान में उठता है।',
          mr: 'पहिल्या टप्प्यात सूर्य उष्णता देतो. पाणी तापून त्याची वाफ होते आणि ती आकाशात वर जाते.',
        },
        example: 'Wet clothes drying under the sun.',
        exampleTranslations: {
          en: 'Wet clothes drying under the sun.',
          hi: 'धूप में गीले कपड़ों का सूखना वाष्पीकरण का उदाहरण है।',
          mr: 'उन्हात ओले कपडे वाळणे हे बाष्पीभवनाचे उदाहरण आहे.',
        },
      },
      {
        title: 'Stage 2 — Condensation',
        titleTranslations: {
          en: 'Stage 2 — Condensation',
          hi: 'चरण 2 — संघनन (Condensation)',
          mr: 'टप्पा २ — संघनन (Condensation)',
        },
        content: 'High in the atmosphere, air is cold. Water vapour cools down and turns back into tiny water droplets, creating clouds.',
        contentTranslations: {
          en: 'High in the atmosphere, air is cold. Water vapour cools down and turns back into tiny water droplets, creating clouds.',
          hi: 'ऊपर आसमान में हवा ठंडी होती है। भाप ठंडी होकर पानी की नन्हीं बूँदों में बदल जाती है और बादलों का निर्माण करती है।',
          mr: 'आकाशात वरची हवा थंड असते. त्यामुळे वाफ थंड होऊन पाण्याचे सूक्ष्म थेंब तयार होतात आणि त्यांचे ढग बनतात.',
        },
        narrationText: {
          en: 'As water vapour climbs high, cool air turns it back into liquid droplets that form fluffy clouds.',
          hi: 'जब भाप ऊपर जाती है, ठंडी हवा उसे नन्हीं बूँदों में बदल देती है, जिससे बादल बनते हैं।',
          mr: 'वाफ उंच गेल्यावर थंड हवेमुळे तिचे पाण्याचे थेंब बनतात आणि ढग तयार होतात.',
        },
        example: 'Water droplets forming on the outside of a cold water bottle.',
        exampleTranslations: {
          en: 'Water droplets forming on the outside of a cold water bottle.',
          hi: 'ठंडी पानी की बोतल के बाहर बूँदों का जमना।',
          mr: 'थंड पाण्याच्या बाटलीच्या बाहेर पाण्याचे थेंब जमा होणे.',
        },
      },
      {
        title: 'Stage 3 — Precipitation',
        titleTranslations: {
          en: 'Stage 3 — Precipitation',
          hi: 'चरण 3 — वर्षा (Precipitation)',
          mr: 'टप्पा ३ — पर्जन्यवृष्टी (Precipitation)',
        },
        content: 'When clouds get too full and heavy with water, gravity pulls the droplets down as rain, snow, or hail.',
        contentTranslations: {
          en: 'When clouds get too full and heavy with water, gravity pulls the droplets down as rain, snow, or hail.',
          hi: 'जब बादल बहुत भारी हो जाते हैं और पानी संभाल नहीं पाते, तो बूँदें बारिश, बर्फ या ओलों के रूप में धरती पर गिरती हैं।',
          mr: 'जेव्हा ढग पाण्याने खूप जड होतात, तेव्हा ते पाणी पाऊस, बर्फ किंवा गारांच्या स्वरूपात जमिनीवर कोसळते.',
        },
        narrationText: {
          en: 'Stage three is precipitation! Heavy water droplets fall back to Earth bringing fresh water.',
          hi: 'तीसरा चरण है वर्षा! जब बादल भारी होते हैं तो बारिश धरती को ताजा पानी देती है।',
          mr: 'तिसरा टप्पा म्हणजे पाऊस! जड झालेले ढग पृथ्वीवर पावसाचे ताजे पाणी आणतात.',
        },
        example: 'Rain showers on crops and mountains.',
        exampleTranslations: {
          en: 'Rain showers on crops and mountains.',
          hi: 'खेतों और पहाड़ों पर बारिश की फुहारें।',
          mr: 'शेतांवर आणि डोंगरावर पडणारा पाऊस.',
        },
      },
      {
        title: 'Stage 4 — Collection',
        titleTranslations: {
          en: 'Stage 4 — Collection',
          hi: 'चरण 4 — संग्रहण (Collection)',
          mr: 'टप्पा ४ — पाणी साठणे (Collection)',
        },
        content: 'Rainwater flows over land into rivers, lakes, and oceans. Some sinks deep into the ground. Then the cycle starts all over again!',
        contentTranslations: {
          en: 'Rainwater flows over land into rivers, lakes, and oceans. Some sinks deep into the ground. Then the cycle starts all over again!',
          hi: 'बारिश का पानी बहकर नदियों, झीलों और समुद्र में इकट्ठा होता है। कुछ पानी जमीन सोख लेती है। फिर यह चक्र पुनः शुरू होता है!',
          mr: 'पावसाचे पाणी वाहून नद्या, तलाव आणि समुद्रात जमा होते. काही पाणी जमिनीत मुरते. त्यानंतर हे चक्र पुन्हा सुरू होते!',
        },
        narrationText: {
          en: 'Finally, water gathers in rivers and oceans. The sun will heat it again, repeating this endless cycle of life.',
          hi: 'अंत में पानी नदियों और सागर में मिलता है। सूरज इसे फिर गर्म करेगा और यह चक्र हमेशा चलता रहेगा।',
          mr: 'शेवटी पाणी नदी आणि समुद्रात साठते. सूर्य त्याला पुन्हा तापवेल आणि हे चक्र अविरत चालू राहील.',
        },
        example: 'Rivers flowing toward the sea and groundwater filling wells.',
        exampleTranslations: {
          en: 'Rivers flowing toward the sea and groundwater filling wells.',
          hi: 'समुद्र की ओर बहती नदियाँ और कुओं को भरने वाला भूजल।',
          mr: 'समुद्राकडे वाहणाऱ्या नद्या आणि विहिरींमध्ये साठणारे भूजल.',
        },
      },
    ],
    shortNotes: {
      summary: 'The water cycle continuously moves water through Evaporation → Condensation → Precipitation → Collection.',
      summaryTranslations: {
        en: 'The water cycle continuously moves water through Evaporation → Condensation → Precipitation → Collection.',
        hi: 'जल चक्र पानी को लगातार चार चरणों में घुमाता है: वाष्पीकरण → संघनन → वर्षा → संग्रहण।',
        mr: 'जलचक्र पाणी सतत फिरवते: बाष्पीभवन → संघनन → पाऊस → पाणी साठणे.',
      },
      keyPoints: [
        'The Sun is the main power source of the water cycle.',
        'Evaporation = liquid to gas (water vapour).',
        'Condensation = gas (vapour) cooling into liquid droplets (clouds).',
        'Precipitation = rain, snow, sleet, or hail.',
        'The same water has been recycled on Earth for millions of years.',
      ],
      keyPointsTranslations: {
        en: [
          'The Sun is the main power source of the water cycle.',
          'Evaporation = liquid to gas (water vapour).',
          'Condensation = gas (vapour) cooling into liquid droplets (clouds).',
          'Precipitation = rain, snow, sleet, or hail.',
          'The same water has been recycled on Earth for millions of years.',
        ],
        hi: [
          'सूर्य जल चक्र का मुख्य ऊर्जा स्रोत है।',
          'वाष्पीकरण = पानी का भाप (गैस) में बदलना।',
          'संघनन = भाप का ठंडा होकर बूँदों (बादलों) में बदलना।',
          'वर्षा = बारिश, बर्फ या ओले गिरना।',
          'वही पानी लाखों सालों से लगातार रीसायकल हो रहा है।',
        ],
        mr: [
          'सूर्य हा जलचक्राचा मुख्य ऊर्जा स्रोत आहे.',
          'बाष्पीभवन = द्रवाचे वाफेत रूपांतर होणे.',
          'संघनन = वाफ थंड होऊन पाण्याचे थेंब (ढग) बनणे.',
          'पर्जन्य = पाऊस, बर्फ किंवा गारा पडणे.',
          'हेच पाणी लाखो वर्षांपासून अविरतपणे फिरत आहे.',
        ],
      },
      definitions: [
        { term: 'Evaporation', meaning: 'Liquid changing into gas/vapour due to heat' },
        { term: 'Condensation', meaning: 'Gas/vapour cooling into liquid drops' },
        { term: 'Precipitation', meaning: 'Water falling from clouds to Earth' },
      ],
      definitionsTranslations: {
        en: [
          { term: 'Evaporation', meaning: 'Liquid changing into gas/vapour due to heat' },
          { term: 'Condensation', meaning: 'Gas/vapour cooling into liquid drops' },
          { term: 'Precipitation', meaning: 'Water falling from clouds to Earth' },
        ],
        hi: [
          { term: 'वाष्पीकरण (Evaporation)', meaning: 'गर्मी से पानी का भाप में बदलना' },
          { term: 'संघनन (Condensation)', meaning: 'भाप का ठंडा होकर पानी की बूँदें बनना' },
          { term: 'वर्षा (Precipitation)', meaning: 'बादलों से पानी का धरती पर गिरना' },
        ],
        mr: [
          { term: 'बाष्पीभवन (Evaporation)', meaning: 'उष्णतेमुळे पाण्याचे वाफेत रूपांतर होणे' },
          { term: 'संघनन (Condensation)', meaning: 'वाफ थंड होऊन पाण्याचे थेंब बनणे' },
          { term: 'पर्जन्य (Precipitation)', meaning: 'ढगांमधून पाणी जमिनीवर पडणे' },
        ],
      },
      rememberTip: 'Remember: Evaporation Goes UP, Precipitation Comes DOWN!',
      rememberTipTranslations: {
        en: 'Remember: Evaporation Goes UP, Precipitation Comes DOWN!',
        hi: 'याद रखें: वाष्पीकरण ऊपर (UP) जाता है, और वर्षा नीचे (DOWN) आती है!',
        mr: 'लक्षात ठेवा: बाष्पीभवन वर जाते आणि पाऊस खाली येतो!',
      },
    },
    knowledgeCheck: {
      question: 'What process turns liquid water into water vapour gas when heated by the sun?',
      questionTranslations: {
        en: 'What process turns liquid water into water vapour gas when heated by the sun?',
        hi: 'सूरज की गर्मी से पानी का भाप में बदलना कौन सी प्रक्रिया कहलाता है?',
        mr: 'सूर्याच्या उष्णतेमुळे पाण्याचे वाफेत रूपांतर होण्याच्या प्रक्रियेला काय म्हणतात?',
      },
      options: ['Condensation', 'Precipitation', 'Evaporation', 'Collection'],
      optionsTranslations: {
        en: ['Condensation', 'Precipitation', 'Evaporation', 'Collection'],
        hi: ['संघनन', 'वर्षा', 'वाष्पीकरण', 'संग्रहण'],
        mr: ['संघनन', 'पर्जन्यवृष्टी', 'बाष्पीभवन', 'पाणी साठणे'],
      },
      correctIndex: 2,
      explanation: 'Evaporation is the stage where heat turns liquid water into water vapour.',
      explanationTranslations: {
        en: 'Evaporation is the stage where heat turns liquid water into water vapour.',
        hi: 'वाष्पीकरण वह प्रक्रिया है जिसमें गर्मी से पानी भाप बनता है।',
        mr: 'बाष्पीभवन म्हणजे उष्णतेमुळे पाण्याचे रूपांतर वाफेत होणे.',
      },
    },
    quizId: 'quiz-sci-water-cycle-g4',
    durationMinutes: 15,
    tags: ['water cycle', 'evaporation', 'condensation', 'precipitation', 'environment'],
  },

  // ──────────────────────────────────────────────────────────
  // 3. ENGLISH — Nouns
  // ──────────────────────────────────────────────────────────
  {
    id: 'eng-nouns-g4',
    subjectId: 'english',
    grade: 4,
    title: 'Nouns — Naming Words',
    titleTranslations: {
      en: 'Nouns — Naming Words',
      hi: 'संज्ञा — नाम वाले शब्द (Nouns)',
      mr: 'नाम आणि त्याचे प्रकार (Nouns)',
    },
    summary: 'Find out what nouns are, the different types of nouns, and how to spot them in sentences.',
    summaryTranslations: {
      en: 'Find out what nouns are, the different types of nouns, and how to spot them in sentences.',
      hi: 'जानें कि संज्ञा (Noun) क्या है, इसके विभिन्न प्रकार कौन से हैं और वाक्यों में इसे कैसे पहचानें।',
      mr: 'नाम म्हणजे काय, नामाचे विविध प्रकार कोणते आणि वाक्यात नाम कसे ओळखायचे ते शिका.',
    },
    objectives: [
      {
        id: 'obj-noun-1',
        description: 'Define what a noun is and give examples',
        descriptionTranslations: {
          en: 'Define what a noun is and give examples',
          hi: 'संज्ञा की परिभाषा जानना और उदाहरण देना',
          mr: 'नामाची व्याख्या समजून घेऊन उदाहरणे देणे',
        },
      },
      {
        id: 'obj-noun-2',
        description: 'Distinguish between common and proper nouns',
        descriptionTranslations: {
          en: 'Distinguish between common and proper nouns',
          hi: 'जातिवाचक (Common) और व्यक्तिवाचक (Proper) संज्ञा में अंतर समझना',
          mr: 'सामान्य नाम आणि विशेष नाम यातील फरक ओळखणे',
        },
      },
      {
        id: 'obj-noun-3',
        description: 'Identify concrete, abstract, and collective nouns',
        descriptionTranslations: {
          en: 'Identify concrete, abstract, and collective nouns',
          hi: 'भाववाचक और समूहवाचक संज्ञा की पहचान करना',
          mr: 'भाववाचक आणि समूहवाचक नाम ओळखणे',
        },
      },
    ],
    explanation: `A **noun** is a word that names a **person, place, animal, thing, or idea**.

Almost every sentence we speak or read has nouns!

Major types of nouns:
• **Common Nouns** — general names (teacher, city, dog, book).
• **Proper Nouns** — specific names that always begin with a Capital letter (Priya, Mumbai, India).
• **Concrete Nouns** — things you can see, hear, or touch (apple, table, rain).
• **Abstract Nouns** — feelings or ideas you cannot touch (happiness, honesty, courage).
• **Collective Nouns** — a single word for a group (a herd of elephants, a team of players).`,
    explanationTranslations: {
      en: `A **noun** is a word that names a **person, place, animal, thing, or idea**.

Almost every sentence we speak or read has nouns!

Major types of nouns:
• **Common Nouns** — general names (teacher, city, dog, book).
• **Proper Nouns** — specific names that always begin with a Capital letter (Priya, Mumbai, India).
• **Concrete Nouns** — things you can see, hear, or touch (apple, table, rain).
• **Abstract Nouns** — feelings or ideas you cannot touch (happiness, honesty, courage).
• **Collective Nouns** — a single word for a group (a herd of elephants, a team of players).`,
      hi: `किसी **व्यक्ति, स्थान, पशु, वस्तु या भाव के नाम** को **संज्ञा (Noun)** कहते हैं।

संज्ञा के प्रमुख प्रकार:
• **जातिवाचक संज्ञा (Common Noun)** — सामान्य नाम (अध्यापक, शहर, कुत्ता, किताब)।
• **व्यक्तिवाचक संज्ञा (Proper Noun)** — किसी विशेष व्यक्ति या जगह का नाम, जो हमेशा बड़े अक्षर (Capital letter) से शुरू होता है (प्रिया, मुंबई, भारत)।
• **मूर्त संज्ञा (Concrete Noun)** — वे वस्तुएं जिन्हें हम देख या छू सकते हैं (मेज, सेब, वर्षा)।
• **भाववाचक संज्ञा (Abstract Noun)** — भावनाएं या विचार जिन्हें छुआ नहीं जा सकता (खुशी, ईमानदारी, साहस)।
• **समूहवाचक संज्ञा (Collective Noun)** — किसी समूह का एक नाम (खिलाड़ियों की टीम, हाथियों का झुंड)।`,
      mr: `कोणत्याही **व्यक्ती, ठिकाण, प्राणी, वस्तू किंवा गुणांच्या नावाला** **नाम (Noun)** म्हणतात.

नामाचे महत्त्वाचे प्रकार:
• **सामान्य नाम (Common Noun)** — एकाच जातीच्या सर्व घटकांसाठी वापरले जाणारे नाव (मुलगा, नदी, शहर, पुस्तक).
• **विशेष नाम (Proper Noun)** — एखाद्या विशिष्ट व्यक्तीचे किंवा ठिकाणाचे नाव (प्रिया, मुंबई, भारत).
• **मूर्त नाम (Concrete Noun)** — ज्या वस्तू आपण पाहू किंवा स्पर्श करू शकतो (सफरचंद, टेबल, पाऊस).
• **भाववाचक नाम (Abstract Noun)** — ज्या भावना किंवा गुण आपण फक्त अनुभवू शकतो (आनंद, धैर्य, प्रामाणिकपणा).
• **समूहवाचक नाम (Collective Noun)** — समूहाचा बोध करून देणारा शब्द (हत्तींचा कळप, खेळाडूंचा संघ).`,
    },
    realLifeExample: `🏫 **Look around your classroom!**

Everything you can NAME is a noun:
• Person: Teacher, Friend, Rahul
• Place: Classroom, Playground, Delhi
• Thing: Pencil, Notebook, Blackboard
• Feeling: Curiosity, Joy of learning!`,
    realLifeExampleTranslations: {
      en: `🏫 **Look around your classroom!**

Everything you can NAME is a noun:
• Person: Teacher, Friend, Rahul
• Place: Classroom, Playground, Delhi
• Thing: Pencil, Notebook, Blackboard
• Feeling: Curiosity, Joy of learning!`,
      hi: `🏫 **अपनी कक्षा में चारों ओर देखें!**

हर चीज़ जिसका कोई नाम है, वह संज्ञा है:
• व्यक्ति: अध्यापक, दोस्त, राहुल
• स्थान: कक्षा, खेल का मैदान, दिल्ली
• वस्तु: पेंसिल, कॉपी, श्यामपट्ट (Blackboard)
• भाव: सीखने की खुशी, उत्सुकता!`,
      mr: `🏫 **तुमच्या वर्गात आजूबाजूला पाहा!**

ज्या प्रत्येक गोष्टीला नाव आहे ते नाम आहे:
• व्यक्ती: शिक्षक, मित्र, राहुल
• ठिकाण: वर्गखोली, मैदान, मुंबई
• वस्तू: पेन्सिल, वही, फळा
• भावना: शिकण्याचा आनंद, कुतूहल!`,
    },
    steps: [
      {
        title: 'Step 1 — Person, Place, Thing, or Idea?',
        titleTranslations: {
          en: 'Step 1 — Person, Place, Thing, or Idea?',
          hi: 'चरण 1 — व्यक्ति, स्थान, वस्तु या विचार?',
          mr: 'पायरी १ — व्यक्ती, ठिकाण, वस्तू किंवा विचार?',
        },
        content: 'To find a noun, ask: "Is this a name of someone, somewhere, or something?" If yes, it is a noun!',
        contentTranslations: {
          en: 'To find a noun, ask: "Is this a name of someone, somewhere, or something?" If yes, it is a noun!',
          hi: 'संज्ञा पहचानने के लिए पूछें: "क्या यह किसी व्यक्ति, जगह या चीज़ का नाम है?" यदि हाँ, तो यह संज्ञा है!',
          mr: 'नाम शोधण्यासाठी विचारा: "हे कोणाचे, कशाचे किंवा कुठल्या ठिकाणाचे नाव आहे का?" उत्तर हो असेल तर ते नाम आहे!',
        },
        narrationText: {
          en: 'Nouns are naming words. Whenever you want to name something you see or feel, you are using a noun!',
          hi: 'संज्ञा नाम बताने वाले शब्द हैं। जो कुछ भी आप देखते या महसूस करते हैं उसका नाम संज्ञा है!',
          mr: 'नाम म्हणजे नाव दर्शवणारे शब्द. आपण जे काही पाहतो किंवा अनुभवतो त्याला दिलेले नाव म्हणजे नाम!',
        },
        example: '"Dog" = animal ✓ | "Mumbai" = place ✓ | "Run" = action ✗ (verb)',
        exampleTranslations: {
          en: '"Dog" = animal ✓ | "Mumbai" = place ✓ | "Run" = action ✗ (verb)',
          hi: '"कुत्ता" = जानवर ✓ | "मुंबई" = स्थान ✓ | "दौड़ना" = क्रिया ✗',
          mr: '"कुत्रा" = प्राणी ✓ | "मुंबई" = ठिकाण ✓ | "पळणे" = क्रिया ✗',
        },
      },
      {
        title: 'Step 2 — Common vs Proper Nouns',
        titleTranslations: {
          en: 'Step 2 — Common vs Proper Nouns',
          hi: 'चरण 2 — जातिवाचक और व्यक्तिवाचक संज्ञा',
          mr: 'पायरी २ — सामान्य नाम आणि विशेष नाम',
        },
        content: 'A common noun is a general word like "river" or "boy". A proper noun is a specific name like "Ganga" or "Aarav", always capitalized.',
        contentTranslations: {
          en: 'A common noun is a general word like "river" or "boy". A proper noun is a specific name like "Ganga" or "Aarav", always capitalized.',
          hi: 'जातिवाचक संज्ञा सामान्य नाम है जैसे "नदी" या "लड़का"। व्यक्तिवाचक संज्ञा विशेष नाम है जैसे "गंगा" या "आरव"।',
          mr: 'सामान्य नाम सर्वसाधारण असते जसे की "नदी" किंवा "मुलगा". विशेष नाम विशिष्ट नाव असते जसे की "गंगा" किंवा "आरव".',
        },
        narrationText: {
          en: 'Common nouns name any general item, while proper nouns give the special exact name, like your own name!',
          hi: 'जातिवाचक नाम सामान्य होते हैं, जबकि व्यक्तिवाचक नाम खास होते हैं, जैसे आपका अपना नाम!',
          mr: 'सामान्य नाम सर्वसाधारण असते, तर विशेष नाम एखाद्याचे स्वतःचे खास नाव असते, जसे तुमचे नाव!',
        },
        example: 'city (common) → Delhi (proper)',
        exampleTranslations: {
          en: 'city (common) → Delhi (proper)',
          hi: 'शहर (जातिवाचक) → दिल्ली (व्यक्तिवाचक)',
          mr: 'शहर (सामान्य नाम) → दिल्ली (विशेष नाम)',
        },
      },
      {
        title: 'Step 3 — Abstract and Collective Nouns',
        titleTranslations: {
          en: 'Step 3 — Abstract and Collective Nouns',
          hi: 'चरण 3 — भाववाचक और समूहवाचक संज्ञा',
          mr: 'पायरी ३ — भाववाचक आणि समूहवाचक नाम',
        },
        content: 'Abstract nouns name feelings and qualities like "bravery" and "joy". Collective nouns name a whole group like "a flock of birds".',
        contentTranslations: {
          en: 'Abstract nouns name feelings and qualities like "bravery" and "joy". Collective nouns name a whole group like "a flock of birds".',
          hi: 'भाववाचक संज्ञा भावनाओं और गुणों को नाम देती है जैसे "बहादुरी" और "आनंद"। समूहवाचक संज्ञा पूरे समूह का नाम होती है जैसे "पक्षियों का झुंड"।',
          mr: 'भाववाचक नाम भावना किंवा गुणांचे नाव असते जसे "शौर्य" आणि "आनंद". समूहवाचक नाम समूहाला दर्शवते जसे "पक्ष्यांचा थवा".',
        },
        narrationText: {
          en: 'You cannot touch bravery or joy, but they are real feelings — that makes them abstract nouns. And words like team or herd are collective nouns.',
          hi: 'आप बहादुरी या खुशी को छू नहीं सकते पर वे सच हैं — इसलिए वे भाववाचक संज्ञा हैं। टीम या झुंड समूहवाचक संज्ञा हैं।',
          mr: 'तुम्ही आनंद किंवा शौर्याला स्पर्श करू शकत नाही, पण ते भाव आहेत म्हणून ते भाववाचक नाम आहेत. संघ किंवा कळप समूहवाचक आहेत.',
        },
        example: '"Courage" is abstract. "A herd of cows" is collective.',
        exampleTranslations: {
          en: '"Courage" is abstract. "A herd of cows" is collective.',
          hi: '"साहस" भाववाचक है। "गायों का झुंड" समूहवाचक है।',
          mr: '"धैर्य" भाववाचक आहे. "गायींचा कळप" समूहवाचक आहे.',
        },
      },
    ],
    shortNotes: {
      summary: 'Nouns are naming words for people, places, animals, things, and ideas.',
      summaryTranslations: {
        en: 'Nouns are naming words for people, places, animals, things, and ideas.',
        hi: 'संज्ञा किसी व्यक्ति, वस्तु, स्थान, प्राणी या भाव के नाम को कहते हैं।',
        mr: 'कोणत्याही व्यक्ती, वस्तू, ठिकाण, प्राणी किंवा भावना यांच्या नावाला नाम म्हणतात.',
      },
      keyPoints: [
        'Proper nouns always start with a capital letter.',
        'Common nouns are general names (city, book, teacher).',
        'Concrete nouns can be touched or seen (desk, water, fruit).',
        'Abstract nouns cannot be physically touched (love, courage, time).',
        'Collective nouns describe groups (herd, team, pack, bouquet).',
      ],
      keyPointsTranslations: {
        en: [
          'Proper nouns always start with a capital letter.',
          'Common nouns are general names (city, book, teacher).',
          'Concrete nouns can be touched or seen (desk, water, fruit).',
          'Abstract nouns cannot be physically touched (love, courage, time).',
          'Collective nouns describe groups (herd, team, pack, bouquet).',
        ],
        hi: [
          'व्यक्तिवाचक संज्ञा हमेशा बड़े अक्षर (Capital letter) से शुरू होती है।',
          'जातिवाचक संज्ञा सामान्य नाम होते हैं (शहर, किताब, शिक्षक)।',
          'मूर्त संज्ञा को छुआ या देखा जा सकता है (मेज, पानी, फल)।',
          'भाववाचक संज्ञा को छुआ नहीं जा सकता (प्यार, हिम्मत, समय)।',
          'समूहवाचक संज्ञा समूह को दर्शाती है (झुंड, टीम, गुलदस्ता)।',
        ],
        mr: [
          'विशेष नामाचे पहिले अक्षर नेहमी कॅपिटल असते.',
          'सामान्य नाम सर्वसाधारण घटक दर्शवते (शहर, पुस्तक, शिक्षक).',
          'मूर्त नामाला स्पर्श करता येतो किंवा पाहता येते (टेबल, पाणी, फळ).',
          'भाववाचक नामाला स्पर्श करता येत नाही (प्रेम, धैर्य, वेळ).',
          'समूहवाचक नाम समूहाला दर्शवते (कळप, संघ, गुच्छ).',
        ],
      },
      definitions: [
        { term: 'Common Noun', meaning: 'General name for any person, place, or thing' },
        { term: 'Proper Noun', meaning: 'Special name for a particular person, place, or thing' },
        { term: 'Abstract Noun', meaning: 'An idea, quality, or emotion' },
      ],
      definitionsTranslations: {
        en: [
          { term: 'Common Noun', meaning: 'General name for any person, place, or thing' },
          { term: 'Proper Noun', meaning: 'Special name for a particular person, place, or thing' },
          { term: 'Abstract Noun', meaning: 'An idea, quality, or emotion' },
        ],
        hi: [
          { term: 'जातिवाचक संज्ञा', meaning: 'किसी वर्ग या जाति का सामान्य नाम' },
          { term: 'व्यक्तिवाचक संज्ञा', meaning: 'किसी खास व्यक्ति, स्थान या वस्तु का नाम' },
          { term: 'भाववाचक संज्ञा', meaning: 'किसी गुण, दशा या भाव का नाम' },
        ],
        mr: [
          { term: 'सामान्य नाम', meaning: 'एकाच जातीच्या सर्व घटकांसाठी वापरले जाणारे नाव' },
          { term: 'विशेष नाम', meaning: 'एखाद्या विशिष्ट व्यक्तीचे किंवा ठिकाणाचे नाव' },
          { term: 'भाववाचक नाम', meaning: 'भावना, गुण किंवा संकल्पना दर्शवणारे नाव' },
        ],
      },
      rememberTip: 'Remember: If you can put "a", "an", or "the" before it, it is usually a noun!',
      rememberTipTranslations: {
        en: 'Remember: If you can put "a", "an", or "the" before it, it is usually a noun!',
        hi: 'याद रखें: यदि किसी शब्द के आगे "एक" या "वह" लगाकर नाम लिया जा सके, तो वह संज्ञा है!',
        mr: 'लक्षात ठेवा: ज्या शब्दाने वस्तू, व्यक्ती किंवा ठिकाणाचा बोध होतो ते नाम असते!',
      },
    },
    knowledgeCheck: {
      question: 'Which of the following is a PROPER noun?',
      questionTranslations: {
        en: 'Which of the following is a PROPER noun?',
        hi: 'निम्नलिखित में से कौन सी व्यक्तिवाचक संज्ञा (Proper Noun) है?',
        mr: 'खालीलपैकी कोणते विशेष नाम (Proper Noun) आहे?',
      },
      options: ['mountain', 'Himalayas', 'river', 'forest'],
      optionsTranslations: {
        en: ['mountain', 'Himalayas', 'river', 'forest'],
        hi: ['पहाड़', 'हिमालय (Himalayas)', 'नदी', 'जंगल'],
        mr: ['पर्वत', 'हिमालय (Himalayas)', 'नदी', 'जंगल'],
      },
      correctIndex: 1,
      explanation: '"Himalayas" is a proper noun because it is the specific name of a mountain range and begins with a capital letter.',
      explanationTranslations: {
        en: '"Himalayas" is a proper noun because it is the specific name of a mountain range and begins with a capital letter.',
        hi: '"हिमालय" व्यक्तिवाचक संज्ञा है क्योंकि यह एक विशेष पर्वत श्रृंखला का नाम है।',
        mr: '"हिमालय" हे एका विशिष्ट पर्वताचे नाव असल्याने ते विशेष नाम आहे.',
      },
    },
    quizId: 'quiz-eng-nouns-g4',
    durationMinutes: 12,
    tags: ['nouns', 'grammar', 'proper nouns', 'common nouns', 'parts of speech'],
  },
];

export const LESSON_MAP: Record<string, Lesson> = Object.fromEntries(
  LESSONS.map((l) => [l.id, l])
);
