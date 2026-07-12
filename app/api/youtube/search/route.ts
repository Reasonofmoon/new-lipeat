import { NextResponse } from "next/server"
import { getServerEnv } from "@/lib/env"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")
  const language = searchParams.get("language") || "en"

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  try {
    // Check if YouTube API key is available
    const apiKey = getServerEnv("YOUTUBE_API_KEY")

    if (!apiKey) {
      // Return mock data if API key is not available
      return NextResponse.json({
        videos: getMockSearchResults(query, language),
      })
    }

    // Relevance language parameter based on the selected language
    const relevanceLanguage = language === "en" ? "en" : language

    // Make request to YouTube API
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        query,
      )}&type=video&videoCaption=closedCaption&maxResults=9&relevanceLanguage=${relevanceLanguage}&key=${apiKey}`,
    )

    if (!response.ok) {
      throw new Error("Failed to fetch from YouTube API")
    }

    const data = await response.json()

    // Format the response
    const videos = data.items.map((item: any) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnailUrl: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle,
    }))

    return NextResponse.json({ videos })
  } catch (error) {
    console.error("Error searching YouTube videos:", error)

    // Return mock data if there's an error
    return NextResponse.json({
      videos: getMockSearchResults(query, language),
    })
  }
}

// Mock search results for development/demo purposes
function getMockSearchResults(query: string, language: string) {
  const mockVideos = [
    {
      videoId: "dQw4w9WgXcQ",
      title: `Learn ${language === "en" ? "English" : getLanguageName(language)}: ${query} - Beginner's Guide`,
      thumbnailUrl: "/placeholder.svg?height=180&width=320",
      channelTitle: "Language Learning Channel",
    },
    {
      videoId: "xvFZjo5PgG0",
      title: `${query} Vocabulary in ${getLanguageName(language)}`,
      thumbnailUrl: "/placeholder.svg?height=180&width=320",
      channelTitle: "Vocabulary Master",
    },
    {
      videoId: "bxqLsrlakK8",
      title: `How to Use ${query} in Conversations`,
      thumbnailUrl: "/placeholder.svg?height=180&width=320",
      channelTitle: "Conversation Practice",
    },
    {
      videoId: "jNQXAC9IVRw",
      title: `${getLanguageName(language)} Grammar: ${query} Explained`,
      thumbnailUrl: "/placeholder.svg?height=180&width=320",
      channelTitle: "Grammar Expert",
    },
    {
      videoId: "QH2-TGUlwu4",
      title: `${query} for Daily Life - ${getLanguageName(language)} Practice`,
      thumbnailUrl: "/placeholder.svg?height=180&width=320",
      channelTitle: "Daily Language",
    },
    {
      videoId: "9bZkp7q19f0",
      title: `Advanced ${getLanguageName(language)}: Mastering ${query}`,
      thumbnailUrl: "/placeholder.svg?height=180&width=320",
      channelTitle: "Advanced Language",
    },
  ]

  return mockVideos
}

// Helper function to get language name from code
function getLanguageName(code: string) {
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

