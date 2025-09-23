import { NextResponse } from "next/server"
import type { VocabularyItem } from "@/components/language-learning-app"

export async function POST(request: Request) {
  try {
    const { word, learningLanguage, nativeLanguage } = await request.json()

    if (!word) {
      return NextResponse.json({ error: "Word is required" }, { status: 400 })
    }

    // Check if Gemini API key is available
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      // Return mock word info if API key is not available
      return NextResponse.json({
        wordInfo: getMockWordInfo(word, learningLanguage, nativeLanguage),
      })
    }

    // In a real implementation, you would call the Gemini API
    // For now, we'll return mock word info
    const wordInfo = getMockWordInfo(word, learningLanguage, nativeLanguage)

    return NextResponse.json({ wordInfo })
  } catch (error) {
    console.error("Error getting word information:", error)
    return NextResponse.json({ error: "Failed to get word information" }, { status: 500 })
  }
}

// Mock word info for development/demo purposes
function getMockWordInfo(word: string, learningLanguage: string, nativeLanguage: string): VocabularyItem {
  // Clean up the word
  const cleanWord = word.toLowerCase().trim()

  // Generate a unique ID
  const id = `vocab-${Date.now()}`

  // Default part of speech (you could implement more sophisticated detection)
  let partOfSpeech = "noun"
  if (cleanWord.endsWith("ly")) {
    partOfSpeech = "adverb"
  } else if (cleanWord.endsWith("ing") || cleanWord.endsWith("ed")) {
    partOfSpeech = "verb"
  } else if (cleanWord.endsWith("ful") || cleanWord.endsWith("ous") || cleanWord.endsWith("ive")) {
    partOfSpeech = "adjective"
  }

  // Mock definition based on the word
  let definition = `Definition of "${cleanWord}"`
  let translation = `Translation of "${cleanWord}" in ${getLanguageName(nativeLanguage)}`
  let examples = [
    `Here is an example sentence using "${cleanWord}".`,
    `Another example with "${cleanWord}" in context.`,
  ]

  // Some predefined words for better demo experience
  const predefinedWords: { [key: string]: Partial<VocabularyItem> } = {
    hello: {
      definition: "Used as a greeting or to begin a conversation.",
      translation: getTranslation("hello", nativeLanguage),
      examples: [
        "Hello, how are you today?",
        "She said hello to everyone at the party.",
        "I heard someone say hello from behind me.",
      ],
      partOfSpeech: "interjection",
    },
    goodbye: {
      definition: "Used when parting or at the end of a conversation.",
      translation: getTranslation("goodbye", nativeLanguage),
      examples: [
        "We said our goodbyes before leaving.",
        "It's hard to say goodbye to close friends.",
        "She waved goodbye as the train departed.",
      ],
      partOfSpeech: "noun",
    },
    learn: {
      definition: "To gain knowledge or skill by studying, practicing, or experiencing something.",
      translation: getTranslation("learn", nativeLanguage),
      examples: [
        "I want to learn a new language this year.",
        "Children learn quickly through play.",
        "She's learning to play the piano.",
      ],
      partOfSpeech: "verb",
    },
    essential: {
      definition: "Absolutely necessary; extremely important.",
      translation: getTranslation("essential", nativeLanguage),
      examples: [
        "Water is essential for life.",
        "These are the essential skills needed for the job.",
        "It's essential that you arrive on time.",
      ],
      partOfSpeech: "adjective",
    },
    phrases: {
      definition: "A small group of words that form a unit within a sentence.",
      translation: getTranslation("phrases", nativeLanguage),
      examples: [
        "She often uses phrases from Shakespeare in her writing.",
        "Learning common phrases is useful when traveling.",
        "The book contains useful phrases for business meetings.",
      ],
      partOfSpeech: "noun",
    },
  }

  // Use predefined word info if available
  if (predefinedWords[cleanWord]) {
    definition = predefinedWords[cleanWord].definition || definition
    translation = predefinedWords[cleanWord].translation || translation
    examples = predefinedWords[cleanWord].examples || examples
    partOfSpeech = predefinedWords[cleanWord].partOfSpeech || partOfSpeech
  }

  return {
    id,
    word: cleanWord,
    definition,
    translation,
    examples,
    partOfSpeech,
  }
}

// Helper function to get language name from code
function getLanguageName(code: string): string {
  const languages: { [key: string]: string } = {
    en: "English",
    es: "Spanish",
    fr: "French",
    de: "German",
    ja: "Japanese",
    ko: "Korean",
    zh: "Chinese",
  }

  return languages[code] || "English"
}

// Helper function to get translation for predefined words
function getTranslation(word: string, targetLanguage: string): string {
  const translations: { [key: string]: { [key: string]: string } } = {
    hello: {
      en: "hello",
      es: "hola",
      fr: "bonjour",
      de: "hallo",
      ja: "こんにちは",
      ko: "안녕하세요",
      zh: "你好",
    },
    goodbye: {
      en: "goodbye",
      es: "adiós",
      fr: "au revoir",
      de: "auf Wiedersehen",
      ja: "さようなら",
      ko: "안녕히 가세요",
      zh: "再见",
    },
    learn: {
      en: "learn",
      es: "aprender",
      fr: "apprendre",
      de: "lernen",
      ja: "学ぶ",
      ko: "배우다",
      zh: "学习",
    },
    essential: {
      en: "essential",
      es: "esencial",
      fr: "essentiel",
      de: "wesentlich",
      ja: "必須",
      ko: "필수적인",
      zh: "必要的",
    },
    phrases: {
      en: "phrases",
      es: "frases",
      fr: "phrases",
      de: "Phrasen",
      ja: "フレーズ",
      ko: "구문",
      zh: "短语",
    },
  }

  if (translations[word] && translations[word][targetLanguage]) {
    return translations[word][targetLanguage]
  }

  return `Translation of "${word}" in ${getLanguageName(targetLanguage)}`
}

