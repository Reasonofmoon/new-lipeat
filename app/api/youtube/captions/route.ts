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
    // Check if YouTube API key is available
    const apiKey = process.env.YOUTUBE_API_KEY

    if (!apiKey) {
      // Return mock data if API key is not available
      return NextResponse.json({
        subtitles: getMockSubtitles(videoId, language),
      })
    }

    // First, get the caption tracks for the video
    const captionsListResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${apiKey}`,
    )

    if (!captionsListResponse.ok) {
      throw new Error("Failed to fetch caption tracks from YouTube API")
    }

    const captionsListData = await captionsListResponse.json()

    // Find the caption track for the requested language
    const captionTrack = captionsListData.items?.find((item: any) => item.snippet.language === language)

    if (!captionTrack) {
      // If no caption track is found for the requested language, return mock data
      return NextResponse.json({
        subtitles: getMockSubtitles(videoId, language),
        note: "No captions found for the requested language. Using mock data instead.",
      })
    }

    // Get the caption track ID
    const captionId = captionTrack.id

    // Fetch the actual caption content
    // Note: This requires OAuth 2.0 authentication, which is complex for a client-side app
    // For simplicity, we'll return mock data here
    // In a real implementation, you would need to set up proper authentication

    return NextResponse.json({
      subtitles: getMockSubtitles(videoId, language),
      note: "YouTube captions API requires OAuth 2.0 authentication. Using mock data for demonstration.",
    })

    /* 
    // This is how you would fetch the actual captions with proper authentication
    const captionResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/captions/${captionId}?key=${apiKey}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`, // This requires OAuth 2.0
        },
      }
    )

    if (!captionResponse.ok) {
      throw new Error("Failed to fetch caption content from YouTube API")
    }

    const captionData = await captionResponse.json()
    
    // Parse the caption data and convert to SubtitleItem format
    const subtitles = parseCaptionData(captionData)
    
    return NextResponse.json({ subtitles })
    */
  } catch (error) {
    console.error("Error fetching YouTube captions:", error)

    // Return mock data if there's an error
    return NextResponse.json({
      subtitles: getMockSubtitles(videoId, language),
      error: "Failed to fetch captions from YouTube API. Using mock data instead.",
    })
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
        text: "Hello and welcome to this video.",
      },
      {
        id: "2",
        startTime: 5,
        endTime: 10,
        text: "Today we're going to learn something interesting.",
      },
      {
        id: "3",
        startTime: 10,
        endTime: 15,
        text: "Let's start with the basics.",
      },
      {
        id: "4",
        startTime: 15,
        endTime: 20,
        text: "This concept is important for many reasons.",
      },
      {
        id: "5",
        startTime: 20,
        endTime: 25,
        text: "Let's look at some examples to understand better.",
      },
      {
        id: "6",
        startTime: 25,
        endTime: 30,
        text: "As you can see, this approach has many benefits.",
      },
      {
        id: "7",
        startTime: 30,
        endTime: 35,
        text: "Now, let's move on to the next topic.",
      },
      {
        id: "8",
        startTime: 35,
        endTime: 40,
        text: "Remember to practice what you've learned today.",
      },
      {
        id: "9",
        startTime: 40,
        endTime: 45,
        text: "Thank you for watching this video!",
      },
    ]
  } else if (language === "es") {
    return [
      {
        id: "1",
        startTime: 0,
        endTime: 5,
        text: "Hola y bienvenido a este video.",
      },
      {
        id: "2",
        startTime: 5,
        endTime: 10,
        text: "Hoy vamos a aprender algo interesante.",
      },
      {
        id: "3",
        startTime: 10,
        endTime: 15,
        text: "Comencemos con lo básico.",
      },
      // More Spanish subtitles...
    ]
  } else if (language === "fr") {
    return [
      {
        id: "1",
        startTime: 0,
        endTime: 5,
        text: "Bonjour et bienvenue dans cette vidéo.",
      },
      {
        id: "2",
        startTime: 5,
        endTime: 10,
        text: "Aujourd'hui, nous allons apprendre quelque chose d'intéressant.",
      },
      {
        id: "3",
        startTime: 10,
        endTime: 15,
        text: "Commençons par les bases.",
      },
      // More French subtitles...
    ]
  } else if (language === "de") {
    return [
      {
        id: "1",
        startTime: 0,
        endTime: 5,
        text: "Hallo und willkommen zu diesem Video.",
      },
      {
        id: "2",
        startTime: 5,
        endTime: 10,
        text: "Heute werden wir etwas Interessantes lernen.",
      },
      {
        id: "3",
        startTime: 10,
        endTime: 15,
        text: "Beginnen wir mit den Grundlagen.",
      },
      // More German subtitles...
    ]
  } else if (language === "ja") {
    return [
      {
        id: "1",
        startTime: 0,
        endTime: 5,
        text: "こんにちは、このビデオへようこそ。",
      },
      {
        id: "2",
        startTime: 5,
        endTime: 10,
        text: "今日は、興味深いことを学びます。",
      },
      {
        id: "3",
        startTime: 10,
        endTime: 15,
        text: "基本から始めましょう。",
      },
      // More Japanese subtitles...
    ]
  } else if (language === "ko") {
    return [
      {
        id: "1",
        startTime: 0,
        endTime: 5,
        text: "안녕하세요, 이 비디오에 오신 것을 환영합니다.",
      },
      {
        id: "2",
        startTime: 5,
        endTime: 10,
        text: "오늘은 흥미로운 것을 배우겠습니다.",
      },
      {
        id: "3",
        startTime: 10,
        endTime: 15,
        text: "기본부터 시작하겠습니다.",
      },
      // More Korean subtitles...
    ]
  } else if (language === "zh") {
    return [
      {
        id: "1",
        startTime: 0,
        endTime: 5,
        text: "你好，欢迎来到这个视频。",
      },
      {
        id: "2",
        startTime: 5,
        endTime: 10,
        text: "今天我们将学习一些有趣的东西。",
      },
      {
        id: "3",
        startTime: 10,
        endTime: 15,
        text: "让我们从基础开始。",
      },
      // More Chinese subtitles...
    ]
  } else {
    // Default to English if language not supported
    return getMockSubtitles(videoId, "en")
  }
}

// This function would parse the caption data from YouTube API
// In a real implementation, you would need to handle the specific format
function parseCaptionData(captionData: any): SubtitleItem[] {
  // Implementation would depend on the format of the caption data
  // This is a placeholder
  return []
}

