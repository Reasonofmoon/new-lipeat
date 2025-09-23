import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const videoId = searchParams.get("videoId")

  if (!videoId) {
    return NextResponse.json({ error: "videoId parameter is required" }, { status: 400 })
  }

  try {
    // Check if YouTube API key is available
    const apiKey = process.env.YOUTUBE_API_KEY

    if (!apiKey) {
      // Return mock data if API key is not available
      return NextResponse.json({
        video: getMockVideoDetails(videoId),
      })
    }

    // Make request to YouTube API
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`,
    )

    if (!response.ok) {
      throw new Error("Failed to fetch from YouTube API")
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Format the response
    const video = {
      videoId,
      title: data.items[0].snippet.title,
      thumbnailUrl: data.items[0].snippet.thumbnails.medium.url,
      channelTitle: data.items[0].snippet.channelTitle,
    }

    return NextResponse.json({ video })
  } catch (error) {
    console.error("Error fetching video details:", error)

    // Return mock data if there's an error
    return NextResponse.json({
      video: getMockVideoDetails(videoId),
    })
  }
}

// Mock video details for development/demo purposes
function getMockVideoDetails(videoId: string) {
  return {
    videoId,
    title: "Language Learning Video",
    thumbnailUrl: "/placeholder.svg?height=180&width=320",
    channelTitle: "Language Learning Channel",
  }
}

