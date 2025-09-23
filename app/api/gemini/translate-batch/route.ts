import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { texts, sourceLanguage, targetLanguage } = await request.json()

    if (!texts || !Array.isArray(texts)) {
      return NextResponse.json({ error: "Texts array is required" }, { status: 400 })
    }

    // Check if Gemini API key is available
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      // Return mock translations if API key is not available
      return NextResponse.json({
        translations: texts.map((text) => getMockTranslation(text, sourceLanguage, targetLanguage)),
      })
    }

    // In a real implementation, you would call the Gemini API
    // For now, we'll return mock translations
    const translations = texts.map((text) => getMockTranslation(text, sourceLanguage, targetLanguage))

    return NextResponse.json({ translations })
  } catch (error) {
    console.error("Error translating texts:", error)
    return NextResponse.json({ error: "Failed to translate texts" }, { status: 500 })
  }
}

// Mock translation for development/demo purposes
function getMockTranslation(text: string, sourceLanguage: string, targetLanguage: string): string {
  // Simple mock translations for demo purposes
  const translations: { [key: string]: { [key: string]: string } } = {
    en: {
      es: "Traducción: " + text,
      fr: "Traduction: " + text,
      de: "Übersetzung: " + text,
      ja: "翻訳: " + text,
      ko: "번역: " + text,
      zh: "翻译: " + text,
    },
    es: {
      en: "Translation: " + text,
      fr: "Traduction: " + text,
      de: "Übersetzung: " + text,
      ja: "翻訳: " + text,
      ko: "번역: " + text,
      zh: "翻译: " + text,
    },
    // Add more language pairs as needed
  }

  if (translations[sourceLanguage] && translations[sourceLanguage][targetLanguage]) {
    return translations[sourceLanguage][targetLanguage]
  }

  return "Translation not available for this language pair."
}

