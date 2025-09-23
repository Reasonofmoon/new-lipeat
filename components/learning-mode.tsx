"use client"

import type React from "react"
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
  Mic,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AIAssistant } from "./ai-assistant"

interface UserProfile {
  id: string
  name: string
  languageLevel: "beginner" | "intermediate" | "advanced"
  targetLanguage: string
  nativeLanguage: string
  interests: string[]
  learningGoals: string[]
  streak: number
  totalLearningTime: number
  vocabularyCount: number
  completedLessons: number
}

interface LearningModeProps {
  userProfile: UserProfile
  onVocabularyAdd: (word: string) => void
}

// Mock transcript data
interface TranscriptSegment {
  id: number
  startTime: number
  endTime: number
  text: string
  translation?: string
  isSelected?: boolean
}

const LearningMode: React.FC<LearningModeProps> = ({ userProfile, onVocabularyAdd }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(300) // 5 minutes in seconds
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showTranslation, setShowTranslation] = useState(true)
  const [learningMode, setLearningMode] = useState("normal")
  const [selectedSegmentId, setSelectedSegmentId] = useState<number | null>(null)
  const [loopStart, setLoopStart] = useState<number | null>(null)
  const [loopEnd, setLoopEnd] = useState<number | null>(null)
  const [fontSize, setFontSize] = useState(16)

  // Mock video player ref
  const videoRef = useRef<HTMLVideoElement>(null)

  // Mock transcript data
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([
    { id: 1, startTime: 0, endTime: 5, text: "Hello and welcome to this business English lesson." },
    { id: 2, startTime: 5, endTime: 10, text: "Today we're going to learn essential phrases for meetings." },
    { id: 3, startTime: 10, endTime: 15, text: "Let's start with how to open a meeting professionally." },
    { id: 4, startTime: 15, endTime: 20, text: "You can say: 'I'd like to welcome everyone to today's meeting.'" },
    { id: 5, startTime: 20, endTime: 25, text: "Or: 'Let's get started with the first item on our agenda.'" },
    { id: 6, startTime: 25, endTime: 30, text: "When sharing your opinion, you can say: 'In my view...'" },
    { id: 7, startTime: 30, endTime: 35, text: "Or: 'From my perspective, we should consider...'" },
    { id: 8, startTime: 35, endTime: 40, text: "To disagree politely, try: 'I see your point, but...'" },
    { id: 9, startTime: 40, endTime: 45, text: "Or: 'I understand what you're saying, however...'" },
    {
      id: 10,
      startTime: 45,
      endTime: 50,
      text: "To conclude a meeting, you can say: 'Let's summarize what we've discussed.'",
    },
    { id: 11, startTime: 50, endTime: 55, text: "Or: 'To wrap up, our next steps are...'" },
    { id: 12, startTime: 55, endTime: 60, text: "Practice these phrases in your next business meeting." },
  ])

  // Add translations based on user's native language
  useEffect(() => {
    if (userProfile.nativeLanguage === "ko") {
      setTranscript((prev) =>
        prev.map((segment) => ({
          ...segment,
          translation: getKoreanTranslation(segment.id),
        })),
      )
    }
  }, [userProfile.nativeLanguage])

  // Mock Korean translations
  const getKoreanTranslation = (id: number): string => {
    const translations: { [key: number]: string } = {
      1: "안녕하세요, 비즈니스 영어 수업에 오신 것을 환영합니다.",
      2: "오늘은 회의에 필수적인 표현들을 배워보겠습니다.",
      3: "먼저 회의를 전문적으로 시작하는 방법부터 알아봅시다.",
      4: "다음과 같이 말할 수 있습니다: '오늘 회의에 모든 분들을 환영합니다.'",
      5: "또는: '의제의 첫 번째 항목부터 시작하겠습니다.'",
      6: "의견을 공유할 때는 다음과 같이 말할 수 있습니다: '제 관점에서는...'",
      7: "또는: '제 시각에서는, 우리가 고려해야 할 것은...'",
      8: "정중하게 동의하지 않을 때는 이렇게 해보세요: '당신의 요점을 이해합니다만...'",
      9: "또는: '말씀하시는 내용을 이해합니다, 하지만...'",
      10: "회의를 마무리할 때는 다음과 같이 말할 수 있습니다: '지금까지 논의한 내용을 요약해 봅시다.'",
      11: "또는: '마무리하자면, 우리의 다음 단계는...'",
      12: "다음 비즈니스 회의에서 이러한 표현들을 연습해 보세요.",
    }
    return translations[id] || ""
  }

  // Simulate playback
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          // Handle looping
          if (loopStart !== null && loopEnd !== null) {
            if (prev >= loopEnd) {
              return loopStart
            }
          }

          // Handle end of video
          if (prev >= duration) {
            setIsPlaying(false)
            return duration
          }

          return prev + 0.1
        })
      }, 100 / playbackRate)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, duration, playbackRate, loopStart, loopEnd])

  // Update selected segment based on current time
  useEffect(() => {
    const currentSegment = transcript.find(
      (segment) => currentTime >= segment.startTime && currentTime < segment.endTime,
    )

    if (currentSegment) {
      setSelectedSegmentId(currentSegment.id)
    }
  }, [currentTime, transcript])

  // Format time (seconds to MM:SS)
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  // Handle play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  // Handle segment click
  const handleSegmentClick = (segmentId: number) => {
    const segment = transcript.find((s) => s.id === segmentId)
    if (segment) {
      setCurrentTime(segment.startTime)
      setSelectedSegmentId(segmentId)
      setIsPlaying(true)
    }
  }

  // Handle loop setting
  const setLoopPoints = (start: number | null, end: number | null) => {
    setLoopStart(start)
    setLoopEnd(end)

    if (start !== null) {
      setCurrentTime(start)
      setIsPlaying(true)
    }
  }

  // Set loop for current segment
  const loopCurrentSegment = () => {
    if (selectedSegmentId !== null) {
      const segment = transcript.find((s) => s.id === selectedSegmentId)
      if (segment) {
        setLoopPoints(segment.startTime, segment.endTime)
      }
    }
  }

  // Clear loop
  const clearLoop = () => {
    setLoopPoints(null, null)
  }

  // Add word to vocabulary
  const addToVocabulary = (word: string) => {
    onVocabularyAdd(word)
  }

  // Increase font size
  const increaseFontSize = () => {
    setFontSize((prev) => Math.min(prev + 2, 24))
  }

  // Decrease font size
  const decreaseFontSize = () => {
    setFontSize((prev) => Math.max(prev - 2, 12))
  }

  // Get current segment text
  const getCurrentSegmentText = () => {
    if (selectedSegmentId !== null) {
      const segment = transcript.find((s) => s.id === selectedSegmentId)
      return segment?.text || ""
    }
    return ""
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
          if (selectedSegmentId !== null) {
            const segment = transcript.find((s) => s.id === selectedSegmentId)
            if (segment) {
              setCurrentTime(segment.startTime)
            }
          }
          break
        case "ArrowUp":
          e.preventDefault()
          if (selectedSegmentId !== null && selectedSegmentId > 1) {
            handleSegmentClick(selectedSegmentId - 1)
          }
          break
        case "ArrowDown":
          e.preventDefault()
          if (selectedSegmentId !== null && selectedSegmentId < transcript.length) {
            handleSegmentClick(selectedSegmentId + 1)
          }
          break
        case "c":
        case "C":
          // Toggle selected segment visibility
          break
        case "s":
        case "S":
          // Toggle all subtitles
          break
        case "l":
        case "L":
          setShowTranslation(!showTranslation)
          break
        case "v":
        case "V":
          // Cycle through learning modes
          setLearningMode((prev) => {
            if (prev === "normal") return "repeat"
            if (prev === "repeat") return "shadowing"
            return "normal"
          })
          break
        case "[":
          if (selectedSegmentId !== null) {
            const segment = transcript.find((s) => s.id === selectedSegmentId)
            if (segment) {
              setLoopStart(segment.startTime)
            }
          }
          break
        case "]":
          if (selectedSegmentId !== null) {
            const segment = transcript.find((s) => s.id === selectedSegmentId)
            if (segment) {
              setLoopEnd(segment.endTime)
            }
          }
          break
        case "\\":
          clearLoop()
          break
        case "+":
          increaseFontSize()
          break
        case "-":
          decreaseFontSize()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [selectedSegmentId, transcript, showTranslation, isPlaying])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Video player and controls */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardContent className="p-0 relative">
            {/* Video placeholder */}
            <div className="aspect-video bg-gray-900 flex items-center justify-center relative">
              <img src="/placeholder.svg?height=480&width=854" alt="Video placeholder" className="w-full h-auto" />

              {/* Play/pause overlay */}
              {!isPlaying && (
                <div
                  className="absolute inset-0 flex items-center justify-center cursor-pointer"
                  onClick={togglePlayPause}
                >
                  <div className="bg-black/50 rounded-full p-4">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                </div>
              )}

              {/* Current subtitle */}
              {selectedSegmentId !== null && (
                <div
                  className="absolute bottom-16 left-0 right-0 text-center px-4"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  <div className="bg-black/70 text-white p-3 rounded inline-block max-w-[80%]">
                    {transcript.find((s) => s.id === selectedSegmentId)?.text}
                  </div>

                  {showTranslation && transcript.find((s) => s.id === selectedSegmentId)?.translation && (
                    <div className="bg-black/70 text-yellow-300 p-2 rounded inline-block max-w-[80%] mt-2">
                      {transcript.find((s) => s.id === selectedSegmentId)?.translation}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Video controls */}
            <div className="bg-gray-100 dark:bg-gray-800 p-4">
              {/* Progress bar */}
              <div className="mb-4">
                <Slider
                  value={[currentTime]}
                  max={duration}
                  step={0.1}
                  onValueChange={(value) => setCurrentTime(value[0])}
                />
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setCurrentTime(Math.max(0, currentTime - 5))}
                        >
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setCurrentTime(Math.min(duration, currentTime + 5))}
                        >
                          <SkipForward className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>5초 앞으로</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)}>
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>

                    <Slider
                      className="w-20"
                      value={[isMuted ? 0 : volume]}
                      max={100}
                      step={1}
                      onValueChange={(value) => {
                        setVolume(value[0])
                        setIsMuted(value[0] === 0)
                      }}
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
                          onClick={loopStart !== null ? clearLoop : loopCurrentSegment}
                        >
                          <Repeat className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{loopStart !== null ? "구간 반복 해제" : "현재 문장 반복"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Select
                    value={playbackRate.toString()}
                    onValueChange={(value) => setPlaybackRate(Number.parseFloat(value))}
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

                  <Select value={learningMode} onValueChange={setLearningMode}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="학습 모드" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">일반 모드</SelectItem>
                      <SelectItem value="repeat">반복 학습</SelectItem>
                      <SelectItem value="shadowing">쉐도잉</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning tools */}
        <Card>
          <CardContent className="p-4">
            <Tabs defaultValue="transcript">
              <TabsList className="mb-4">
                <TabsTrigger value="transcript">자막</TabsTrigger>
                <TabsTrigger value="vocabulary">어휘</TabsTrigger>
                <TabsTrigger value="notes">학습 노트</TabsTrigger>
              </TabsList>

              <TabsContent value="transcript">
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-2">
                    {transcript.map((segment) => (
                      <div
                        key={segment.id}
                        className={`p-3 rounded-md cursor-pointer transition-colors ${
                          selectedSegmentId === segment.id
                            ? "bg-primary/20 border-l-4 border-primary"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                        onClick={() => handleSegmentClick(segment.id)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs text-muted-foreground">
                            {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                          </span>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation()
                                loopCurrentSegment()
                              }}
                            >
                              <Repeat className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation()
                                // Add to bookmarks functionality
                              }}
                            >
                              <BookmarkPlus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p style={{ fontSize: `${fontSize}px` }}>{segment.text}</p>
                        {showTranslation && segment.translation && (
                          <p className="text-muted-foreground mt-1" style={{ fontSize: `${fontSize - 2}px` }}>
                            {segment.translation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="vocabulary">
                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-md">
                    <h3 className="font-medium mb-2">주요 어휘</h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "agenda",
                        "perspective",
                        "consider",
                        "summarize",
                        "wrap up",
                        "item",
                        "professionally",
                        "politely",
                        "disagree",
                        "conclude",
                      ].map((word) => (
                        <Badge
                          key={word}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary/10"
                          onClick={() => addToVocabulary(word)}
                        >
                          {word} <BookmarkPlus className="ml-1 h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-md">
                    <h3 className="font-medium mb-2">유용한 표현</h3>
                    <div className="space-y-2">
                      {[
                        "I'd like to welcome everyone to today's meeting.",
                        "Let's get started with the first item on our agenda.",
                        "In my view...",
                        "From my perspective, we should consider...",
                        "I see your point, but...",
                        "Let's summarize what we've discussed.",
                      ].map((phrase, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <p className="text-sm">{phrase}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              // Practice phrase functionality
                            }}
                          >
                            <Mic className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notes">
                <div className="space-y-4">
                  <textarea
                    className="w-full h-[200px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="학습 중 메모를 작성하세요..."
                  />
                  <div className="flex justify-end">
                    <Button>저장</Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* AI assistant and learning tools */}
      <div className="space-y-6">
        {/* Learning mode info */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-lg mb-2">
              학습 모드: {learningMode === "normal" ? "일반 모드" : learningMode === "repeat" ? "반복 학습" : "쉐도잉"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {learningMode === "normal"
                ? "영상을 시청하며 자막을 통해 학습합니다. 중요한 표현을 클릭하여 단어장에 추가할 수 있습니다."
                : learningMode === "repeat"
                  ? "각 문장을 여러 번 반복하여 들으며 발음과 표현을 익힙니다. 문장 사이에 잠시 멈춤이 있어 따라 말할 수 있습니다."
                  : "원어민의 발음 직후 따라 말하는 쉐도잉 기법으로 학습합니다. 발음과 억양을 집중적으로 향상시킬 수 있습니다."}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={learningMode === "normal" ? "default" : "outline"}
                size="sm"
                onClick={() => setLearningMode("normal")}
              >
                일반 모드
              </Button>
              <Button
                variant={learningMode === "repeat" ? "default" : "outline"}
                size="sm"
                onClick={() => setLearningMode("repeat")}
              >
                반복 학습
              </Button>
              <Button
                variant={learningMode === "shadowing" ? "default" : "outline"}
                size="sm"
                onClick={() => setLearningMode("shadowing")}
              >
                쉐도잉
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI assistant */}
        <AIAssistant
          currentText={getCurrentSegmentText()}
          learningLanguage={userProfile.targetLanguage}
          nativeLanguage={userProfile.nativeLanguage}
        />

        {/* Font size controls */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">자막 설정</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm">글자 크기</span>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={decreaseFontSize} disabled={fontSize <= 12}>
                  -
                </Button>
                <span>{fontSize}px</span>
                <Button variant="outline" size="icon" onClick={increaseFontSize} disabled={fontSize >= 24}>
                  +
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm">번역 표시</span>
              <Button
                variant={showTranslation ? "default" : "outline"}
                size="sm"
                onClick={() => setShowTranslation(!showTranslation)}
              >
                {showTranslation ? "켜짐" : "꺼짐"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Keyboard shortcuts reminder */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">단축키 안내</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span>재생/일시정지</span>
                <kbd className="px-2 py-0.5 bg-muted rounded text-xs">Space</kbd>
              </div>
              <div className="flex justify-between">
                <span>문장 처음으로</span>
                <kbd className="px-2 py-0.5 bg-muted rounded text-xs">←</kbd>
              </div>
              <div className="flex justify-between">
                <span>이전 문장</span>
                <kbd className="px-2 py-0.5 bg-muted rounded text-xs">↑</kbd>
              </div>
              <div className="flex justify-between">
                <span>다음 문장</span>
                <kbd className="px-2 py-0.5 bg-muted rounded text-xs">↓</kbd>
              </div>
              <div className="flex justify-between">
                <span>번역 보기/숨기기</span>
                <kbd className="px-2 py-0.5 bg-muted rounded text-xs">L</kbd>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LearningMode

