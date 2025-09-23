"use client"

import type React from "react"

import { useState } from "react"
import { Upload, FileUp, AlertCircle, Download, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { SubtitleItem } from "@/components/language-learning-app"
import { useToast } from "@/hooks/use-toast"

interface SubtitleUploaderProps {
  videoId: string
  onSubtitlesUploaded: (subtitles: SubtitleItem[]) => void
}

export function SubtitleUploader({ videoId, onSubtitlesUploaded }: SubtitleUploaderProps) {
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("upload")
  const [youtubeSubtitleLanguage, setYoutubeSubtitleLanguage] = useState("en")
  const [isFetchingYouTubeSubtitles, setIsFetchingYouTubeSubtitles] = useState(false)

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file extension
    const fileExtension = file.name.split(".").pop()?.toLowerCase()
    if (!["srt", "vtt", "txt"].includes(fileExtension || "")) {
      setError("Unsupported file format. Please upload .srt, .vtt, or .txt files.")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      // Read file content
      const fileContent = await readFileContent(file)

      // Parse subtitles based on file extension
      let parsedSubtitles: SubtitleItem[] = []

      if (fileExtension === "srt") {
        parsedSubtitles = parseSrtSubtitles(fileContent)
      } else if (fileExtension === "vtt") {
        parsedSubtitles = parseVttSubtitles(fileContent)
      } else if (fileExtension === "txt") {
        parsedSubtitles = parseTxtSubtitles(fileContent)
      }

      if (parsedSubtitles.length === 0) {
        throw new Error("No valid subtitles found in the file.")
      }

      // Pass the parsed subtitles to the parent component
      onSubtitlesUploaded(parsedSubtitles)

      toast({
        title: "Subtitles uploaded successfully",
        description: `${parsedSubtitles.length} subtitles loaded from file.`,
      })
    } catch (error) {
      console.error("Error parsing subtitles:", error)
      setError(error instanceof Error ? error.message : "Failed to parse subtitles.")
      toast({
        title: "Error parsing subtitles",
        description: error instanceof Error ? error.message : "Failed to parse subtitles.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Fetch subtitles from YouTube
  const fetchYouTubeSubtitles = async () => {
    if (!videoId) {
      setError("No video ID provided.")
      return
    }

    setIsFetchingYouTubeSubtitles(true)
    setError(null)

    try {
      const response = await fetch(`/api/youtube/captions?videoId=${videoId}&language=${youtubeSubtitleLanguage}`)

      if (!response.ok) {
        throw new Error("Failed to fetch subtitles from YouTube")
      }

      const data = await response.json()

      if (!data.subtitles || data.subtitles.length === 0) {
        throw new Error("No subtitles found for this video in the selected language")
      }

      onSubtitlesUploaded(data.subtitles)

      toast({
        title: "Subtitles fetched successfully",
        description: `${data.subtitles.length} subtitles loaded from YouTube.`,
      })
    } catch (error) {
      console.error("Error fetching YouTube subtitles:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch subtitles from YouTube.")
      toast({
        title: "Error fetching subtitles",
        description: error instanceof Error ? error.message : "Failed to fetch subtitles from YouTube.",
        variant: "destructive",
      })
    } finally {
      setIsFetchingYouTubeSubtitles(false)
    }
  }

  // Generate sample subtitles for demo purposes
  const generateSampleSubtitles = () => {
    const sampleSubtitles: SubtitleItem[] = [
      { id: "1", startTime: 0, endTime: 5, text: "Hello and welcome to this video." },
      { id: "2", startTime: 5, endTime: 10, text: "Today we're going to learn something interesting." },
      { id: "3", startTime: 10, endTime: 15, text: "Let's start with the basics." },
      { id: "4", startTime: 15, endTime: 20, text: "First, we need to understand the fundamentals." },
      { id: "5", startTime: 20, endTime: 25, text: "This concept is important for many reasons." },
      { id: "6", startTime: 25, endTime: 30, text: "Let's look at some examples to understand better." },
      { id: "7", startTime: 30, endTime: 35, text: "As you can see, this approach has many benefits." },
      { id: "8", startTime: 35, endTime: 40, text: "Now, let's move on to the next topic." },
      { id: "9", startTime: 40, endTime: 45, text: "Remember to practice what you've learned today." },
      { id: "10", startTime: 45, endTime: 50, text: "Thank you for watching this video!" },
    ]

    onSubtitlesUploaded(sampleSubtitles)

    toast({
      title: "Sample subtitles generated",
      description: "10 sample subtitles have been loaded for demonstration.",
    })
  }

  // Read file content as text
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = (e) => reject(new Error("Failed to read file."))
      reader.readAsText(file)
    })
  }

  // Parse SRT subtitles
  const parseSrtSubtitles = (content: string): SubtitleItem[] => {
    const subtitles: SubtitleItem[] = []
    const blocks = content.trim().split(/\r?\n\r?\n/)

    for (const block of blocks) {
      const lines = block.split(/\r?\n/)
      if (lines.length < 3) continue

      // Parse subtitle index
      const id = lines[0].trim()

      // Parse time range
      const timeRange = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/)
      if (!timeRange) continue

      const startTime = convertSrtTimeToSeconds(timeRange[1])
      const endTime = convertSrtTimeToSeconds(timeRange[2])

      // Parse text
      const text = lines.slice(2).join(" ")

      subtitles.push({
        id,
        startTime,
        endTime,
        text,
      })
    }

    return subtitles
  }

  // Parse VTT subtitles
  const parseVttSubtitles = (content: string): SubtitleItem[] => {
    const subtitles: SubtitleItem[] = []
    const lines = content.trim().split(/\r?\n/)

    let currentId = ""
    let currentStartTime = 0
    let currentEndTime = 0
    let currentText = ""
    let index = 0

    // Skip the WEBVTT header
    let i = 0
    while (i < lines.length && !lines[i].includes("-->")) {
      i++
    }

    for (; i < lines.length; i++) {
      const line = lines[i].trim()

      if (line === "") {
        // End of a subtitle block
        if (currentText) {
          subtitles.push({
            id: currentId || String(index++),
            startTime: currentStartTime,
            endTime: currentEndTime,
            text: currentText.trim(),
          })
          currentText = ""
        }
      } else if (line.includes("-->")) {
        // Time range
        const timeRange = line.match(/(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/)
        if (timeRange) {
          currentStartTime = convertVttTimeToSeconds(timeRange[1])
          currentEndTime = convertVttTimeToSeconds(timeRange[2])
          currentId = String(index)
        }
      } else if (currentStartTime > 0) {
        // Subtitle text
        currentText += (currentText ? " " : "") + line
      }
    }

    // Add the last subtitle if there is one
    if (currentText) {
      subtitles.push({
        id: currentId || String(index),
        startTime: currentStartTime,
        endTime: currentEndTime,
        text: currentText.trim(),
      })
    }

    return subtitles
  }

  // Parse plain text subtitles (one subtitle per line)
  const parseTxtSubtitles = (content: string): SubtitleItem[] => {
    const subtitles: SubtitleItem[] = []
    const lines = content.trim().split(/\r?\n/)

    // Assume each line is displayed for 3 seconds
    const durationPerLine = 3

    lines.forEach((line, index) => {
      if (line.trim()) {
        const startTime = index * durationPerLine
        const endTime = startTime + durationPerLine

        subtitles.push({
          id: String(index + 1),
          startTime,
          endTime,
          text: line.trim(),
        })
      }
    })

    return subtitles
  }

  // Convert SRT time format (00:00:00,000) to seconds
  const convertSrtTimeToSeconds = (timeString: string): number => {
    const [time, milliseconds] = timeString.split(",")
    const [hours, minutes, seconds] = time.split(":").map(Number)

    return hours * 3600 + minutes * 60 + seconds + Number(milliseconds) / 1000
  }

  // Convert VTT time format (00:00:00.000) to seconds
  const convertVttTimeToSeconds = (timeString: string): number => {
    const [time, milliseconds] = timeString.split(".")
    const [hours, minutes, seconds] = time.split(":").map(Number)

    return hours * 3600 + minutes * 60 + seconds + Number(milliseconds) / 1000
  }

  // Create a sample SRT file for download
  const createSampleSrtFile = () => {
    const sampleSrt = `1
00:00:01,000 --> 00:00:05,000
This is the first subtitle line.

2
00:00:06,000 --> 00:00:10,000
This is the second subtitle line.

3
00:00:11,000 --> 00:00:15,000
This is the third subtitle line.
`

    const blob = new Blob([sampleSrt], { type: "text/plain" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "sample_subtitles.srt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Sample SRT file created",
      description: "A sample SRT file has been downloaded to your device.",
    })
  }

  // Create a sample TXT file for download
  const createSampleTxtFile = () => {
    const sampleTxt = `This is the first line of text.
This is the second line of text.
This is the third line of text.
This is the fourth line of text.
This is the fifth line of text.
`

    const blob = new Blob([sampleTxt], { type: "text/plain" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "sample_subtitles.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Sample TXT file created",
      description: "A sample TXT file has been downloaded to your device.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subtitles</CardTitle>
        <CardDescription>Upload or create subtitles for this video</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">File Upload</TabsTrigger>
            <TabsTrigger value="youtube">YouTube Captions</TabsTrigger>
            <TabsTrigger value="demo">Demo Subtitles</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-6 text-center">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Drag and drop your subtitle file or click to browse</p>
              <p className="mt-1 text-xs text-muted-foreground">Supported formats: SRT, VTT, TXT</p>
              <div className="mt-4">
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".srt,.vtt,.txt"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <Button onClick={() => document.getElementById("file-upload")?.click()} disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <FileUp className="mr-2 h-4 w-4 animate-pulse" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FileUp className="mr-2 h-4 w-4" />
                      Select File
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={createSampleSrtFile}>
                <Download className="mr-2 h-4 w-4" />
                Download Sample SRT
              </Button>
              <Button variant="outline" onClick={createSampleTxtFile}>
                <Download className="mr-2 h-4 w-4" />
                Download Sample TXT
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              <h4 className="font-medium mb-1">About subtitle formats:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>SRT</strong>: Standard subtitle format with timing information.
                </li>
                <li>
                  <strong>VTT</strong>: Web Video Text Tracks format, used for HTML5 videos.
                </li>
                <li>
                  <strong>TXT</strong>: Simple text file with one subtitle per line (timing will be estimated).
                </li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="youtube" className="space-y-4">
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <label htmlFor="subtitle-language" className="text-sm font-medium">
                  Subtitle Language
                </label>
                <select
                  id="subtitle-language"
                  className="w-full p-2 border rounded-md"
                  value={youtubeSubtitleLanguage}
                  onChange={(e) => setYoutubeSubtitleLanguage(e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="ja">Japanese</option>
                  <option value="ko">Korean</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>

              <Button className="w-full" onClick={fetchYouTubeSubtitles} disabled={isFetchingYouTubeSubtitles}>
                {isFetchingYouTubeSubtitles ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Fetching Subtitles...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Fetch YouTube Subtitles
                  </>
                )}
              </Button>

              <div className="text-sm text-muted-foreground">
                <p>This will attempt to fetch subtitles directly from YouTube for the current video.</p>
                <p className="mt-1">
                  Note: This only works if the video has captions available in the selected language.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="demo" className="space-y-4">
            <div className="text-center p-6 border rounded-md">
              <p className="text-sm text-muted-foreground mb-4">
                Generate sample subtitles for demonstration purposes when no real subtitles are available.
              </p>
              <Button onClick={generateSampleSubtitles}>Generate Sample Subtitles</Button>
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <p>Tip: You can also create your own subtitles using the subtitle editor after loading the video.</p>
      </CardFooter>
    </Card>
  )
}

