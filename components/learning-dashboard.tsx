"use client"

import { useState } from "react"
import { BookOpen, Clock, Flame, BookOpenCheck, Brain, Play } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { VideoInfo, VocabularyItem } from "@/components/language-learning-app"

interface LearningDashboardProps {
  savedVocabulary: VocabularyItem[]
  onVideoSelect: (video: VideoInfo) => void
}

export function LearningDashboard({ savedVocabulary, onVideoSelect }: LearningDashboardProps) {
  // Mock user data
  const [userData, setUserData] = useState({
    streak: 5,
    totalLearningTime: 320, // minutes
    completedVideos: 8,
    vocabularyGoal: 100,
    lastActivity: "2 hours ago",
  })

  // Mock recommended videos
  const [recommendedVideos, setRecommendedVideos] = useState<VideoInfo[]>([
    {
      videoId: "dQw4w9WgXcQ",
      title: "Basic Conversation Skills",
      thumbnailUrl: "/placeholder.svg?height=180&width=320",
      channelTitle: "Language Learning Channel",
    },
    {
      videoId: "xvFZjo5PgG0",
      title: "Essential Vocabulary for Beginners",
      thumbnailUrl: "/placeholder.svg?height=180&width=320",
      channelTitle: "Language Mastery",
    },
    {
      videoId: "bxqLsrlakK8",
      title: "Grammar Fundamentals",
      thumbnailUrl: "/placeholder.svg?height=180&width=320",
      channelTitle: "Grammar Expert",
    },
  ])

  // Mock recent activity
  const [recentActivity, setRecentActivity] = useState([
    {
      id: "1",
      type: "video",
      title: "Common Phrases for Everyday Use",
      date: "Yesterday",
      duration: "15 minutes",
    },
    {
      id: "2",
      type: "vocabulary",
      title: "Added 5 new words",
      date: "2 days ago",
      count: 5,
    },
    {
      id: "3",
      type: "video",
      title: "Beginner's Guide to Pronunciation",
      date: "3 days ago",
      duration: "22 minutes",
    },
  ])

  // Calculate vocabulary progress
  const vocabularyProgress = Math.min(100, Math.round((savedVocabulary.length / userData.vocabularyGoal) * 100))

  // Format learning time
  const formatLearningTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left column */}
      <div className="md:col-span-2 space-y-6">
        {/* Welcome card */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome to your Language Learning Assistant</CardTitle>
            <CardDescription>Track your progress and continue your language learning journey.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Vocabulary Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {savedVocabulary.length}/{userData.vocabularyGoal} words
                  </span>
                </div>
                <Progress value={vocabularyProgress} className="h-2" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4">
                <div className="bg-primary/10 rounded-lg p-4 text-center flex flex-col items-center">
                  <Flame className="w-6 h-6 text-primary mb-2" />
                  <div className="text-2xl font-bold text-primary">{userData.streak}</div>
                  <div className="text-sm text-primary/80">Day Streak</div>
                </div>
                <div className="bg-primary/10 rounded-lg p-4 text-center flex flex-col items-center">
                  <BookOpenCheck className="w-6 h-6 text-primary mb-2" />
                  <div className="text-2xl font-bold text-primary">{userData.completedVideos}</div>
                  <div className="text-sm text-primary/80">Videos Completed</div>
                </div>
                <div className="bg-primary/10 rounded-lg p-4 text-center flex flex-col items-center">
                  <BookOpen className="w-6 h-6 text-primary mb-2" />
                  <div className="text-2xl font-bold text-primary">{savedVocabulary.length}</div>
                  <div className="text-sm text-primary/80">Vocabulary Words</div>
                </div>
                <div className="bg-primary/10 rounded-lg p-4 text-center flex flex-col items-center">
                  <Clock className="w-6 h-6 text-primary mb-2" />
                  <div className="text-2xl font-bold text-primary">
                    {formatLearningTime(userData.totalLearningTime).split(" ")[0]}
                  </div>
                  <div className="text-sm text-primary/80">Learning Time</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI assistant recommendation */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <div className="bg-primary/20 p-2 rounded-full">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-lg">AI Learning Assistant</h3>
                <p className="text-muted-foreground mt-1">
                  Based on your learning history, I recommend focusing on vocabulary building. You've been making great
                  progress with conversation skills, but expanding your vocabulary will help you express yourself more
                  precisely.
                </p>
                <div className="mt-3">
                  <Button onClick={() => onVideoSelect(recommendedVideos[1])}>Watch Recommended Video</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommended videos */}
        <Card>
          <CardHeader>
            <CardTitle>Recommended Videos</CardTitle>
            <CardDescription>Videos selected based on your learning progress and interests.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recommendedVideos.map((video) => (
                <Card
                  key={video.videoId}
                  className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                  onClick={() => onVideoSelect(video)}
                >
                  <div className="aspect-video relative">
                    <img
                      src={video.thumbnailUrl || "/placeholder.svg"}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/50 transition-opacity">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium line-clamp-2">{video.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{video.channelTitle}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right column */}
      <div className="space-y-6">
        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your learning activity in the past week.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-md hover:bg-muted">
                  <div className="bg-primary/20 p-2 rounded-full">
                    {activity.type === "video" ? (
                      <Play className="w-4 h-4 text-primary" />
                    ) : (
                      <BookOpen className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-muted-foreground">{activity.date}</span>
                      {activity.type === "video" && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {activity.duration}
                        </Badge>
                      )}
                      {activity.type === "vocabulary" && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {activity.count} words
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View All Activity
            </Button>
          </CardFooter>
        </Card>

        {/* Vocabulary stats */}
        <Card>
          <CardHeader>
            <CardTitle>Vocabulary Stats</CardTitle>
            <CardDescription>Breakdown of your vocabulary by part of speech.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  type: "Nouns",
                  count: savedVocabulary.filter((v) => v.partOfSpeech === "noun").length,
                  total: savedVocabulary.length,
                  color: "bg-blue-500",
                },
                {
                  type: "Verbs",
                  count: savedVocabulary.filter((v) => v.partOfSpeech === "verb").length,
                  total: savedVocabulary.length,
                  color: "bg-green-500",
                },
                {
                  type: "Adjectives",
                  count: savedVocabulary.filter((v) => v.partOfSpeech === "adjective").length,
                  total: savedVocabulary.length,
                  color: "bg-purple-500",
                },
                {
                  type: "Other",
                  count: savedVocabulary.filter((v) => !["noun", "verb", "adjective"].includes(v.partOfSpeech)).length,
                  total: savedVocabulary.length,
                  color: "bg-orange-500",
                },
              ].map((stat) => (
                <div key={stat.type}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{stat.type}</span>
                    <span className="text-sm text-muted-foreground">{stat.count} words</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`${stat.color} h-2 rounded-full`}
                      style={{ width: `${stat.total > 0 ? (stat.count / stat.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Learning tips */}
        <Card>
          <CardHeader>
            <CardTitle>Learning Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <p>• Watch videos with subtitles to improve listening comprehension.</p>
              <p>• Save new vocabulary words you encounter for later review.</p>
              <p>• Practice speaking by repeating phrases from the videos.</p>
              <p>• Use the AI assistant to get explanations for difficult concepts.</p>
              <p>• Maintain a daily learning streak for consistent progress.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LearningDashboard

