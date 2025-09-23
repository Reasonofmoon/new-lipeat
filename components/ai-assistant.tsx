"use client"

import { useState } from "react"
import { Brain, MessageSquare, Languages, BookOpen, Loader2, Send } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

interface AIAssistantProps {
  currentText?: string
  learningLanguage: string
  nativeLanguage: string
}

export function AIAssistant({ currentText = "", learningLanguage, nativeLanguage }: AIAssistantProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("explain")
  const [userInput, setUserInput] = useState("")
  const [response, setResponse] = useState("")

  // Predefined prompts
  const explainPrompt = `다음 텍스트를 자세히 설명해주세요: "${currentText}". 문법 설명과 문화적 맥락이 있다면 함께 설명해주세요.`
  const translatePrompt = `다음 텍스트를 ${learningLanguage}에서 ${nativeLanguage}로 번역해주세요: "${currentText}". 가능하면 단어별 분석도 제공해주세요.`
  const alternativePrompt = `다음 표현을 ${learningLanguage}로 3-5가지 다른 방식으로 표현해주세요: "${currentText}". 가능하면 공식적인 표현과 비공식적인 표현을 모두 포함해주세요.`

  // Handle predefined prompt
  const handlePredefinedPrompt = async (prompt: string) => {
    if (!currentText) {
      toast({
        title: "텍스트 없음",
        description: "분석할 텍스트가 없습니다.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setResponse("응답 생성 중...")

    try {
      // Request summary from Lilys AI
      const requestResponse = await fetch("/api/lilys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceType: "text",
          transcript: prompt,
          resultLanguage: nativeLanguage,
          modelType: "gpt-3.5",
        }),
      })

      if (!requestResponse.ok) {
        throw new Error("Failed to request summary")
      }

      const { requestId } = await requestResponse.json()

      // Poll for results
      let result = null
      let attempts = 0
      const maxAttempts = 30 // 5 minutes max (10 seconds * 30)

      while (!result && attempts < maxAttempts) {
        attempts++
        await new Promise((resolve) => setTimeout(resolve, 3000)) // Wait 3 seconds between polls

        const pollResponse = await fetch(`/api/lilys/summary?requestId=${requestId}&resultType=rawScript`)

        if (!pollResponse.ok) {
          continue
        }

        const data = await pollResponse.json()

        if ("status" in data && data.status === "pending") {
          // Still processing
          continue
        }

        if ("type" in data && data.type === "rawScript") {
          result = data.data.rawScript
          break
        }
      }

      if (result) {
        setResponse(result)
      } else {
        throw new Error("Failed to get response after multiple attempts")
      }
    } catch (error) {
      console.error("Error getting AI response:", error)
      setResponse("죄송합니다, 응답을 생성하는 중 오류가 발생했습니다. 나중에 다시 시도해주세요.")
      toast({
        title: "오류 발생",
        description: "AI 응답을 가져오는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle custom prompt
  const handleCustomPrompt = async () => {
    if (!userInput.trim()) {
      toast({
        title: "입력 없음",
        description: "질문을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setResponse("응답 생성 중...")

    try {
      // Request summary from Lilys AI
      const requestResponse = await fetch("/api/lilys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceType: "text",
          transcript: userInput,
          resultLanguage: nativeLanguage,
          modelType: "gpt-3.5",
        }),
      })

      if (!requestResponse.ok) {
        throw new Error("Failed to request summary")
      }

      const { requestId } = await requestResponse.json()

      // Poll for results
      let result = null
      let attempts = 0
      const maxAttempts = 30 // 5 minutes max (10 seconds * 30)

      while (!result && attempts < maxAttempts) {
        attempts++
        await new Promise((resolve) => setTimeout(resolve, 3000)) // Wait 3 seconds between polls

        const pollResponse = await fetch(`/api/lilys/summary?requestId=${requestId}&resultType=rawScript`)

        if (!pollResponse.ok) {
          continue
        }

        const data = await pollResponse.json()

        if ("status" in data && data.status === "pending") {
          // Still processing
          continue
        }

        if ("type" in data && data.type === "rawScript") {
          result = data.data.rawScript
          break
        }
      }

      if (result) {
        setResponse(result)
      } else {
        throw new Error("Failed to get response after multiple attempts")
      }
    } catch (error) {
      console.error("Error getting AI response:", error)
      setResponse("죄송합니다, 응답을 생성하는 중 오류가 발생했습니다. 나중에 다시 시도해주세요.")
      toast({
        title: "오류 발생",
        description: "AI 응답을 가져오는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="mr-2 h-5 w-5 text-primary" />
          AI 학습 어시스턴트
        </CardTitle>
        <CardDescription>언어 학습을 도와주는 AI 어시스턴트입니다. 질문하거나 도움을 요청하세요.</CardDescription>
      </CardHeader>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-6">
          <TabsTrigger value="explain">
            <MessageSquare className="h-4 w-4 mr-2" />
            설명
          </TabsTrigger>
          <TabsTrigger value="translate">
            <Languages className="h-4 w-4 mr-2" />
            번역
          </TabsTrigger>
          <TabsTrigger value="alternative">
            <BookOpen className="h-4 w-4 mr-2" />
            대체 표현
          </TabsTrigger>
          <TabsTrigger value="custom">
            <MessageSquare className="h-4 w-4 mr-2" />
            질문하기
          </TabsTrigger>
        </TabsList>

        <CardContent className="flex-1 flex flex-col p-6 pt-2">
          <TabsContent value="explain" className="flex-1 flex flex-col mt-0">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                현재 텍스트에 대한 자세한 설명을 제공합니다. 문법, 어휘, 문화적 맥락 등을 포함합니다.
              </p>
            </div>
            <Button
              onClick={() => handlePredefinedPrompt(explainPrompt)}
              disabled={isLoading || !currentText}
              className="mb-4"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <MessageSquare className="mr-2 h-4 w-4" />
              )}
              설명 요청하기
            </Button>
            <ScrollArea className="flex-1 border rounded-md p-4 bg-muted/30">
              {response ? (
                <div className="whitespace-pre-wrap">{response}</div>
              ) : (
                <div className="text-muted-foreground text-center py-8">설명을 요청하면 여기에 표시됩니다.</div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="translate" className="flex-1 flex flex-col mt-0">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">현재 텍스트를 번역하고 단어별 분석을 제공합니다.</p>
            </div>
            <Button
              onClick={() => handlePredefinedPrompt(translatePrompt)}
              disabled={isLoading || !currentText}
              className="mb-4"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Languages className="mr-2 h-4 w-4" />}
              번역 요청하기
            </Button>
            <ScrollArea className="flex-1 border rounded-md p-4 bg-muted/30">
              {response ? (
                <div className="whitespace-pre-wrap">{response}</div>
              ) : (
                <div className="text-muted-foreground text-center py-8">번역을 요청하면 여기에 표시됩니다.</div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="alternative" className="flex-1 flex flex-col mt-0">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                현재 표현의 다양한 대체 표현을 제공합니다. 공식적/비공식적 표현을 모두 포함합니다.
              </p>
            </div>
            <Button
              onClick={() => handlePredefinedPrompt(alternativePrompt)}
              disabled={isLoading || !currentText}
              className="mb-4"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookOpen className="mr-2 h-4 w-4" />}
              대체 표현 요청하기
            </Button>
            <ScrollArea className="flex-1 border rounded-md p-4 bg-muted/30">
              {response ? (
                <div className="whitespace-pre-wrap">{response}</div>
              ) : (
                <div className="text-muted-foreground text-center py-8">대체 표현을 요청하면 여기에 표시됩니다.</div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="custom" className="flex-1 flex flex-col mt-0">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">언어 학습에 관한 질문을 자유롭게 물어보세요.</p>
            </div>
            <div className="flex gap-2 mb-4">
              <Textarea
                placeholder="질문을 입력하세요..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleCustomPrompt} disabled={isLoading || !userInput.trim()} className="self-end">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                전송
              </Button>
            </div>
            <ScrollArea className="flex-1 border rounded-md p-4 bg-muted/30">
              {response ? (
                <div className="whitespace-pre-wrap">{response}</div>
              ) : (
                <div className="text-muted-foreground text-center py-8">
                  질문을 입력하고 전송하면 응답이 여기에 표시됩니다.
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </CardContent>
      </Tabs>
      <CardFooter className="border-t p-4">
        <p className="text-xs text-muted-foreground">
          Lilys AI API를 사용하여 언어 학습을 지원합니다. 자세한 내용은{" "}
          <a href="https://tool.lilys.ai" className="underline" target="_blank" rel="noopener noreferrer">
            Lilys AI
          </a>
          를 참조하세요.
        </p>
      </CardFooter>
    </Card>
  )
}

