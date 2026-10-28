// ============================================================
// ShikshaMitra AI — Lesson Curriculum Data (Grade 4)
// ============================================================

import type { Lesson } from './types';

export const LESSONS: Lesson[] = [
  // ──────────────────────────────────────────────────────────
  // MATHEMATICS — Fractions
  // ──────────────────────────────────────────────────────────
  {
    id: 'math-fractions-g4',
    subjectId: 'mathematics',
    grade: 4,
    title: 'Understanding Fractions',
    summary: 'Learn what fractions are and how to read and write them using numerators and denominators.',
    objectives: [
      { id: 'obj-frac-1', description: 'Understand that a fraction represents equal parts of a whole' },
      { id: 'obj-frac-2', description: 'Identify the numerator and denominator in a fraction' },
      { id: 'obj-frac-3', description: 'Compare simple fractions using visual models' },
    ],
    explanation: `A **fraction** tells us about a **part of a whole**.

When we divide something into equal parts, each part is a fraction of the whole thing.

Every fraction has two numbers:
• The **numerator** (top number) — tells us *how many parts we have*
• The **denominator** (bottom number) — tells us *how many equal parts the whole is divided into*

We write fractions like this: ½, ¾, 2/5

The line between the two numbers is called the **fraction bar** (or vinculum).`,
    realLifeExample: `🍕 **Pizza Example!**

Imagine you order a pizza and it is cut into **8 equal slices**.

You eat **3 slices**. What fraction did you eat?

You ate → 3/8 of the pizza!
• Numerator = 3 (slices you ate)
• Denominator = 8 (total slices)

The remaining pizza = 5/8 (5 slices out of 8)`,
    steps: [
      {
        title: 'Step 1 — What is a Whole?',
        content: 'A "whole" is a complete thing — like a full pizza, a full bar of chocolate, or a full glass of water. When we divide this whole into equal parts, we get fractions.',
        example: 'A chocolate bar broken into 4 equal pieces — each piece is 1/4.',
      },
      {
        title: 'Step 2 — Equal Parts Matter',
        content: 'For something to be a fraction, ALL the parts must be exactly the SAME size. If the pieces are different sizes, they are NOT fractions.',
        example: 'If you cut a cake unevenly, the pieces are not fractions of the cake.',
      },
      {
        title: 'Step 3 — Numerator and Denominator',
        content: 'The BOTTOM number (denominator) says into how many equal parts the whole is divided. The TOP number (numerator) says how many of those parts we are talking about.',
        example: 'In 3/4 → denominator = 4 (four equal parts), numerator = 3 (three of them).',
      },
      {
        title: 'Step 4 — Reading Fractions',
        content: 'We read fractions by saying the numerator first, then the denominator with "-th" or "-rd": 1/2 = "one half", 1/3 = "one third", 3/4 = "three fourths" or "three quarters".',
        example: '2/5 is read as "two fifths". It means 2 parts out of 5 equal parts.',
      },
    ],
    knowledgeCheck: {
      question: 'A watermelon is cut into 6 equal pieces. If you take 2 pieces, what fraction of the watermelon do you have?',
      options: ['2/6', '6/2', '2/8', '4/6'],
      correctIndex: 0,
      explanation: 'You have 2 pieces out of 6 total pieces, so the fraction is 2/6 (which can also be simplified to 1/3, but 2/6 is the direct answer).',
    },
    quizId: 'quiz-math-fractions-g4',
    durationMinutes: 15,
    tags: ['fractions', 'numerator', 'denominator', 'parts', 'whole'],
  },

  // ──────────────────────────────────────────────────────────
  // SCIENCE — The Water Cycle
  // ──────────────────────────────────────────────────────────
  {
    id: 'sci-water-cycle-g4',
    subjectId: 'science',
    grade: 4,
    title: 'The Water Cycle',
    summary: 'Discover how water moves through nature — from oceans to clouds to rain and back again.',
    objectives: [
      { id: 'obj-wc-1', description: 'Name the four main stages of the water cycle' },
      { id: 'obj-wc-2', description: 'Explain evaporation and condensation in simple terms' },
      { id: 'obj-wc-3', description: 'Understand why the water cycle is important for life on Earth' },
    ],
    explanation: `The **water cycle** (also called the **hydrological cycle**) is the continuous journey of water through nature.

Water never disappears — it just keeps changing form and moving from one place to another!

The four main stages are:
1. **Evaporation** — Water turns into water vapour (a gas)
2. **Condensation** — Water vapour cools and turns into tiny water droplets
3. **Precipitation** — Water falls as rain, snow, or hail
4. **Collection** — Water collects in oceans, rivers, lakes, and underground

This cycle repeats endlessly — the same water has been cycling on Earth for billions of years!`,
    realLifeExample: `☁️ **Watch it happen in your kitchen!**

When you boil water in a pot:
• The water gets hot and **evaporates** — you see steam rising
• If you hold a cold lid above the pot, droplets form on it — that's **condensation**!
• Those droplets fall back as mini **precipitation**

You just made a mini water cycle at home! 🌊`,
    steps: [
      {
        title: 'Stage 1 — Evaporation 🌅',
        content: 'The sun heats up water in oceans, rivers, and lakes. This heat turns liquid water into water vapour — a gas — which rises up into the air. You cannot see water vapour, but it is there!',
        example: 'After rain, puddles disappear. The sun evaporated the water into the air.',
      },
      {
        title: 'Stage 2 — Condensation ☁️',
        content: 'As water vapour rises higher, the air gets colder. Cold air cannot hold as much water vapour. So the vapour cools and turns back into tiny liquid water droplets. These droplets form clouds!',
        example: 'Cold water bottles have droplets on the outside — that is water vapour condensing.',
      },
      {
        title: 'Stage 3 — Precipitation 🌧️',
        content: 'When clouds collect enough water droplets, the droplets combine and get heavy. They fall back to Earth as precipitation — rain, snow, sleet, or hail — depending on the temperature.',
        example: 'Snow on mountains and rain in fields — both are precipitation!',
      },
      {
        title: 'Stage 4 — Collection 🌊',
        content: 'The water that falls collects in oceans, rivers, lakes, and underground. Some soaks into the soil (infiltration) and some flows over land (runoff) back to rivers and seas. Then the cycle begins again!',
        example: 'Rivers flow into the sea. Underground water fills wells that people use for drinking.',
      },
    ],
    knowledgeCheck: {
      question: 'What process turns liquid water into water vapour (a gas)?',
      options: ['Condensation', 'Precipitation', 'Evaporation', 'Collection'],
      correctIndex: 2,
      explanation: 'Evaporation is the process where heat (from the sun) turns liquid water into water vapour — a gas that rises into the atmosphere.',
    },
    quizId: 'quiz-sci-water-cycle-g4',
    durationMinutes: 15,
    tags: ['water cycle', 'evaporation', 'condensation', 'precipitation', 'environment'],
  },

  // ──────────────────────────────────────────────────────────
  // ENGLISH — Nouns
  // ──────────────────────────────────────────────────────────
  {
    id: 'eng-nouns-g4',
    subjectId: 'english',
    grade: 4,
    title: 'Nouns — Naming Words',
    summary: 'Find out what nouns are, the different types of nouns, and how to spot them in sentences.',
    objectives: [
      { id: 'obj-noun-1', description: 'Define what a noun is and give examples' },
      { id: 'obj-noun-2', description: 'Distinguish between common and proper nouns' },
      { id: 'obj-noun-3', description: 'Identify concrete, abstract, and collective nouns' },
    ],
    explanation: `A **noun** is a word that names a person, place, thing, or idea.

Nouns are one of the most important parts of speech — almost every sentence has at least one!

Types of nouns:
• **Common nouns** — general names (book, city, dog)
• **Proper nouns** — specific names, always capitalised (Priya, Mumbai, Ganga)
• **Concrete nouns** — things you can see, touch, or feel (table, flower, rain)
• **Abstract nouns** — ideas or feelings you cannot touch (love, courage, happiness)
• **Collective nouns** — a group of things (a flock of birds, a bunch of bananas)`,
    realLifeExample: `🏫 **Spot the Nouns in Your Classroom!**

Look around you right now. Everything you can NAME is a noun:
• Your **teacher** (person — common noun)
• **Priya** sitting next to you (person — proper noun)
• The **book** on your desk (thing — concrete noun)
• Your **school** building (place — common noun)
• **Kendriya Vidyalaya** (place — proper noun)
• The **happiness** of learning (feeling — abstract noun)
• A **class** of students (group — collective noun)

You are surrounded by nouns! 😊`,
    steps: [
      {
        title: 'Step 1 — Person, Place, Thing, or Idea?',
        content: 'The easiest way to find a noun is to ask: "Is this a person, place, thing, or idea?" If yes → it is a noun!',
        example: '"dog" = thing ✓ | "India" = place ✓ | "freedom" = idea ✓ | "run" = action ✗ (not a noun)',
      },
      {
        title: 'Step 2 — Common vs Proper Nouns',
        content: 'COMMON nouns name any general person, place, or thing. PROPER nouns name a SPECIFIC one and always start with a capital letter.',
        example: 'common: river, girl, city → proper: Ganga, Meena, Delhi',
      },
      {
        title: 'Step 3 — Concrete vs Abstract Nouns',
        content: 'CONCRETE nouns are things you can sense — see, hear, touch, taste, or smell. ABSTRACT nouns are ideas, feelings, or qualities that you cannot physically touch.',
        example: 'Concrete: apple, music, perfume → Abstract: joy, honesty, time',
      },
      {
        title: 'Step 4 — Collective Nouns',
        content: 'A COLLECTIVE noun is a single word for a GROUP of people, animals, or things. These are fun to learn!',
        example: 'a herd of elephants, a team of players, a bouquet of flowers, a library of books',
      },
    ],
    knowledgeCheck: {
      question: 'Which of the following is a PROPER noun?',
      options: ['mountain', 'Himalayas', 'river', 'forest'],
      correctIndex: 1,
      explanation: '"Himalayas" is a proper noun because it is the specific name of a particular mountain range. Proper nouns always start with a capital letter.',
    },
    quizId: 'quiz-eng-nouns-g4',
    durationMinutes: 12,
    tags: ['nouns', 'grammar', 'proper nouns', 'common nouns', 'parts of speech'],
  },
];

export const LESSON_MAP: Record<string, Lesson> = Object.fromEntries(
  LESSONS.map((l) => [l.id, l])
);
