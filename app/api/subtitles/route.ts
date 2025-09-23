import { NextResponse } from "next/server"
import type { SubtitleItem } from "@/components/language-learning-app"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const videoId = searchParams.get("videoId")
  const language = searchParams.get("language") || "en"

  if (!videoId) {
    return NextResponse.json({ error: "videoId parameter is required" }, { status: 400 })
  }

  try {
    // In a real implementation, you would fetch subtitles from YouTube API or use a library
    // For this demo, we'll return mock subtitles
    const subtitles = getMockSubtitles(videoId, language)

    return NextResponse.json({ subtitles })
  } catch (error) {
    console.error("Error fetching subtitles:", error)
    return NextResponse.json({ error: "Failed to fetch subtitles" }, { status: 500 })
  }
}

// Mock subtitles for development/demo purposes
function getMockSubtitles(videoId: string, language: string): SubtitleItem[] {
  // Different mock subtitles based on language
  if (language === "en") {
    return [
      {
        id: "1",
        startTime: 0,
        endTime: 5,
        text: "Hello and welcome to this language learning video.",
      },
      {
        id: "2",
        startTime: 5,
        endTime: 10,
        text: "Today we're going to learn some essential phrases.",
      },
      {
        id: "3",
        startTime: 10,
        endTime: 15,
        text: "Let's start with greetings and introductions.",
      },
      {
        id: "4",
        startTime: 15,
        endTime: 20,
        text: "First, let's learn how to say 'hello' and 'goodbye'.",
      },
      {
        id: "5",
        startTime: 20,
        endTime: 25,
        text: "Hello - This is a universal greeting used in many situations.",
      },
      {
        id: "6",
        startTime: 25,
        endTime: 30,
        text: "Goodbye - Used when parting ways with someone.",
      },
      {
        id: "7",
        startTime: 30,
        endTime: 35,
        text: "Now, let's learn how to introduce yourself.",
      },
      {
        id: "8",
        startTime: 35,
        endTime: 40,
        text: "My name is... - Use this phrase to tell someone your name.",
      },
      {
        id: "9",
        startTime: 40,
        endTime: 45,
        text: "Nice to meet you - A polite phrase when meeting someone new.",
      },
      {
        id: "10",
        startTime: 45,
        endTime: 50,
        text: "Where are you from? - Ask this to learn someone's origin.",
      },
      {
        id: "11",
        startTime: 50,
        endTime: 55,
        text: "I'm from... - Use this to tell someone where you're from.",
      },
      {
        id: "12",
        startTime: 55,
        endTime: 60,
        text: "Let's practice these phrases together.",
      },
    ]
  } else if (language === "es") {
    return [
      {
        id: "1",
        startTime: 0,
        endTime: 5,
        text: "Hola y bienvenido a este video de aprendizaje de idiomas.",
      },
      {
        id: "2",
        startTime: 5,
        endTime: 10,
        text: "Hoy vamos a aprender algunas frases esenciales.",
      },
      {
        id: "3",
        startTime: 10,
        endTime: 15,
        text: "Comencemos con saludos y presentaciones.",
      },
      // More Spanish subtitles...
    ]
  } else if (language === "fr") {
    return [
      {
        id: "1",
        startTime: 0,
        endTime: 5,
        text: "Bonjour et bienvenue dans cette vidéo d'apprentissage des langues.",
      },
      {
        id: "2",
        startTime: 5,
        endTime: 10,
        text: "Aujourd'hui, nous allons apprendre quelques phrases essentielles.",
      },
      {
        id: "3",
        startTime: 10,
        endTime: 15,
        text: "Commençons par les salutations et les présentations.",
      },
      // More French subtitles...
    ]
  } else if (language === "de") {
    return [
      {
        id: "1",
        startTime: 0,
        endTime: 5,
        text: "Hallo und willkommen zu diesem Sprachlernvideo.",
      },
      {
        id: "2",
        startTime: 5,
        endTime: 10,
        text: "Heute werden wir einige wichtige Phrasen lernen.",
      },
      {
        id: "3",
        startTime: 10,
        endTime: 15,
        text: "Beginnen wir mit Begrüßungen und Vorstellungen.",
      },
      // More German subtitles...
    ]
  } else if (language === "ja") {
    return [
      {
        id: "1",
        startTime: 0,
        endTime: 5,
        text: "こんにちは、この言語学習ビデオへようこそ。",
      },
      {
        id: "2",
        startTime: 5,
        endTime: 10,
        text: "今日は、いくつかの重要なフレーズを学びます。",
      },
      {
        id: "3",
        startTime: 10,
        endTime: 15,
        text: "挨拶と自己紹介から始めましょう。",
      },
      // More Japanese subtitles...
    ]
  } else if (language === "ko") {
    return [
      {
        id: "1",
        startTime: 0,
        endTime: 5,
        text: "안녕하세요, 이 언어 학습 비디오에 오신 것을 환영합니다.",
      },
      {
        id: "2",
        startTime: 5,
        endTime: 10,
        text: "오늘은 몇 가지 필수 문구를 배우겠습니다.",
      },
      {
        id: "3",
        startTime: 10,
        endTime: 15,
        text: "인사와 소개부터 시작하겠습니다.",
      },
      // More Korean subtitles...
    ]
  } else if (language === "zh") {
    return [
      {
        id: "1",
        startTime: 0,
        endTime: 5,
        text: "你好，欢迎来到这个语言学习视频。",
      },
      {
        id: "2",
        startTime: 5,
        endTime: 10,
        text: "今天我们将学习一些基本短语。",
      },
      {
        id: "3",
        startTime: 10,
        endTime: 15,
        text: "让我们从问候和介绍开始。",
      },
      // More Chinese subtitles...
    ]
  } else {
    // Default to English if language not supported
    return getMockSubtitles(videoId, "en")
  }
}

