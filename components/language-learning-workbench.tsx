"use client"

import { useState, useEffect } from "react"
import { Keyboard, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import KeyboardShortcutsModal from "./keyboard-shortcuts-modal"
import MediaUploader from "./media-uploader"
import LearningDashboard from "./learning-dashboard"
import LearningMode from "./learning-mode"
import VocabularyManager from "./vocabulary-manager"
import { useToast } from "@/hooks/use-toast"

// Types for our agentic workflow system
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

interface LearningStats {
  listening: number
  speaking: number
  vocabulary: number
  grammar: number
  reading: number
}

interface RecommendedContent {
  id: string
  title: string
  source: string
  type: "video" | "audio" | "text"
  difficulty: "easy" | "medium" | "hard"
  duration: number
  tags: string[]
  thumbnail?: string
}

const LanguageLearningWorkbench = () => {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [language, setLanguage] = useState("en")
  const [isKeyboardShortcutsOpen, setIsKeyboardShortcutsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Mock user profile data
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: "user1",
    name: "사용자",
    languageLevel: "intermediate",
    targetLanguage: "en",
    nativeLanguage: "ko",
    interests: ["business", "travel", "technology"],
    learningGoals: ["fluent conversation", "business presentations"],
    streak: 5,
    totalLearningTime: 1240, // minutes
    vocabularyCount: 342,
    completedLessons: 28,
  })

  // Mock learning stats
  const [learningStats, setLearningStats] = useState<LearningStats>({
    listening: 75,
    speaking: 60,
    vocabulary: 80,
    grammar: 65,
    reading: 70,
  })

  // Mock recommended content
  const [recommendedContent, setRecommendedContent] = useState<RecommendedContent[]>([
    {
      id: "1",
      title: "Essential Business English Phrases",
      source: "YouTube",
      type: "video",
      difficulty: "medium",
      duration: 420, // seconds
      tags: ["business", "phrases", "formal"],
      thumbnail: "/placeholder.svg?height=120&width=200",
    },
    {
      id: "2",
      title: "Travel Conversations for Intermediates",
      source: "YouTube",
      type: "video",
      difficulty: "medium",
      duration: 380,
      tags: ["travel", "conversation", "practical"],
      thumbnail: "/placeholder.svg?height=120&width=200",
    },
    {
      id: "3",
      title: "Technology Vocabulary Expansion",
      source: "YouTube",
      type: "video",
      difficulty: "hard",
      duration: 540,
      tags: ["technology", "vocabulary", "advanced"],
      thumbnail: "/placeholder.svg?height=120&width=200",
    },
  ])

  // Language options
  const languageOptions = [
    { value: "en", label: "English" },
    { value: "ko", label: "한국어" },
    { value: "ja", label: "日本語" },
    { value: "zh", label: "中文" },
    { value: "es", label: "Español" },
  ]

  // Handle language change
  const handleLanguageChange = (value: string) => {
    setLanguage(value)
    toast({
      title: "언어가 변경되었습니다",
      description: `선택한 언어: ${languageOptions.find((lang) => lang.value === value)?.label}`,
    })
  }

  // Simulate AI recommendation based on user profile
  useEffect(() => {
    // This would be replaced with actual AI logic in a production app
    const simulateAiRecommendation = () => {
      // Example of how the AI might analyze user data to make recommendations
      const userInterests = userProfile.interests
      const userLevel = userProfile.languageLevel

      // Simulate AI processing
      console.log(`AI analyzing user interests: ${userInterests.join(", ")}`)
      console.log(`User language level: ${userLevel}`)

      // In a real implementation, this would call an API or run a model
      // For now, we'll just use our mock data
    }

    simulateAiRecommendation()
  }, [userProfile])

  // Format minutes into hours and minutes
  const formatLearningTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">어학 학습 워크벤치</h1>
          <div className="flex items-center space-x-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setIsKeyboardShortcutsOpen(true)}>
                    <Keyboard className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">단축키</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>학습 단축키 보기</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="언어 선택" />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isLoggedIn ? (
              <Button variant="ghost" size="sm" className="flex items-center">
                <Avatar className="w-8 h-8 mr-2">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline">프로필</span>
              </Button>
            ) : (
              <Button size="sm" onClick={() => setIsLoggedIn(true)}>
                <User className="w-4 h-4 mr-2" />
                로그인
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow container mx-auto p-4 md:p-6">
        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 w-full justify-start overflow-x-auto">
            <TabsTrigger value="dashboard">대시보드</TabsTrigger>
            <TabsTrigger value="upload">미디어 업로드</TabsTrigger>
            <TabsTrigger value="learning">학습 모드</TabsTrigger>
            <TabsTrigger value="vocabulary">단어장</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <LearningDashboard
              userProfile={userProfile}
              learningStats={learningStats}
              recommendedContent={recommendedContent}
              formatLearningTime={formatLearningTime}
              onStartLearning={() => setActiveTab("learning")}
            />
          </TabsContent>

          <TabsContent value="upload">
            <MediaUploader
              onUploadSuccess={(mediaInfo) => {
                toast({
                  title: "미디어 업로드 성공",
                  description: `${mediaInfo.title} 파일이 업로드되었습니다.`,
                })
                setActiveTab("learning")
              }}
            />
          </TabsContent>

          <TabsContent value="learning">
            <LearningMode
              userProfile={userProfile}
              onVocabularyAdd={(word) => {
                setUserProfile((prev) => ({
                  ...prev,
                  vocabularyCount: prev.vocabularyCount + 1,
                }))
                toast({
                  title: "단어가 추가되었습니다",
                  description: `"${word}"가 단어장에 추가되었습니다.`,
                })
              }}
            />
          </TabsContent>

          <TabsContent value="vocabulary">
            <VocabularyManager
              userProfile={userProfile}
              onPracticeComplete={() => {
                toast({
                  title: "단어 학습 완료",
                  description: "오늘의 단어 학습을 완료했습니다!",
                })
              }}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4 mt-8">
        <div className="container mx-auto text-center text-sm">
          <p>© 2025 어학 학습 워크벤치. 모든 권리 보유.</p>
          <p className="mt-1">문의: support@langworkbench.com</p>
        </div>
      </footer>

      {/* Keyboard shortcuts modal */}
      <KeyboardShortcutsModal isOpen={isKeyboardShortcutsOpen} onClose={() => setIsKeyboardShortcutsOpen(false)} />
    </div>
  )
}

export default LanguageLearningWorkbench

