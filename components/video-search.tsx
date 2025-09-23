"use client"

import { useState } from "react"
import { Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { VideoInfo } from "@/components/language-learning-app"
import { useToast } from "@/hooks/use-toast"

interface VideoSearchProps {
  onVideoSelect: (video: VideoInfo) => void
  learningLanguage: string
}

export function VideoSearch({ onVideoSelect, learningLanguage }: VideoSearchProps) {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<VideoInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState("")

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/youtube/search?q=${encodeURIComponent(searchQuery)}&language=${learningLanguage}`,
      )

      if (!response.ok) {
        throw new Error("Failed to search videos")
      }

      const data = await response.json()
      setSearchResults(data.videos || [])

      if (data.videos.length === 0) {
        toast({
          title: "No videos found",
          description: "Try a different search term or language.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error searching videos:", error)
      toast({
        title: "Error searching videos",
        description: "Failed to search for videos. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUrlSubmit = () => {
    if (!youtubeUrl.trim()) return

    try {
      // Extract video ID from YouTube URL
      let videoId = ""

      if (youtubeUrl.includes("youtube.com/watch")) {
        const url = new URL(youtubeUrl)
        videoId = url.searchParams.get("v") || ""
      } else if (youtubeUrl.includes("youtu.be/")) {
        const parts = youtubeUrl.split("youtu.be/")
        if (parts.length > 1) {
          videoId = parts[1].split("?")[0]
        }
      }

      if (!videoId) {
        toast({
          title: "Invalid YouTube URL",
          description: "Please enter a valid YouTube video URL.",
          variant: "destructive",
        })
        return
      }

      // Create a temporary video info object
      const videoInfo: VideoInfo = {
        videoId,
        title: "Loading video details...",
        thumbnailUrl: `/placeholder.svg?height=180&width=320`,
        channelTitle: "",
      }

      // Pass the video info to the parent component
      onVideoSelect(videoInfo)

      // Fetch video details
      fetch(`/api/youtube/video?videoId=${videoId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.video) {
            onVideoSelect(data.video)
          }
        })
        .catch((error) => {
          console.error("Error fetching video details:", error)
        })
    } catch (error) {
      toast({
        title: "Error processing URL",
        description: "Please enter a valid YouTube video URL.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Search for Videos</h2>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for videos..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
            Search
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Enter YouTube URL</h2>

        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="text"
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex-1"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
          />
          <Button onClick={handleUrlSubmit}>Load Video</Button>
        </div>
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Search Results</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((video) => (
              <Card
                key={video.videoId}
                className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                onClick={() => onVideoSelect(video)}
              >
                <div className="aspect-video relative">
                  <img
                    src={video.thumbnailUrl || `/placeholder.svg?height=180&width=320`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium line-clamp-2">{video.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{video.channelTitle}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

