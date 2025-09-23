"use client"

import type React from "react"
import { useState } from "react"
import { Upload } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface MediaUploaderProps {
  onUploadSuccess: (mediaInfo: { title: string; source: string; type: string }) => void
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ onUploadSuccess }) => {
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("youtube")
  const [error, setError] = useState<string | null>(null)

  // Handle YouTube URL submission
  const handleYoutubeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!youtubeUrl) {
      setError("YouTube URL을 입력해주세요.")
      return
    }

    // Validate YouTube URL (simple validation)
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/
    if (!youtubeRegex.test(youtubeUrl)) {
      setError("유효한 YouTube URL이 아닙니다.")
      return
    }

    // Simulate processing
    setIsUploading(true)

    // Simulate progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setUploadProgress(progress)

      if (progress >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          setIsUploading(false)
          setUploadProgress(0)
          onUploadSuccess({
            title: "YouTube 영상",
            source: "YouTube",
            type: "video",
          })
        }, 500)
      }
    }, 300)
  }

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const file = e.target.files?.[0]

    if (!file) {
      return
    }

    // Check file size (max 1200MB for video, 64MB for audio)
    const maxVideoSize = 1200 * 1024 * 1024 // 1200MB in bytes
    const maxAudioSize = 64 * 1024 * 1024 // 64MB in bytes

    const isVideo = file.type.startsWith("video/")
    const isAudio = file.type.startsWith("audio/")

    if (isVideo && file.size > maxVideoSize) {
      setError("영상 파일은 최대 1,200MB까지 업로드 가능합니다.")
      return
    }

    if (isAudio && file.size > maxAudioSize) {
      setError("오디오 파일은 최대 64MB까지 업로드 가능합니다.")
      return
    }

    if (!isVideo && !isAudio) {
      setError("영상 또는 오디오 파일만 업로드 가능합니다.")
      return
    }

    // Simulate upload
    setIsUploading(true)

    // Simulate progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 5
      setUploadProgress(progress)

      if (progress >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          setIsUploading(false)
          setUploadProgress(0)
          onUploadSuccess({
            title: file.name,
            source: "로컬 파일",
            type: isVideo ? "video" : "audio",
          })
        }, 500)
      }
    }, 200)
  }

  return (
    <Tabs defaultValue="youtube" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="youtube">YouTube 영상</TabsTrigger>
        <TabsTrigger value="file">파일 업로드</TabsTrigger>
      </TabsList>

      <TabsContent value="youtube">
        <Card>
          <CardHeader>
            <CardTitle>YouTube 영상 가져오기</CardTitle>
            <CardDescription>학습하고 싶은 YouTube 영상의 URL을 입력하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleYoutubeSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="youtube-url">YouTube URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="youtube-url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      disabled={isUploading}
                    />
                    <Button type="submit" disabled={isUploading}>
                      {isUploading ? "처리 중..." : "가져오기"}
                    </Button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>오류</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {isUploading && (
                  <div className="space-y-2">
                    <div className="text-sm text-center">{uploadProgress}% 처리 중...</div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  <p>YouTube 영상을 가져오면 다음과 같은 작업이 자동으로 수행됩니다:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>영상 자막 추출 및 분석</li>
                    <li>학습 난이도 평가</li>
                    <li>주요 어휘 및 표현 식별</li>
                    <li>개인화된 학습 자료 생성</li>
                  </ul>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="file">
        <Card>
          <CardHeader>
            <CardTitle>파일 업로드</CardTitle>
            <CardDescription>로컬 영상 또는 오디오 파일을 업로드하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-6 text-center">
                <Upload className="w-12 h-12 mx-auto text-gray-400" />
                <p className="mt-2 text-sm text-muted-foreground">
                  영상 또는 오디오 파일을 드래그하거나 클릭하여 업로드하세요
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  영상: 최대 1,200MB, 16:9 비율 권장
                  <br />
                  오디오: 최대 64MB
                </p>
                <div className="mt-4">
                  <Input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept="video/*,audio/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  <Button onClick={() => document.getElementById("file-upload")?.click()} disabled={isUploading}>
                    {isUploading ? "업로드 중..." : "파일 선택"}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTitle>오류</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isUploading && (
                <div className="space-y-2">
                  <div className="text-sm text-center">{uploadProgress}% 업로드 중...</div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                <p>파일 업로드 후 다음과 같은 작업이 자동으로 수행됩니다:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>음성 인식을 통한 자막 생성</li>
                  <li>콘텐츠 분석 및 학습 자료 준비</li>
                  <li>개인화된 학습 경로 생성</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

export default MediaUploader

