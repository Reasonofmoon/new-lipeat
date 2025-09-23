"use client"

import { useState, useEffect, useRef } from "react"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  BookmarkPlus,
  Languages,
  MessageSquare,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { SubtitleItem, VocabularyItem } from "@/components/language-learning-app"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface VideoPlayerProps {
  videoId: string
  subtitles: SubtitleItem[]
  onCurrentSubtitleChange: (index: number) => void
  learningLanguage: string
  nativeLanguage: string
  onSaveVocabulary: (item: VocabularyItem) => void
  onSubtitlesLoaded: (subtitles: SubtitleItem[]) => void
}

export function VideoPlayer({
  videoId,
  subtitles,
  onCurrentSubtitleChange,
  learningLanguage,
  nativeLanguage,
  onSaveVocabulary,
  onSubtitlesLoaded,
}: VideoPlayerProps) {
  const { toast } = useToast()
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showTranslation, setShowTranslation] = useState(true)
  const [selectedSubtitleIndex, setSelectedSubtitleIndex] = useState<number>(-1)
  const [loopStart, setLoopStart] = useState<number | null>(null)
  const [loopEnd, setLoopEnd] = useState<number | null>(null)
  const [fontSize, setFontSize] = useState(16)
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false)
  const [aiDialogContent, setAiDialogContent] = useState("")
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [selectedWord, setSelectedWord] = useState("")
  const [wordInfo, setWordInfo] = useState<VocabularyItem | null>(null)
  const [isWordInfoLoading, setIsWordInfoLoading] = useState(false)

  const videoRef = useRef<HTMLIFrameElement>(null)
  const playerRef = useRef<any>(null)

  // Initialize YouTube player
  useEffect(() => {
    // Load YouTube IFrame API
    const tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"
    const firstScriptTag = document.getElementsByTagName("script")[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    // Create YouTube player when API is ready
    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player("youtube-player", {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          fs: 0,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      })
    }

    return () => {
      // Clean up
      if (playerRef.current) {
        playerRef.current.destroy()
      }
    }
  }, [videoId])

  // Handle player events
  const onPlayerReady = (event: any) => {
    setDuration(event.target.getDuration())
    // Set initial volume
    event.target.setVolume(volume)
  }

  const onPlayerStateChange = (event: any) => {
    // Update playing state
    setIsPlaying(event.data === window.YT.PlayerState.PLAYING)

    // Handle video end
    if (event.data === window.YT.PlayerState.ENDED) {
      setIsPlaying(false)
    }
  }

  // Update current time and check for subtitle changes
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isPlaying && playerRef.current) {
      interval = setInterval(() => {
        const currentTime = playerRef.current.getCurrentTime()
        setCurrentTime(currentTime)

        // Find current subtitle
        const currentSubtitleIndex = subtitles.findIndex(
          (subtitle) => currentTime >= subtitle.startTime && currentTime < subtitle.endTime,
        )

        if (currentSubtitleIndex !== -1 && currentSubtitleIndex !== selectedSubtitleIndex) {
          setSelectedSubtitleIndex(currentSubtitleIndex)
          onCurrentSubtitleChange(currentSubtitleIndex)
        }

        // Handle looping
        if (loopStart !== null && loopEnd !== null) {
          if (currentTime >= loopEnd) {
            playerRef.current.seekTo(loopStart)
          }
        }
      }, 100)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, subtitles, selectedSubtitleIndex, loopStart, loopEnd, onCurrentSubtitleChange])

  // Play/pause video
  const togglePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo()
      } else {
        playerRef.current.playVideo()
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Seek to time
  const seekTo = (time: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time)
      setCurrentTime(time)
    }
  }

  // Handle subtitle click
  const handleSubtitleClick = (index: number) => {
    if (index >= 0 && index < subtitles.length) {
      seekTo(subtitles[index].startTime)
      setSelectedSubtitleIndex(index)
      onCurrentSubtitleChange(index)
    }
  }

  // Set loop points
  const setLoopPoints = (start: number | null, end: number | null) => {
    setLoopStart(start)
    setLoopEnd(end)

    if (start !== null) {
      seekTo(start)
    }
  }

  // Loop current subtitle
  const loopCurrentSubtitle = () => {
    if (selectedSubtitleIndex !== -1) {
      const subtitle = subtitles[selectedSubtitleIndex]
      setLoopPoints(subtitle.startTime, subtitle.endTime)
      toast({
        title: "반복 설정",
        description: "현재 자막이 반복됩니다.",
      })
    }
  }

  // Clear loop
  const clearLoop = () => {
    setLoopPoints(null, null)
    toast({
      title: "반복 해제",
      description: "반복이 해제되었습니다.",
    })
  }

  // Format time (seconds to MM:SS)
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  // Update volume
  const updateVolume = (value: number) => {
    setVolume(value)
    setIsMuted(value === 0)

    if (playerRef.current) {
      playerRef.current.setVolume(value)
      if (value === 0) {
        playerRef.current.mute()
      } else {
        playerRef.current.unMute()
      }
    }
  }

  // Toggle mute
  const toggleMute = () => {
    if (playerRef.current) {
      if (isMuted) {
        playerRef.current.unMute()
        playerRef.current.setVolume(volume)
      } else {
        playerRef.current.mute()
      }
      setIsMuted(!isMuted)
    }
  }

  // Update playback rate
  const updatePlaybackRate = (rate: number) => {
    setPlaybackRate(rate)

    if (playerRef.current) {
      playerRef.current.setPlaybackRate(rate)
    }
  }

  // Ask AI for explanation
  const askAi = async (prompt: string) => {
    setIsAiDialogOpen(true)
    setIsAiLoading(true)
    setAiDialogContent("응답 생성 중...")

    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          learningLanguage,
          nativeLanguage,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate AI response")
      }

      const data = await response.json()
      setAiDialogContent(data.text || "죄송합니다, 응답을 생성할 수 없습니다.")
    } catch (error) {
      console.error("Error generating AI response:", error)
      setAiDialogContent("죄송합니다, 응답 생성 중 오류가 발생했습니다. 나중에 다시 시도해주세요.")
    } finally {
      setIsAiLoading(false)
    }
  }

  // Get current subtitle text
  const getCurrentSubtitleText = () => {
    if (selectedSubtitleIndex !== -1 && subtitles[selectedSubtitleIndex]) {
      return subtitles[selectedSubtitleIndex].text
    }
    return ""
  }

  // Explain current subtitle
  const explainCurrentSubtitle = () => {
    const text = getCurrentSubtitleText()
    if (text) {
      askAi(`다음 문장을 자세히 설명해주세요: "${text}". 문법 설명과 문화적 맥락이 있다면 함께 설명해주세요.`)
    } else {
      toast({
        title: "선택된 자막 없음",
        description: "설명할 자막을 선택해주세요.",
        variant: "destructive",
      })
    }
  }

  // Translate current subtitle
  const translateCurrentSubtitle = () => {
    const text = getCurrentSubtitleText()
    if (text) {
      askAi(
        `다음 문장을 ${learningLanguage}에서 ${nativeLanguage}로 번역해주세요: "${text}". 가능하면 단어별 분석도 제공해주세요.`,
      )
    } else {
      toast({
        title: "선택된 자막 없음",
        description: "번역할 자막을 선택해주세요.",
        variant: "destructive",
      })
    }
  }

  // Get alternative expressions
  const getAlternativeExpressions = () => {
    const text = getCurrentSubtitleText()
    if (text) {
      askAi(
        `다음 표현을 ${learningLanguage}로 3-5가지 다른 방식으로 표현해주세요: "${text}". 가능하면 공식적인 표현과 비공식적인 표현을 모두 포함해주세요.`,
      )
    } else {
      toast({
        title: "선택된 자막 없음",
        description: "대체 표현을 얻을 자막을 선택해주세요.",
        variant: "destructive",
      })
    }
  }

  // Get word information
  const getWordInfo = async (word: string) => {
    setSelectedWord(word)
    setIsWordInfoLoading(true)

    try {
      const response = await fetch("/api/gemini/word-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          word,
          learningLanguage,
          nativeLanguage,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get word information")
      }

      const data = await response.json()

      if (data.wordInfo) {
        setWordInfo(data.wordInfo)
      } else {
        setWordInfo(null)
        toast({
          title: "단어 정보를 찾을 수 없음",
          description: "이 단어에 대한 정보를 찾을 수 없습니다.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error getting word information:", error)
      setWordInfo(null)
      toast({
        title: "단어 정보 가져오기 오류",
        description: "이 단어에 대한 정보를 가져오지 못했습니다. 나중에 다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setIsWordInfoLoading(false)
    }
  }

  // Save word to vocabulary
  const saveWordToVocabulary = () => {
    if (wordInfo) {
      onSaveVocabulary(wordInfo)
      toast({
        title: "단어 저장됨",
        description: `"${wordInfo.word}"가 단어장에 추가되었습니다.`,
      })
    }
  }

  // Handle word click in subtitle
  const handleWordClick = (word: string) => {
    // Clean up the word (remove punctuation)
    const cleanWord = word
      .replace(/[.,!?;:'"()]/g, "")
      .trim()
      .toLowerCase()
    if (cleanWord) {
      getWordInfo(cleanWord)
    }
  }

  // Render subtitle with clickable words
  const renderClickableSubtitle = (text: string) => {
    const words = text.split(" ")
    return words.map((word, index) => (
      <span
        key={index}
        className="cursor-pointer hover:underline hover:text-primary"
        onClick={() => handleWordClick(word)}
      >
        {word}
        {index < words.length - 1 ? " " : ""}
      </span>
    ))
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case " ":
          e.preventDefault()
          togglePlayPause()
          break
        case "ArrowLeft":
          e.preventDefault()
          seekTo(Math.max(0, currentTime - 5))
          break
        case "ArrowRight":
          e.preventDefault()
          seekTo(Math.min(duration, currentTime + 5))
          break
        case "ArrowUp":
          e.preventDefault()
          if (selectedSubtitleIndex > 0) {
            handleSubtitleClick(selectedSubtitleIndex - 1)
          }
          break
        case "ArrowDown":
          e.preventDefault()
          if (selectedSubtitleIndex < subtitles.length - 1) {
            handleSubtitleClick(selectedSubtitleIndex + 1)
          }
          break
        case "l":
        case "L":
          setShowTranslation(!showTranslation)
          break
        case "[":
          if (selectedSubtitleIndex !== -1) {
            const subtitle = subtitles[selectedSubtitleIndex]
            setLoopStart(subtitle.startTime)
            toast({
              title: "반복 시작점 설정",
              description: `${formatTime(subtitle.startTime)}에 반복 시작점이 설정되었습니다.`,
            })
          }
          break
        case "]":
          if (selectedSubtitleIndex !== -1) {
            const subtitle = subtitles[selectedSubtitleIndex]
            setLoopEnd(subtitle.endTime)
            toast({
              title: "반복 종료점 설정",
              description: `${formatTime(subtitle.endTime)}에 반복 종료점이 설정되었습니다.`,
            })
          }
          break
        case "\\":
          clearLoop()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [currentTime, duration, selectedSubtitleIndex, subtitles, showTranslation])

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0 relative">
          {/* YouTube Player */}
          <div className="aspect-video bg-black relative">
            <div id="youtube-player"></div>

            {/* Current subtitle */}
            {selectedSubtitleIndex !== -1 && subtitles[selectedSubtitleIndex] && (
              <div className="absolute bottom-16 left-0 right-0 text-center px-4" style={{ fontSize: `${fontSize}px` }}>
                <div className="bg-black/70 text-white p-3 rounded inline-block max-w-[80%]">
                  {renderClickableSubtitle(subtitles[selectedSubtitleIndex].text)}
                </div>

                {showTranslation && subtitles[selectedSubtitleIndex].translation && (
                  <div className="bg-black/70 text-yellow-300 p-2 rounded inline-block max-w-[80%] mt-2">
                    {subtitles[selectedSubtitleIndex].translation}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Video controls */}
          <div className="bg-muted p-4">
            {/* Progress bar */}
            <div className="mb-4">
              <Slider value={[currentTime]} max={duration} step={0.1} onValueChange={(value) => seekTo(value[0])} />
              <div className="flex justify-between text-xs mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => seekTo(Math.max(0, currentTime - 5))}>
                        <SkipBack className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>5초 뒤로</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Button variant="outline" size="icon" onClick={togglePlayPause}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => seekTo(Math.min(duration, currentTime + 5))}>
                        <SkipForward className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>5초 앞으로</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <div className="flex items-center space-x-2 ml-4">
                  <Button variant="ghost" size="icon" onClick={toggleMute}>
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>

                  <Slider
                    className="w-20"
                    value={[isMuted ? 0 : volume]}
                    max={100}
                    step={1}
                    onValueChange={(value) => updateVolume(value[0])}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={loopStart !== null && loopEnd !== null ? "default" : "ghost"}
                        size="icon"
                        onClick={loopStart !== null ? clearLoop : loopCurrentSubtitle}
                      >
                        <Repeat className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{loopStart !== null ? "반복 해제" : "현재 자막 반복"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Select
                  value={playbackRate.toString()}
                  onValueChange={(value) => updatePlaybackRate(Number.parseFloat(value))}
                >
                  <SelectTrigger className="w-[80px]">
                    <SelectValue placeholder="속도" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">0.5x</SelectItem>
                    <SelectItem value="0.75">0.75x</SelectItem>
                    <SelectItem value="1">1x</SelectItem>
                    <SelectItem value="1.25">1.25x</SelectItem>
                    <SelectItem value="1.5">1.5x</SelectItem>
                    <SelectItem value="2">2x</SelectItem>
                  </SelectContent>
                </Select>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={showTranslation ? "default" : "ghost"}
                        size="icon"
                        onClick={() => setShowTranslation(!showTranslation)}
                      >
                        <Languages className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{showTranslation ? "번역 숨기기" : "번역 보기"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-4">
              <Tabs defaultValue="subtitles">
                <TabsList className="mb-4">
                  <TabsTrigger value="subtitles">자막</TabsTrigger>
                  <TabsTrigger value="ai-assistant">AI 어시스턴트</TabsTrigger>
                </TabsList>

                <TabsContent value="subtitles">
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-2">
                      {subtitles.length > 0 ? (
                        subtitles.map((subtitle, index) => (
                          <div
                            key={subtitle.id}
                            className={`p-3 rounded-md cursor-pointer transition-colors ${
                              selectedSubtitleIndex === index
                                ? "bg-primary/20 border-l-4 border-primary"
                                : "hover:bg-muted"
                            }`}
                            onClick={() => handleSubtitleClick(index)}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-xs text-muted-foreground">
                                {formatTime(subtitle.startTime)} - {formatTime(subtitle.endTime)}
                              </span>
                              <div className="flex space-x-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleSubtitleClick(index)
                                    loopCurrentSubtitle()
                                  }}
                                >
                                  <Repeat className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <p style={{ fontSize: `${fontSize - 2}px` }}>{subtitle.text}</p>
                            {showTranslation && subtitle.translation && (
                              <p className="text-muted-foreground mt-1" style={{ fontSize: `${fontSize - 4}px` }}>
                                {subtitle.translation}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">
                            No subtitles available. Please upload subtitle files using the subtitle uploader.
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="ai-assistant">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Button onClick={explainCurrentSubtitle}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        자막 설명
                      </Button>
                      <Button onClick={translateCurrentSubtitle}>
                        <Languages className="mr-2 h-4 w-4" />
                        자막 번역
                      </Button>
                      <Button onClick={getAlternativeExpressions}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        대체 표현
                      </Button>
                    </div>

                    <div className="bg-muted p-4 rounded-md">
                      <h3 className="font-medium mb-2">현재 자막</h3>
                      <p className="text-sm">
                        {selectedSubtitleIndex !== -1 && subtitles[selectedSubtitleIndex]
                          ? subtitles[selectedSubtitleIndex].text
                          : "선택된 자막 없음"}
                      </p>
                      {selectedSubtitleIndex !== -1 &&
                        subtitles[selectedSubtitleIndex] &&
                        subtitles[selectedSubtitleIndex].translation && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {subtitles[selectedSubtitleIndex].translation}
                          </p>
                        )}
                    </div>

                    <div className="bg-muted p-4 rounded-md">
                      <h3 className="font-medium mb-2">학습 팁</h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>자막에서 단어를 클릭하면 정의와 예문을 볼 수 있습니다.</li>
                        <li>반복 버튼을 사용하여 어려운 부분을 반복할 수 있습니다.</li>
                        <li>재생 속도를 조절하여 더 나은 이해를 도모할 수 있습니다.</li>
                        <li>키보드 단축키: 스페이스바(재생/일시정지), 화살표(탐색), L(번역 토글).</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-4">단어 정보</h3>

              {isWordInfoLoading ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">단어 정보를 로딩 중입니다...</p>
                </div>
              ) : wordInfo ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-semibold">{wordInfo.word}</h4>
                      <p className="text-sm text-muted-foreground">{wordInfo.partOfSpeech}</p>
                    </div>
                    <Button size="sm" onClick={saveWordToVocabulary}>
                      <BookmarkPlus className="h-4 w-4 mr-1" />
                      저장
                    </Button>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium">정의</h5>
                    <p className="text-sm">{wordInfo.definition}</p>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium">번역</h5>
                    <p className="text-sm">{wordInfo.translation}</p>
                  </div>

                  {wordInfo.examples.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium">예문</h5>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {wordInfo.examples.map((example, index) => (
                          <li key={index}>{example}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">자막에서 단어를 클릭하면 정의, 번역 및 예문을 볼 수 있습니다.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">자막 설정</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">글자 크기</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                      disabled={fontSize <= 12}
                    >
                      -
                    </Button>
                    <span>{fontSize}px</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                      disabled={fontSize >= 24}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">번역 표시</span>
                  <Button
                    variant={showTranslation ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowTranslation(!showTranslation)}
                  >
                    {showTranslation ? "켜짐" : "꺼짐"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Dialog */}
      <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>AI 어시스턴트</DialogTitle>
            <DialogDescription>{isAiLoading ? "응답 생성 중..." : "요청하신 정보입니다:"}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[400px] mt-4">
            <div className="p-4 whitespace-pre-wrap">{aiDialogContent}</div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}

