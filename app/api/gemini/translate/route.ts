import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { text, sourceLanguage, targetLanguage } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    // Check if Gemini API key is available
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      // Return mock translation if API key is not available
      return NextResponse.json({
        translation: getMockTranslation(text, sourceLanguage, targetLanguage),
      })
    }

    // In a real implementation, you would call the Gemini API
    // For now, we'll return a mock translation
    const translation = getMockTranslation(text, sourceLanguage, targetLanguage)

    return NextResponse.json({ translation })
  } catch (error) {
    console.error("Error translating text:", error)
    return NextResponse.json({ error: "Failed to translate text" }, { status: 500 })
  }
}

// Mock translation for development/demo purposes
function getMockTranslation(text: string, sourceLanguage: string, targetLanguage: string): string {
  // Simple mock translations for demo purposes
  const translations: { [key: string]: { [key: string]: string } } = {
    en: {
      es: "Traducción al español: " + text,
      fr: "Traduction en français: " + text,
      de: "Übersetzung auf Deutsch: " + text,
      ja: "日本語訳: " + text,
      ko: "한국어 번역: " + text,
      zh: "中文翻译: " + text,
    },
    es: {
      en: "English translation: " + text,
      fr: "Traduction en français: " + text,
      de: "Übersetzung auf Deutsch: " + text,
      ja: "日本語訳: " + text,
      ko: "한국어 번역: " + text,
      zh: "中文翻译: " + text,
    },
    fr: {
      en: "English translation: " + text,
      es: "Traducción al español: " + text,
      de: "Übersetzung auf Deutsch: " + text,
      ja: "日本語訳: " + text,
      ko: "한국어 번역: " + text,
      zh: "中文翻译: " + text,
    },
    // Add more language pairs as needed
  }

  if (translations[sourceLanguage] && translations[sourceLanguage][targetLanguage]) {
    return translations[sourceLanguage][targetLanguage]
  }

  return "Translation not available for this language pair."
}

