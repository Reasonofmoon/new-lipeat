"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VideoSearch } from "@/components/video-search"
import { VideoPlayer } from "@/components/video-player"
import { SubtitleEditor } from "@/components/subtitle-editor"
import { SubtitleUploader } from "@/components/subtitle-uploader"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export interface VideoInfo {
  videoId: string
  title: string
  thumbnailUrl: string
  channelTitle: string
}

export interface SubtitleItem {
  id: string
  startTime: number
  endTime: number
  text: string
  translation?: string
  notes?: string
  vocabularyItems?: VocabularyItem[]
}

export interface VocabularyItem {
  id: string
  word: string
  definition: string
  translation: string
  examples: string[]
  partOfSpeech: string
}

const LanguageLearningApp = () => {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("search")
  const [selectedVideo, setSelectedVideo] = useState<VideoInfo | null>(null)
  const [subtitles, setSubtitles] = useState<SubtitleItem[]>([])
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState<number>(-1)
  const [savedVocabulary, setSavedVocabulary] = useState<VocabularyItem[]>([])
  const [learningLanguage, setLearningLanguage] = useState("ko")
  const [nativeLanguage, setNativeLanguage] = useState("en")
  const [showSubtitleAlert, setShowSubtitleAlert] = useState(false)

  // Load saved vocabulary from localStorage on initial load
  useEffect(() => {
    const savedVocab = localStorage.getItem("savedVocabulary")
    if (savedVocab) {
      try {
        setSavedVocabulary(JSON.parse(savedVocab))
      } catch (error) {
        console.error("Error loading saved vocabulary:", error)
      }
    }
  }, [])

  // Save vocabulary to localStorage when it changes
  useEffect(() => {
    if (savedVocabulary.length > 0) {
      localStorage.setItem("savedVocabulary", JSON.stringify(savedVocabulary))
    }
  }, [savedVocabulary])

  // Show subtitle alert when a video is selected but no subtitles are available
  useEffect(() => {
    if (selectedVideo && subtitles.length === 0) {
      setShowSubtitleAlert(true)
    } else {
      setShowSubtitleAlert(false)
    }
  }, [selectedVideo, subtitles])

  const handleVideoSelect = async (video: VideoInfo) => {
    setSelectedVideo(video)
    // Reset subtitles when a new video is selected
    setSubtitles([])
    setCurrentSubtitleIndex(-1)
    setActiveTab("player")
  }

  const handleSubtitleUpload = (newSubtitles: SubtitleItem[]) => {
    setSubtitles(newSubtitles)
    toast({
      title: "자막 업로드 완료",
      description: `${newSubtitles.length}개의 자막이 성공적으로 로드되었습니다.`,
    })

    if (selectedVideo) {
      setActiveTab("player")
    }
  }

  const handleSubtitleUpdate = (updatedSubtitles: SubtitleItem[]) => {
    setSubtitles(updatedSubtitles)
    toast({
      title: "자막 업데이트 완료",
      description: "변경 사항이 저장되었습니다.",
    })
  }

  const handleCurrentSubtitleChange = (index: number) => {
    setCurrentSubtitleIndex(index)
  }

  const handleSaveVocabulary = (item: VocabularyItem) => {
    // Check if the vocabulary item already exists
    const exists = savedVocabulary.some((v) => v.id === item.id)

    if (!exists) {
      setSavedVocabulary((prev) => [...prev, item])
      toast({
        title: "단어 저장됨",
        description: `"${item.word}"가 단어장에 추가되었습니다.`,
      })
    } else {
      // Update existing item
      setSavedVocabulary((prev) => prev.map((v) => (v.id === item.id ? item : v)))
      toast({
        title: "단어 업데이트됨",
        description: `"${item.word}"가 단어장에서 업데이트되었습니다.`,
      })
    }
  }

  const handleLanguageChange = (learning: string, native: string) => {
    setLearningLanguage(learning)
    setNativeLanguage(native)

    // Reset subtitles when language changes
    if (selectedVideo) {
      toast({
        title: "언어 변경됨",
        description: "새 언어로 자막을 가져오려면 영상을 다시 로드하세요.",
      })
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <header className="flex flex-col sm:flex-row justify-between items-center py-4 border-b">
        <h1 className="text-2xl font-bold">언어 학습 어시스턴트</h1>
        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          <select
            className="border rounded p-1 text-sm"
            value={learningLanguage}
            onChange={(e) => handleLanguageChange(e.target.value, nativeLanguage)}
          >
            <option value="en">학습: 영어</option>
            <option value="es">학습: 스페인어</option>
            <option value="fr">학습: 프랑스어</option>
            <option value="de">학습: 독일어</option>
            <option value="ja">학습: 일본어</option>
            <option value="ko">학습: 한국어</option>
            <option value="zh">학습: 중국어</option>
          </select>
          <select
            className="border rounded p-1 text-sm"
            value={nativeLanguage}
            onChange={(e) => handleLanguageChange(learningLanguage, e.target.value)}
          >
            <option value="en">모국어: 영어</option>
            <option value="es">모국어: 스페인어</option>
            <option value="fr">모국어: 프랑스어</option>
            <option value="de">모국어: 독일어</option>
            <option value="ja">모국어: 일본어</option>
            <option value="ko">모국어: 한국어</option>
            <option value="zh">모국어: 중국어</option>
          </select>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="search">영상 검색</TabsTrigger>
          <TabsTrigger value="player" disabled={!selectedVideo}>
            영상 플레이어
          </TabsTrigger>
          <TabsTrigger value="editor" disabled={!selectedVideo || subtitles.length === 0}>
            자막 편집기
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search">
          <VideoSearch onVideoSelect={handleVideoSelect} learningLanguage={learningLanguage} />
        </TabsContent>

        <TabsContent value="player">
          {selectedVideo && (
            <>
              {showSubtitleAlert && (
                <Alert variant="warning" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>자막이 필요합니다</AlertTitle>
                  <AlertDescription>
                    이 영상에 대한 자막이 없습니다. 아래에서 자막 파일을 업로드하거나 YouTube 자막을 가져오세요.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <VideoPlayer
                    videoId={selectedVideo.videoId}
                    subtitles={subtitles}
                    onCurrentSubtitleChange={handleCurrentSubtitleChange}
                    learningLanguage={learningLanguage}
                    nativeLanguage={nativeLanguage}
                    onSaveVocabulary={handleSaveVocabulary}
                    onSubtitlesLoaded={handleSubtitleUpload}
                  />
                </div>
                <div>
                  <SubtitleUploader videoId={selectedVideo.videoId} onSubtitlesUploaded={handleSubtitleUpload} />
                </div>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="editor">
          {selectedVideo && subtitles.length > 0 && (
            <SubtitleEditor
              subtitles={subtitles}
              onSubtitlesUpdate={handleSubtitleUpdate}
              currentSubtitleIndex={currentSubtitleIndex}
              learningLanguage={learningLanguage}
              nativeLanguage={nativeLanguage}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default LanguageLearningApp

