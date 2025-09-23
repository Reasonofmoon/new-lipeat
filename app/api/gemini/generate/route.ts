import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { prompt, learningLanguage, nativeLanguage } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Check if Gemini API key is available
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      // Return mock response if API key is not available
      return NextResponse.json({
        text: getMockGeminiResponse(prompt, learningLanguage, nativeLanguage),
      })
    }

    // In a real implementation, you would call the Gemini API
    // For now, we'll return a mock response
    const text = getMockGeminiResponse(prompt, learningLanguage, nativeLanguage)

    return NextResponse.json({ text })
  } catch (error) {
    console.error("Error generating AI response:", error)
    return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 })
  }
}

// Mock Gemini response for development/demo purposes
function getMockGeminiResponse(prompt: string, learningLanguage: string, nativeLanguage: string): string {
  if (prompt.includes("Explain this sentence")) {
    return `This sentence is using the present tense to describe an ongoing action or habit. 

The structure follows the standard subject-verb-object pattern in English. 

Key vocabulary:
- "learning" - a verb in the present continuous form
- "essential" - an adjective meaning "absolutely necessary"
- "phrases" - a noun referring to groups of words that form a unit

Cultural context:
In language learning, focusing on essential phrases is a common approach, especially for beginners. This allows learners to quickly build useful vocabulary for everyday situations.`
  } else if (prompt.includes("Translate this sentence")) {
    return `Translation: "${getTranslationExample(learningLanguage, nativeLanguage)}"

Word-by-word breakdown:
- "Today" = "${getWordTranslation("Today", learningLanguage, nativeLanguage)}"
- "we're" = "${getWordTranslation("we're", learningLanguage, nativeLanguage)}"
- "going" = "${getWordTranslation("going", learningLanguage, nativeLanguage)}"
- "to" = "${getWordTranslation("to", learningLanguage, nativeLanguage)}"
- "learn" = "${getWordTranslation("learn", learningLanguage, nativeLanguage)}"
- "some" = "${getWordTranslation("some", learningLanguage, nativeLanguage)}"
- "essential" = "${getWordTranslation("essential", learningLanguage, nativeLanguage)}"
- "phrases" = "${getWordTranslation("phrases", learningLanguage, nativeLanguage)}"

Note: The word order might differ between languages due to different grammatical structures.`
  } else if (prompt.includes("alternative ways")) {
    return `Here are some alternative ways to express this:

1. "We'll be covering important expressions today."
2. "Let's focus on key phrases in this lesson."
3. "In today's session, we'll learn crucial language patterns."
4. "We're about to explore fundamental expressions."
5. "Today's objective is to master some basic phrases."

Formal variations:
- "We shall proceed to study essential linguistic expressions."
- "Our curriculum today encompasses critical communicative phrases."

Informal variations:
- "Let's check out some must-know phrases today."
- "We're gonna go over some super useful expressions."`
  } else {
    return `I've analyzed your request and here's my response:

${prompt}

This is a common pattern in language learning. When approaching this topic, it's helpful to break it down into manageable parts:

1. First, understand the core concept
2. Practice with simple examples
3. Gradually increase complexity
4. Review regularly to reinforce learning

Would you like me to provide specific examples or exercises related to this topic?`
  }
}

// Helper function to get translation examples
function getTranslationExample(from: string, to: string): string {
  const translations: { [key: string]: { [key: string]: string } } = {
    en: {
      es: "Hoy vamos a aprender algunas frases esenciales.",
      fr: "Aujourd'hui, nous allons apprendre quelques phrases essentielles.",
      de: "Heute werden wir einige wichtige Phrasen lernen.",
      ja: "今日は、いくつかの重要なフレーズを学びます。",
      ko: "오늘은 몇 가지 필수 문구를 배우겠습니다.",
      zh: "今天我们将学习一些基本短语。",
    },
    es: {
      en: "Today we're going to learn some essential phrases.",
      fr: "Aujourd'hui, nous allons apprendre quelques phrases essentielles.",
      de: "Heute werden wir einige wichtige Phrasen lernen.",
      ja: "今日は、いくつかの重要なフレーズを学びます。",
      ko: "오늘은 몇 가지 필수 문구를 배우겠습니다.",
      zh: "今天我们将学习一些基本短语。",
    },
    // Add more language pairs as needed
  }

  if (translations[from] && translations[from][to]) {
    return translations[from][to]
  }

  return "Translation not available for this language pair."
}

// Helper function to get word translations
function getWordTranslation(word: string, from: string, to: string): string {
  const wordTranslations: { [key: string]: { [key: string]: { [key: string]: string } } } = {
    en: {
      es: {
        Today: "Hoy",
        "we're": "vamos a",
        going: "",
        to: "",
        learn: "aprender",
        some: "algunas",
        essential: "esenciales",
        phrases: "frases",
      },
      fr: {
        Today: "Aujourd'hui",
        "we're": "nous allons",
        going: "",
        to: "",
        learn: "apprendre",
        some: "quelques",
        essential: "essentielles",
        phrases: "phrases",
      },
      // Add more language pairs as needed
    },
  }

  if (wordTranslations[from] && wordTranslations[from][to] && wordTranslations[from][to][word]) {
    return wordTranslations[from][to][word]
  }

  return "Translation not available"
}

