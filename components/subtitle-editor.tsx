"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  Save,
  Trash2,
  Plus,
  Languages,
  Loader2,
  Search,
  ArrowDown,
  ArrowUp,
  Merge,
  Scissors,
  Clock,
  Wand2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { SubtitleItem } from "@/components/language-learning-app"
import { useToast } from "@/hooks/use-toast"

interface SubtitleEditorProps {
  subtitles: SubtitleItem[]
  onSubtitlesUpdate: (subtitles: SubtitleItem[]) => void
  currentSubtitleIndex: number
  learningLanguage: string
  nativeLanguage: string
}

export function SubtitleEditor({
  subtitles,
  onSubtitlesUpdate,
  currentSubtitleIndex,
  learningLanguage,
  nativeLanguage,
}: SubtitleEditorProps) {
  const { toast } = useToast()
  const [editedSubtitles, setEditedSubtitles] = useState<SubtitleItem[]>([])
  const [selectedSubtitleIndex, setSelectedSubtitleIndex] = useState<number>(-1)
  const [isTranslating, setIsTranslating] = useState(false)
  const [isTranslatingAll, setIsTranslatingAll] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [replaceTerm, setReplaceTerm] = useState("")
  const [searchResults, setSearchResults] = useState<number[]>([])
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1)
  const [showSearchDialog, setShowSearchDialog] = useState(false)
  const [showSyncDialog, setShowSyncDialog] = useState(false)
  const [timeShift, setTimeShift] = useState(0)
  const [speedFactor, setSpeedFactor] = useState(100)
  const [syncStartTime, setSyncStartTime] = useState(0)
  const [showMergeDialog, setShowMergeDialog] = useState(false)
  const [showFixErrorsDialog, setShowFixErrorsDialog] = useState(false)
  const [fixErrorsOptions, setFixErrorsOptions] = useState({
    removeHI: true,
    fixCommonErrors: true,
    fixCapitalization: true,
    fixSpacing: true,
    removeLineBreaks: false,
  })

  const timelineRef = useRef<HTMLDivElement>(null)
  const timelineContainerRef = useRef<HTMLDivElement>(null)
  const [timelineScale, setTimelineScale] = useState(10) // pixels per second
  const [timelinePosition, setTimelinePosition] = useState(0) // current position in seconds
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartTime, setDragStartTime] = useState(0)
  const [showTimeline, setShowTimeline] = useState(true)

  // Initialize edited subtitles when subtitles change
  useEffect(() => {
    setEditedSubtitles([...subtitles])
  }, [subtitles])

  // Update selected subtitle when current subtitle changes
  useEffect(() => {
    if (currentSubtitleIndex >= 0 && currentSubtitleIndex < subtitles.length) {
      setSelectedSubtitleIndex(currentSubtitleIndex)

      // Update timeline position to show current subtitle
      if (showTimeline && editedSubtitles[currentSubtitleIndex]) {
        setTimelinePosition(editedSubtitles[currentSubtitleIndex].startTime)
      }
    }
  }, [currentSubtitleIndex, subtitles.length, editedSubtitles, showTimeline])

  // Handle subtitle text change
  const handleSubtitleTextChange = (index: number, text: string) => {
    const updatedSubtitles = [...editedSubtitles]
    updatedSubtitles[index] = {
      ...updatedSubtitles[index],
      text,
    }
    setEditedSubtitles(updatedSubtitles)
  }

  // Handle subtitle translation change
  const handleSubtitleTranslationChange = (index: number, translation: string) => {
    const updatedSubtitles = [...editedSubtitles]
    updatedSubtitles[index] = {
      ...updatedSubtitles[index],
      translation,
    }
    setEditedSubtitles(updatedSubtitles)
  }

  // Handle subtitle time change
  const handleSubtitleTimeChange = (index: number, startTime: number, endTime: number) => {
    const updatedSubtitles = [...editedSubtitles]
    updatedSubtitles[index] = {
      ...updatedSubtitles[index],
      startTime,
      endTime,
    }
    setEditedSubtitles(updatedSubtitles)
  }

  // Format time (seconds to MM:SS.SSS)
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    const milliseconds = Math.floor((timeInSeconds % 1) * 1000)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`
  }

  // Parse time (MM:SS.SSS to seconds)
  const parseTime = (timeString: string): number => {
    try {
      const [minutesSeconds, milliseconds] = timeString.split(".")
      const [minutes, seconds] = minutesSeconds.split(":").map(Number)
      return minutes * 60 + seconds + (milliseconds ? Number(milliseconds) / 1000 : 0)
    } catch (error) {
      return 0
    }
  }

  // Save changes
  const saveChanges = () => {
    onSubtitlesUpdate(editedSubtitles)
    toast({
      title: "Changes saved",
      description: "Your subtitle edits have been saved.",
    })
  }

  // Add new subtitle
  const addNewSubtitle = () => {
    // Find the last subtitle to determine new start time
    let newStartTime = 0
    let newEndTime = 3

    if (editedSubtitles.length > 0) {
      const lastSubtitle = editedSubtitles[editedSubtitles.length - 1]
      newStartTime = lastSubtitle.endTime + 0.5
      newEndTime = newStartTime + 3
    }

    const newSubtitle: SubtitleItem = {
      id: `new-${Date.now()}`,
      startTime: newStartTime,
      endTime: newEndTime,
      text: "New subtitle",
    }

    const updatedSubtitles = [...editedSubtitles, newSubtitle]
    setEditedSubtitles(updatedSubtitles)
    setSelectedSubtitleIndex(updatedSubtitles.length - 1)

    toast({
      title: "Subtitle added",
      description: "A new subtitle has been added. Edit it and save your changes.",
    })
  }

  // Delete subtitle
  const deleteSubtitle = (index: number) => {
    const updatedSubtitles = [...editedSubtitles]
    updatedSubtitles.splice(index, 1)
    setEditedSubtitles(updatedSubtitles)

    if (selectedSubtitleIndex === index) {
      setSelectedSubtitleIndex(-1)
    } else if (selectedSubtitleIndex > index) {
      setSelectedSubtitleIndex(selectedSubtitleIndex - 1)
    }

    toast({
      title: "Subtitle deleted",
      description: "The subtitle has been deleted. Save your changes to apply.",
    })
  }

  // Translate subtitle
  const translateSubtitle = async (index: number) => {
    if (index < 0 || index >= editedSubtitles.length) return

    const subtitle = editedSubtitles[index]
    if (!subtitle.text) return

    setIsTranslating(true)

    try {
      const response = await fetch("/api/gemini/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: subtitle.text,
          sourceLanguage: learningLanguage,
          targetLanguage: nativeLanguage,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to translate subtitle")
      }

      const data = await response.json()

      if (data.translation) {
        handleSubtitleTranslationChange(index, data.translation)
        toast({
          title: "Translation complete",
          description: "The subtitle has been translated.",
        })
      } else {
        throw new Error("No translation returned")
      }
    } catch (error) {
      console.error("Error translating subtitle:", error)
      toast({
        title: "Translation failed",
        description: "Failed to translate the subtitle. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsTranslating(false)
    }
  }

  // Translate all subtitles
  const translateAllSubtitles = async () => {
    setIsTranslatingAll(true)

    try {
      const textsToTranslate = editedSubtitles.map((subtitle) => subtitle.text)

      const response = await fetch("/api/gemini/translate-batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          texts: textsToTranslate,
          sourceLanguage: learningLanguage,
          targetLanguage: nativeLanguage,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to translate subtitles")
      }

      const data = await response.json()

      if (data.translations && Array.isArray(data.translations)) {
        const updatedSubtitles = editedSubtitles.map((subtitle, index) => ({
          ...subtitle,
          translation: data.translations[index] || subtitle.translation,
        }))

        setEditedSubtitles(updatedSubtitles)
        toast({
          title: "Translations complete",
          description: `${data.translations.length} subtitles have been translated.`,
        })
      } else {
        throw new Error("No translations returned")
      }
    } catch (error) {
      console.error("Error translating subtitles:", error)
      toast({
        title: "Translation failed",
        description: "Failed to translate all subtitles. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsTranslatingAll(false)
    }
  }

  // Search in subtitles
  const searchInSubtitles = () => {
    if (!searchTerm) {
      setSearchResults([])
      setCurrentSearchIndex(-1)
      return
    }

    const results = editedSubtitles
      .map((subtitle, index) => {
        if (subtitle.text.toLowerCase().includes(searchTerm.toLowerCase())) {
          return index
        }
        return -1
      })
      .filter((index) => index !== -1)

    setSearchResults(results)
    setCurrentSearchIndex(results.length > 0 ? 0 : -1)

    if (results.length > 0) {
      setSelectedSubtitleIndex(results[0])
    } else {
      toast({
        title: "No results found",
        description: `No subtitles containing "${searchTerm}" were found.`,
      })
    }
  }

  // Navigate to next search result
  const goToNextSearchResult = () => {
    if (searchResults.length === 0) return

    const nextIndex = (currentSearchIndex + 1) % searchResults.length
    setCurrentSearchIndex(nextIndex)
    setSelectedSubtitleIndex(searchResults[nextIndex])
  }

  // Navigate to previous search result
  const goToPrevSearchResult = () => {
    if (searchResults.length === 0) return

    const prevIndex = (currentSearchIndex - 1 + searchResults.length) % searchResults.length
    setCurrentSearchIndex(prevIndex)
    setSelectedSubtitleIndex(searchResults[prevIndex])
  }

  // Replace all occurrences of search term
  const replaceAll = () => {
    if (!searchTerm) return

    const updatedSubtitles = editedSubtitles.map((subtitle) => ({
      ...subtitle,
      text: subtitle.text.replace(new RegExp(searchTerm, "gi"), replaceTerm),
    }))

    setEditedSubtitles(updatedSubtitles)
    setShowSearchDialog(false)

    toast({
      title: "Replace complete",
      description: `All occurrences of "${searchTerm}" have been replaced with "${replaceTerm}".`,
    })
  }

  // Apply time shift to all subtitles
  const applyTimeShift = () => {
    const updatedSubtitles = editedSubtitles.map((subtitle) => ({
      ...subtitle,
      startTime: Math.max(0, subtitle.startTime + timeShift),
      endTime: Math.max(0, subtitle.endTime + timeShift),
    }))

    setEditedSubtitles(updatedSubtitles)
    setShowSyncDialog(false)

    toast({
      title: "Time shift applied",
      description: `All subtitles have been shifted by ${timeShift > 0 ? "+" : ""}${timeShift} seconds.`,
    })
  }

  // Apply speed adjustment to all subtitles
  const applySpeedAdjustment = () => {
    const factor = speedFactor / 100

    const updatedSubtitles = editedSubtitles.map((subtitle) => {
      // Calculate new times relative to sync start time
      const relativeStart = subtitle.startTime - syncStartTime
      const relativeEnd = subtitle.endTime - syncStartTime

      // Apply speed factor
      const newRelativeStart = relativeStart * factor
      const newRelativeEnd = relativeEnd * factor

      // Convert back to absolute time
      return {
        ...subtitle,
        startTime: Math.max(0, syncStartTime + newRelativeStart),
        endTime: Math.max(0, syncStartTime + newRelativeEnd),
      }
    })

    setEditedSubtitles(updatedSubtitles)
    setShowSyncDialog(false)

    toast({
      title: "Speed adjustment applied",
      description: `Subtitle timing has been adjusted to ${speedFactor}% of original speed.`,
    })
  }

  // Merge selected subtitles
  const mergeSubtitles = () => {
    if (selectedSubtitleIndex < 0 || selectedSubtitleIndex >= editedSubtitles.length - 1) {
      toast({
        title: "Cannot merge",
        description: "Please select a subtitle to merge with the next one.",
        variant: "destructive",
      })
      return
    }

    const current = editedSubtitles[selectedSubtitleIndex]
    const next = editedSubtitles[selectedSubtitleIndex + 1]

    const mergedSubtitle: SubtitleItem = {
      ...current,
      text: `${current.text} ${next.text}`,
      endTime: next.endTime,
      translation:
        current.translation && next.translation
          ? `${current.translation} ${next.translation}`
          : current.translation || next.translation,
    }

    const updatedSubtitles = [...editedSubtitles]
    updatedSubtitles.splice(selectedSubtitleIndex, 2, mergedSubtitle)

    setEditedSubtitles(updatedSubtitles)
    setShowMergeDialog(false)

    toast({
      title: "Subtitles merged",
      description: "The selected subtitle has been merged with the next one.",
    })
  }

  // Split subtitle at cursor position
  const splitSubtitle = (text: string, position: number) => {
    if (selectedSubtitleIndex < 0 || selectedSubtitleIndex >= editedSubtitles.length) {
      return
    }

    const subtitle = editedSubtitles[selectedSubtitleIndex]

    // Split the text
    const firstPart = text.substring(0, position).trim()
    const secondPart = text.substring(position).trim()

    if (!firstPart || !secondPart) {
      toast({
        title: "Cannot split",
        description: "Please position the cursor where you want to split the text.",
        variant: "destructive",
      })
      return
    }

    // Calculate the time for the split point
    const totalDuration = subtitle.endTime - subtitle.startTime
    const splitRatio = position / text.length
    const splitTime = subtitle.startTime + totalDuration * splitRatio

    // Create two new subtitles
    const firstSubtitle: SubtitleItem = {
      ...subtitle,
      text: firstPart,
      endTime: splitTime,
    }

    const secondSubtitle: SubtitleItem = {
      id: `split-${Date.now()}`,
      startTime: splitTime,
      endTime: subtitle.endTime,
      text: secondPart,
    }

    // Update the subtitles array
    const updatedSubtitles = [...editedSubtitles]
    updatedSubtitles.splice(selectedSubtitleIndex, 1, firstSubtitle, secondSubtitle)

    setEditedSubtitles(updatedSubtitles)

    toast({
      title: "Subtitle split",
      description: "The subtitle has been split into two parts.",
    })
  }

  // Fix common errors in subtitles
  const fixErrors = () => {
    let updatedSubtitles = [...editedSubtitles]

    // Remove hearing impaired text
    if (fixErrorsOptions.removeHI) {
      updatedSubtitles = updatedSubtitles.map((subtitle) => ({
        ...subtitle,
        text: subtitle.text
          .replace(/\[.*?\]/g, "") // Remove text in square brackets
          .replace(/$$.*?$$/g, "") // Remove text in parentheses
          .replace(/^- /, "") // Remove leading dash with space
          .replace(/^\s*>\s*/, "") // Remove leading '>'
          .replace(/^\s*<\s*/, "") // Remove leading '<'
          .trim(),
      }))
    }

    // Fix common errors
    if (fixErrorsOptions.fixCommonErrors) {
      updatedSubtitles = updatedSubtitles.map((subtitle) => ({
        ...subtitle,
        text: subtitle.text
          .replace(/\s{2,}/g, " ") // Replace multiple spaces with a single space
          .replace(/\.\.\./g, "…") // Replace three dots with ellipsis character
          .replace(/--/g, "—") // Replace double dash with em dash
          .replace(/\s+([.,!?:;])/g, "$1") // Remove space before punctuation
          .trim(),
      }))
    }

    // Fix capitalization
    if (fixErrorsOptions.fixCapitalization) {
      updatedSubtitles = updatedSubtitles.map((subtitle) => ({
        ...subtitle,
        text: subtitle.text
          .replace(/^([a-z])/, (match) => match.toUpperCase()) // Capitalize first letter of subtitle
          .replace(/([.!?]\s+)([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase()) // Capitalize after sentence end
          .trim(),
      }))
    }

    // Fix spacing
    if (fixErrorsOptions.fixSpacing) {
      updatedSubtitles = updatedSubtitles.map((subtitle) => ({
        ...subtitle,
        text: subtitle.text
          .replace(/([.,!?:;])([^\s])/g, "$1 $2") // Add space after punctuation if missing
          .replace(/\s+/g, " ") // Normalize spaces
          .trim(),
      }))
    }

    // Remove line breaks
    if (fixErrorsOptions.removeLineBreaks) {
      updatedSubtitles = updatedSubtitles.map((subtitle) => ({
        ...subtitle,
        text: subtitle.text.replace(/\n/g, " ").replace(/\r/g, "").replace(/\s+/g, " ").trim(),
      }))
    }

    setEditedSubtitles(updatedSubtitles)
    setShowFixErrorsDialog(false)

    toast({
      title: "Errors fixed",
      description: "Common subtitle errors have been fixed.",
    })
  }

  // Timeline functions
  const handleTimelineScroll = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // Zoom in/out with Ctrl+Wheel
      e.preventDefault()
      const newScale = Math.max(5, Math.min(50, timelineScale + (e.deltaY > 0 ? -1 : 1)))
      setTimelineScale(newScale)
    } else {
      // Scroll horizontally
      if (timelineContainerRef.current) {
        timelineContainerRef.current.scrollLeft += e.deltaY
      }
    }
  }

  const handleTimelineMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStartX(e.clientX)
    setDragStartTime(timelinePosition)
  }

  const handleTimelineMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - dragStartX
    const deltaTime = deltaX / timelineScale

    setTimelinePosition(Math.max(0, dragStartTime - deltaTime))
  }

  const handleTimelineMouseUp = () => {
    setIsDragging(false)
  }

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return

    const rect = timelineRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left

    const clickTime = clickX / timelineScale
    setTimelinePosition(clickTime)

    // Find subtitle at this time
    const subtitleIndex = editedSubtitles.findIndex(
      (subtitle) => clickTime >= subtitle.startTime && clickTime <= subtitle.endTime,
    )

    if (subtitleIndex !== -1) {
      setSelectedSubtitleIndex(subtitleIndex)
    }
  }

  const renderTimelineMarkers = () => {
    if (!editedSubtitles.length) return null

    // Find the total duration of all subtitles
    const lastSubtitle = editedSubtitles[editedSubtitles.length - 1]
    const totalDuration = lastSubtitle.endTime

    // Create markers every 10 seconds
    const markers = []
    const markerInterval = 10 // seconds

    for (let time = 0; time <= totalDuration; time += markerInterval) {
      markers.push(
        <div
          key={time}
          className="absolute top-0 h-full border-l border-gray-300 dark:border-gray-700"
          style={{ left: `${time * timelineScale}px` }}
        >
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-1">{formatTime(time).split(".")[0]}</div>
        </div>,
      )
    }

    return markers
  }

  const renderTimelineSubtitles = () => {
    return editedSubtitles.map((subtitle, index) => (
      <div
        key={subtitle.id}
        className={`absolute h-8 rounded-md cursor-pointer transition-colors ${
          selectedSubtitleIndex === index ? "bg-primary/60 border border-primary" : "bg-primary/20 hover:bg-primary/40"
        }`}
        style={{
          left: `${subtitle.startTime * timelineScale}px`,
          width: `${(subtitle.endTime - subtitle.startTime) * timelineScale}px`,
          top: "24px",
        }}
        onClick={() => setSelectedSubtitleIndex(index)}
        title={subtitle.text}
      >
        <div className="text-xs truncate p-1 h-full flex items-center">{subtitle.text}</div>
      </div>
    ))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Subtitle List</span>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => setShowSearchDialog(true)}>
                  <Search className="h-4 w-4 mr-1" />
                  Search
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowSyncDialog(true)}>
                  <Clock className="h-4 w-4 mr-1" />
                  Sync
                </Button>
              </div>
            </CardTitle>
            <CardDescription>Select a subtitle to edit its content and timing.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <Button onClick={addNewSubtitle}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Subtitle
                </Button>
                <Button
                  variant="outline"
                  onClick={translateAllSubtitles}
                  disabled={isTranslatingAll || editedSubtitles.length === 0}
                >
                  {isTranslatingAll ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Translating...
                    </>
                  ) : (
                    <>
                      <Languages className="mr-2 h-4 w-4" />
                      Translate All
                    </>
                  )}
                </Button>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setShowMergeDialog(true)}>
                  <Merge className="mr-2 h-4 w-4" />
                  Merge
                </Button>
                <Button variant="outline" onClick={() => setShowFixErrorsDialog(true)}>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Fix Errors
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="timeline-toggle" checked={showTimeline} onCheckedChange={setShowTimeline} />
                <Label htmlFor="timeline-toggle">Show Timeline</Label>
              </div>

              {showTimeline && (
                <div
                  ref={timelineContainerRef}
                  className="border rounded-md overflow-x-auto"
                  onWheel={handleTimelineScroll}
                >
                  <div
                    ref={timelineRef}
                    className="relative h-16 min-w-full"
                    style={{
                      width: `${editedSubtitles.length ? editedSubtitles[editedSubtitles.length - 1].endTime * timelineScale + 100 : 1000}px`,
                    }}
                    onMouseDown={handleTimelineMouseDown}
                    onMouseMove={handleTimelineMouseMove}
                    onMouseUp={handleTimelineMouseUp}
                    onMouseLeave={handleTimelineMouseUp}
                    onClick={handleTimelineClick}
                  >
                    {renderTimelineMarkers()}
                    {renderTimelineSubtitles()}

                    {/* Current position indicator */}
                    <div
                      className="absolute top-0 h-full border-l-2 border-red-500 z-10"
                      style={{ left: `${timelinePosition * timelineScale}px` }}
                    >
                      <div className="bg-red-500 text-white text-xs px-1 rounded">
                        {formatTime(timelinePosition).split(".")[0]}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {editedSubtitles.map((subtitle, index) => (
                    <div
                      key={subtitle.id}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        selectedSubtitleIndex === index ? "bg-primary/20 border-l-4 border-primary" : "hover:bg-muted"
                      }`}
                      onClick={() => setSelectedSubtitleIndex(index)}
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
                              deleteSubtitle(index)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm truncate">{subtitle.text}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={saveChanges} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Save All Changes
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="lg:col-span-2">
        {selectedSubtitleIndex >= 0 && selectedSubtitleIndex < editedSubtitles.length ? (
          <Card>
            <CardHeader>
              <CardTitle>Edit Subtitle</CardTitle>
              <CardDescription>Edit the content and timing of the selected subtitle.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Start Time</label>
                    <Input
                      value={formatTime(editedSubtitles[selectedSubtitleIndex].startTime)}
                      onChange={(e) => {
                        const startTime = parseTime(e.target.value)
                        handleSubtitleTimeChange(
                          selectedSubtitleIndex,
                          startTime,
                          editedSubtitles[selectedSubtitleIndex].endTime,
                        )
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">End Time</label>
                    <Input
                      value={formatTime(editedSubtitles[selectedSubtitleIndex].endTime)}
                      onChange={(e) => {
                        const endTime = parseTime(e.target.value)
                        handleSubtitleTimeChange(
                          selectedSubtitleIndex,
                          editedSubtitles[selectedSubtitleIndex].startTime,
                          endTime,
                        )
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Subtitle Text</label>
                  <Textarea
                    value={editedSubtitles[selectedSubtitleIndex].text}
                    onChange={(e) => handleSubtitleTextChange(selectedSubtitleIndex, e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end mt-2 space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const textarea = document.querySelector("textarea") as HTMLTextAreaElement
                        if (textarea && textarea.selectionStart !== textarea.selectionEnd) {
                          splitSubtitle(editedSubtitles[selectedSubtitleIndex].text, textarea.selectionStart)
                        } else {
                          toast({
                            title: "No text selected",
                            description: "Please select where to split the subtitle text.",
                            variant: "destructive",
                          })
                        }
                      }}
                    >
                      <Scissors className="mr-2 h-4 w-4" />
                      Split at Cursor
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Translation</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => translateSubtitle(selectedSubtitleIndex)}
                    disabled={isTranslating}
                  >
                    {isTranslating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Translating...
                      </>
                    ) : (
                      <>
                        <Languages className="mr-2 h-4 w-4" />
                        Translate
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  value={editedSubtitles[selectedSubtitleIndex].translation || ""}
                  onChange={(e) => handleSubtitleTranslationChange(selectedSubtitleIndex, e.target.value)}
                  rows={3}
                  placeholder="Translation will appear here"
                />

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (selectedSubtitleIndex > 0) {
                        setSelectedSubtitleIndex(selectedSubtitleIndex - 1)
                      }
                    }}
                    disabled={selectedSubtitleIndex <= 0}
                  >
                    <ArrowUp className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  <Button onClick={saveChanges}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (selectedSubtitleIndex < editedSubtitles.length - 1) {
                        setSelectedSubtitleIndex(selectedSubtitleIndex + 1)
                      }
                    }}
                    disabled={selectedSubtitleIndex >= editedSubtitles.length - 1}
                  >
                    <ArrowDown className="mr-2 h-4 w-4" />
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                Select a subtitle from the list to edit it, or add a new subtitle.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Search and Replace Dialog */}
      <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Search and Replace</DialogTitle>
            <DialogDescription>Search for text in subtitles and optionally replace it.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search for</label>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter search term"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Replace with</label>
              <Input
                value={replaceTerm}
                onChange={(e) => setReplaceTerm(e.target.value)}
                placeholder="Enter replacement text (optional)"
              />
            </div>
            <div className="flex justify-between">
              <div className="space-x-2">
                <Button variant="outline" onClick={searchInSubtitles} disabled={!searchTerm}>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
                {searchResults.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {currentSearchIndex + 1} of {searchResults.length} results
                  </span>
                )}
              </div>
              <div className="space-x-2">
                <Button variant="outline" onClick={goToPrevSearchResult} disabled={searchResults.length === 0}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={goToNextSearchResult} disabled={searchResults.length === 0}>
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSearchDialog(false)}>
              Cancel
            </Button>
            <Button onClick={replaceAll} disabled={!searchTerm || !replaceTerm}>
              Replace All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sync Dialog */}
      <Dialog open={showSyncDialog} onOpenChange={setShowSyncDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Synchronize Subtitles</DialogTitle>
            <DialogDescription>Adjust timing of all subtitles.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Shift (seconds)</label>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" onClick={() => setTimeShift(timeShift - 0.5)}>
                  -0.5
                </Button>
                <Input
                  type="number"
                  step="0.1"
                  value={timeShift}
                  onChange={(e) => setTimeShift(Number.parseFloat(e.target.value) || 0)}
                />
                <Button variant="outline" size="sm" onClick={() => setTimeShift(timeShift + 0.5)}>
                  +0.5
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Positive values delay subtitles, negative values make them appear earlier.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Speed Adjustment (%)</label>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" onClick={() => setSpeedFactor(Math.max(50, speedFactor - 5))}>
                  -5%
                </Button>
                <Input
                  type="number"
                  min="50"
                  max="200"
                  value={speedFactor}
                  onChange={(e) => setSpeedFactor(Number.parseInt(e.target.value) || 100)}
                />
                <Button variant="outline" size="sm" onClick={() => setSpeedFactor(Math.min(200, speedFactor + 5))}>
                  +5%
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                100% is original speed. Lower values stretch subtitles, higher values compress them.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sync Start Time (seconds)</label>
              <Input
                type="number"
                step="0.1"
                min="0"
                value={syncStartTime}
                onChange={(e) => setSyncStartTime(Number.parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Reference point for speed adjustment. Usually 0 for the beginning of the video.
              </p>
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setShowSyncDialog(false)}>
              Cancel
            </Button>
            <div className="space-x-2">
              <Button onClick={applyTimeShift}>Apply Time Shift</Button>
              <Button onClick={applySpeedAdjustment}>Apply Speed Adjustment</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Merge Dialog */}
      <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Merge Subtitles</DialogTitle>
            <DialogDescription>Merge the selected subtitle with the next one.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedSubtitleIndex >= 0 && selectedSubtitleIndex < editedSubtitles.length - 1 ? (
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium">Current Subtitle:</p>
                  <p className="text-sm">{editedSubtitles[selectedSubtitleIndex].text}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTime(editedSubtitles[selectedSubtitleIndex].startTime)} -{" "}
                    {formatTime(editedSubtitles[selectedSubtitleIndex].endTime)}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium">Next Subtitle:</p>
                  <p className="text-sm">{editedSubtitles[selectedSubtitleIndex + 1].text}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTime(editedSubtitles[selectedSubtitleIndex + 1].startTime)} -{" "}
                    {formatTime(editedSubtitles[selectedSubtitleIndex + 1].endTime)}
                  </p>
                </div>
                <div className="p-3 bg-primary/20 rounded-md">
                  <p className="text-sm font-medium">Result:</p>
                  <p className="text-sm">
                    {editedSubtitles[selectedSubtitleIndex].text} {editedSubtitles[selectedSubtitleIndex + 1].text}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTime(editedSubtitles[selectedSubtitleIndex].startTime)} -{" "}
                    {formatTime(editedSubtitles[selectedSubtitleIndex + 1].endTime)}
                  </p>
                </div>
              </div>
            ) : (
              <Alert>
                <AlertTitle>Cannot merge</AlertTitle>
                <AlertDescription>Please select a subtitle that has a next subtitle to merge with.</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMergeDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={mergeSubtitles}
              disabled={!(selectedSubtitleIndex >= 0 && selectedSubtitleIndex < editedSubtitles.length - 1)}
            >
              <Merge className="mr-2 h-4 w-4" />
              Merge Subtitles
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fix Errors Dialog */}
      <Dialog open={showFixErrorsDialog} onOpenChange={setShowFixErrorsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Fix Common Errors</DialogTitle>
            <DialogDescription>Select the types of errors you want to fix in all subtitles.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="remove-hi"
                checked={fixErrorsOptions.removeHI}
                onCheckedChange={(checked) => setFixErrorsOptions({ ...fixErrorsOptions, removeHI: checked })}
              />
              <Label htmlFor="remove-hi">Remove hearing impaired text (text in brackets, parentheses)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="fix-common-errors"
                checked={fixErrorsOptions.fixCommonErrors}
                onCheckedChange={(checked) => setFixErrorsOptions({ ...fixErrorsOptions, fixCommonErrors: checked })}
              />
              <Label htmlFor="fix-common-errors">Fix common errors (multiple spaces, dots, dashes)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="fix-capitalization"
                checked={fixErrorsOptions.fixCapitalization}
                onCheckedChange={(checked) => setFixErrorsOptions({ ...fixErrorsOptions, fixCapitalization: checked })}
              />
              <Label htmlFor="fix-capitalization">Fix capitalization (first letter, after periods)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="fix-spacing"
                checked={fixErrorsOptions.fixSpacing}
                onCheckedChange={(checked) => setFixErrorsOptions({ ...fixErrorsOptions, fixSpacing: checked })}
              />
              <Label htmlFor="fix-spacing">Fix spacing (around punctuation)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="remove-line-breaks"
                checked={fixErrorsOptions.removeLineBreaks}
                onCheckedChange={(checked) => setFixErrorsOptions({ ...fixErrorsOptions, removeLineBreaks: checked })}
              />
              <Label htmlFor="remove-line-breaks">Remove line breaks</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFixErrorsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={fixErrors}>
              <Wand2 className="mr-2 h-4 w-4" />
              Fix Errors
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

