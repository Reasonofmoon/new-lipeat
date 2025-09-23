"use client"

import { Label } from "@/components/ui/label"

import type React from "react"
import { useState, useEffect } from "react"
import { BookOpen, Search, SortAsc, Filter, Play, Check, X, Edit, Trash2, Plus, Volume2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"

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

interface VocabularyItem {
  id: string
  word: string
  translation: string
  definition: string
  examples: string[]
  tags: string[]
  proficiency: number // 0-100
  lastReviewed: Date
  nextReview: Date
  source?: string
}

interface VocabularyManagerProps {
  userProfile: UserProfile
  onPracticeComplete: () => void
}

const VocabularyManager: React.FC<VocabularyManagerProps> = ({ userProfile, onPracticeComplete }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")
  const [sortBy, setSortBy] = useState("alphabetical")
  const [isQuizMode, setIsQuizMode] = useState(false)
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [editingWord, setEditingWord] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Mock vocabulary data
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([
    {
      id: "1",
      word: "agenda",
      translation: "의제",
      definition: "A list of items to be discussed at a meeting.",
      examples: [
        "Let's go through the agenda for today's meeting.",
        "The first item on our agenda is the budget review.",
      ],
      tags: ["business", "meetings"],
      proficiency: 70,
      lastReviewed: new Date('2024-12-20T10:00:00Z'), // 3 days ago
      nextReview: new Date('2024-12-25T10:00:00Z'), // 2 days from now
      source: "Business English Lesson",
    },
    {
      id: "2",
      word: "perspective",
      translation: "관점",
      definition: "A particular way of considering something.",
      examples: [
        "From my perspective, we should invest more in marketing.",
        "It's important to consider different perspectives.",
      ],
      tags: ["business", "discussions"],
      proficiency: 50,
      lastReviewed: new Date('2024-12-18T10:00:00Z'),
      nextReview: new Date('2024-12-24T10:00:00Z'),
      source: "Business English Lesson",
    },
    {
      id: "3",
      word: "consider",
      translation: "고려하다",
      definition: "To think carefully about something.",
      examples: [
        "We need to consider all the options before making a decision.",
        "Have you considered the implications of this change?",
      ],
      tags: ["business", "general"],
      proficiency: 85,
      lastReviewed: new Date('2024-12-21T10:00:00Z'),
      nextReview: new Date('2024-12-28T10:00:00Z'),
      source: "Business English Lesson",
    },
    {
      id: "4",
      word: "summarize",
      translation: "요약하다",
      definition: "To give a brief statement of the main points.",
      examples: [
        "Could you summarize the main points of the discussion?",
        "Let me summarize what we've agreed on so far.",
      ],
      tags: ["business", "meetings", "presentations"],
      proficiency: 60,
      lastReviewed: new Date('2024-12-19T10:00:00Z'),
      nextReview: new Date('2024-12-24T10:00:00Z'),
      source: "Business English Lesson",
    },
    {
      id: "5",
      word: "wrap up",
      translation: "마무리하다",
      definition: "To bring something to a conclusion.",
      examples: [
        "Let's wrap up this meeting by 5 PM.",
        "To wrap up, I'd like to thank everyone for their contributions.",
      ],
      tags: ["business", "meetings", "phrasal verb"],
      proficiency: 40,
      lastReviewed: new Date('2024-12-17T10:00:00Z'),
      nextReview: new Date('2024-12-23T10:00:00Z'),
      source: "Business English Lesson",
    },
  ])

  // Filter vocabulary based on search term and filter
  const filteredVocabulary = vocabulary.filter((item) => {
    const matchesSearch =
      item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translation.toLowerCase().includes(searchTerm.toLowerCase())

    if (filter === "all") return matchesSearch
    if (filter === "review-today") return matchesSearch && item.nextReview <= new Date()
    if (filter === "low-proficiency") return matchesSearch && item.proficiency < 50
    if (filter === "business") return matchesSearch && item.tags.includes("business")

    return matchesSearch
  })

  // Sort vocabulary
  const sortedVocabulary = [...filteredVocabulary].sort((a, b) => {
    if (sortBy === "alphabetical") return a.word.localeCompare(b.word)
    if (sortBy === "proficiency-asc") return a.proficiency - b.proficiency
    if (sortBy === "proficiency-desc") return b.proficiency - a.proficiency
    if (sortBy === "recently-added") return new Date(b.lastReviewed).getTime() - new Date(a.lastReviewed).getTime()

    return 0
  })

  // Get words due for review today
  const wordsForReview = vocabulary.filter((item) => item.nextReview <= new Date())

  // Handle quiz answer
  const handleQuizAnswer = (correct: boolean) => {
    // Update proficiency
    const updatedVocabulary = [...vocabulary]
    const currentWord = wordsForReview[currentQuizIndex]

    if (correct) {
      updatedVocabulary.find((item) => item.id === currentWord.id)!.proficiency = Math.min(
        100,
        currentWord.proficiency + 10,
      )
    } else {
      updatedVocabulary.find((item) => item.id === currentWord.id)!.proficiency = Math.max(
        0,
        currentWord.proficiency - 5,
      )
    }

    // Update review dates
    const now = new Date()
    updatedVocabulary.find((item) => item.id === currentWord.id)!.lastReviewed = now

    // Calculate next review date based on proficiency
    // Higher proficiency = longer interval
    const daysUntilNextReview = Math.max(1, Math.floor(currentWord.proficiency / 20))
    const nextReview = new Date()
    nextReview.setDate(now.getDate() + daysUntilNextReview)
    updatedVocabulary.find((item) => item.id === currentWord.id)!.nextReview = nextReview

    setVocabulary(updatedVocabulary)
    setShowAnswer(false)

    // Move to next question or end quiz
    if (currentQuizIndex < wordsForReview.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1)
    } else {
      setIsQuizMode(false)
      setCurrentQuizIndex(0)
      onPracticeComplete()
    }
  }

  // Delete vocabulary item
  const deleteVocabularyItem = (id: string) => {
    setVocabulary(vocabulary.filter((item) => item.id !== id))
  }

  // Add new vocabulary item
  const addVocabularyItem = () => {
    const newItem: VocabularyItem = {
      id: Date.now().toString(),
      word: "",
      translation: "",
      definition: "",
      examples: [""],
      tags: [],
      proficiency: 0,
      lastReviewed: new Date(),
      nextReview: new Date(),
    }

    setVocabulary([newItem, ...vocabulary])
    setEditingWord(newItem.id)
  }

  // Format date
  const formatDate = (date: Date) => {
    if (!isClient) {
      return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
    }

    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)

    if (date.toDateString() === today.toDateString()) return "오늘"
    if (date.toDateString() === tomorrow.toDateString()) return "내일"

    return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
  }

  return (
    <div className="space-y-6">
      {isQuizMode ? (
        <Card>
          <CardHeader>
            <CardTitle>
              단어 복습 ({currentQuizIndex + 1}/{wordsForReview.length})
            </CardTitle>
            <CardDescription>
              단어의 뜻을 기억해보세요. 정답을 확인한 후 자신의 정답이 맞았는지 체크하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center py-8">
                <h2 className="text-3xl font-bold mb-2">{wordsForReview[currentQuizIndex].word}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-2"
                  onClick={() => {
                    // Play pronunciation
                  }}
                >
                  <Volume2 className="h-5 w-5" />
                </Button>
              </div>

              {showAnswer ? (
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-md">
                    <div className="font-medium mb-1">뜻</div>
                    <p>{wordsForReview[currentQuizIndex].translation}</p>
                  </div>

                  <div className="bg-muted p-4 rounded-md">
                    <div className="font-medium mb-1">정의</div>
                    <p>{wordsForReview[currentQuizIndex].definition}</p>
                  </div>

                  <div className="bg-muted p-4 rounded-md">
                    <div className="font-medium mb-1">예문</div>
                    <ul className="list-disc pl-5 space-y-1">
                      {wordsForReview[currentQuizIndex].examples.map((example, index) => (
                        <li key={index}>{example}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-center space-x-4 mt-6">
                    <Button variant="outline" className="w-32" onClick={() => handleQuizAnswer(false)}>
                      <X className="mr-2 h-4 w-4" />
                      틀렸어요
                    </Button>
                    <Button className="w-32" onClick={() => handleQuizAnswer(true)}>
                      <Check className="mr-2 h-4 w-4" />
                      맞았어요
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center">
                  <Button size="lg" onClick={() => setShowAnswer(true)}>
                    정답 확인하기
                  </Button>
                </div>
              )}

              <Progress value={(currentQuizIndex / wordsForReview.length) * 100} className="mt-6" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="단어 검색..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 단어</SelectItem>
                  <SelectItem value="review-today">오늘 복습</SelectItem>
                  <SelectItem value="low-proficiency">낮은 숙련도</SelectItem>
                  <SelectItem value="business">비즈니스</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SortAsc className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="정렬" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alphabetical">알파벳순</SelectItem>
                  <SelectItem value="proficiency-asc">숙련도 (낮은순)</SelectItem>
                  <SelectItem value="proficiency-desc">숙련도 (높은순)</SelectItem>
                  <SelectItem value="recently-added">최근 추가순</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">단어장 ({vocabulary.length}개)</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={addVocabularyItem}>
                <Plus className="mr-2 h-4 w-4" />
                단어 추가
              </Button>

              <Button
                onClick={() => {
                  if (wordsForReview.length > 0) {
                    setIsQuizMode(true)
                  }
                }}
                disabled={wordsForReview.length === 0}
              >
                <Play className="mr-2 h-4 w-4" />
                단어 복습 ({wordsForReview.length})
              </Button>
            </div>
          </div>

          <Tabs defaultValue="list">
            <TabsList>
              <TabsTrigger value="list">목록 보기</TabsTrigger>
              <TabsTrigger value="grid">그리드 보기</TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {sortedVocabulary.length > 0 ? (
                    sortedVocabulary.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center">
                                <h3 className="text-lg font-medium">{item.word}</h3>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="ml-1"
                                  onClick={() => {
                                    // Play pronunciation
                                  }}
                                >
                                  <Volume2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <p className="text-muted-foreground">{item.translation}</p>
                            </div>
                            <div className="flex items-center">
                              <Button variant="ghost" size="icon" onClick={() => setEditingWord(item.id)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => deleteVocabularyItem(item.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {editingWord === item.id ? (
                            <div className="mt-4 space-y-3">
                              <div>
                                <Label htmlFor={`word-${item.id}`}>단어</Label>
                                <Input
                                  id={`word-${item.id}`}
                                  value={item.word}
                                  onChange={(e) => {
                                    const updated = [...vocabulary]
                                    const index = updated.findIndex((w) => w.id === item.id)
                                    updated[index].word = e.target.value
                                    setVocabulary(updated)
                                  }}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`translation-${item.id}`}>번역</Label>
                                <Input
                                  id={`translation-${item.id}`}
                                  value={item.translation}
                                  onChange={(e) => {
                                    const updated = [...vocabulary]
                                    const index = updated.findIndex((w) => w.id === item.id)
                                    updated[index].translation = e.target.value
                                    setVocabulary(updated)
                                  }}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`definition-${item.id}`}>정의</Label>
                                <Input
                                  id={`definition-${item.id}`}
                                  value={item.definition}
                                  onChange={(e) => {
                                    const updated = [...vocabulary]
                                    const index = updated.findIndex((w) => w.id === item.id)
                                    updated[index].definition = e.target.value
                                    setVocabulary(updated)
                                  }}
                                />
                              </div>
                              <div className="flex justify-end">
                                <Button onClick={() => setEditingWord(null)}>저장</Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="mt-3">
                                <p className="text-sm">{item.definition}</p>
                              </div>

                              {item.examples.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-sm font-medium">예문:</p>
                                  <ul className="list-disc pl-5 mt-1 space-y-1 text-sm">
                                    {item.examples.map((example, index) => (
                                      <li key={index}>{example}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              <div className="mt-3 flex justify-between items-center">
                                <div className="flex flex-wrap gap-1">
                                  {item.tags.map((tag) => (
                                    <Badge key={tag} variant="outline">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  다음 복습: {formatDate(item.nextReview)}
                                </div>
                              </div>

                              <div className="mt-3">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>숙련도</span>
                                  <span>{item.proficiency}%</span>
                                </div>
                                <Progress value={item.proficiency} />
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="mt-4 text-muted-foreground">
                        {searchTerm ? "검색 결과가 없습니다." : "단어장이 비어 있습니다."}
                      </p>
                      <Button className="mt-4" onClick={addVocabularyItem}>
                        <Plus className="mr-2 h-4 w-4" />
                        단어 추가하기
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="grid">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedVocabulary.length > 0 ? (
                  sortedVocabulary.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium">{item.word}</h3>
                            <p className="text-muted-foreground">{item.translation}</p>
                          </div>
                          <div className="flex">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                // Play pronunciation
                              }}
                            >
                              <Volume2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="mt-2">
                          <Progress value={item.proficiency} className="h-1" />
                        </div>

                        <div className="mt-3 flex justify-between items-center text-xs">
                          <div className="flex gap-1">
                            {item.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {item.tags.length > 2 && <Badge variant="outline">+{item.tags.length - 2}</Badge>}
                          </div>
                          <div className="text-muted-foreground">{formatDate(item.nextReview)}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">
                      {searchTerm ? "검색 결과가 없습니다." : "단어장이 비어 있습니다."}
                    </p>
                    <Button className="mt-4" onClick={addVocabularyItem}>
                      <Plus className="mr-2 h-4 w-4" />
                      단어 추가하기
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

export default VocabularyManager

