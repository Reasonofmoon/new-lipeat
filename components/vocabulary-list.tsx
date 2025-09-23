"use client"

import { useState } from "react"
import { Search, SortAsc, Filter, BookOpen, Trash2, Plus, Volume2, Edit, Check, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { VocabularyItem } from "@/components/language-learning-app"
import { useToast } from "@/hooks/use-toast"

interface VocabularyListProps {
  vocabulary: VocabularyItem[]
  onVocabularyUpdate: (vocabulary: VocabularyItem[]) => void
  learningLanguage: string
  nativeLanguage: string
}

export function VocabularyList({
  vocabulary,
  onVocabularyUpdate,
  learningLanguage,
  nativeLanguage,
}: VocabularyListProps) {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")
  const [sortBy, setSortBy] = useState("alphabetical")
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editedItem, setEditedItem] = useState<VocabularyItem | null>(null)

  // Filter vocabulary based on search term and filter
  const filteredVocabulary = vocabulary.filter((item) => {
    const matchesSearch =
      item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translation.toLowerCase().includes(searchTerm.toLowerCase())

    if (filter === "all") return matchesSearch
    if (filter === "nouns" && item.partOfSpeech === "noun") return matchesSearch
    if (filter === "verbs" && item.partOfSpeech === "verb") return matchesSearch
    if (filter === "adjectives" && item.partOfSpeech === "adjective") return matchesSearch

    return matchesSearch
  })

  // Sort vocabulary
  const sortedVocabulary = [...filteredVocabulary].sort((a, b) => {
    if (sortBy === "alphabetical") return a.word.localeCompare(b.word)
    if (sortBy === "part-of-speech") return a.partOfSpeech.localeCompare(b.partOfSpeech)
    if (sortBy === "recently-added") return b.id.localeCompare(a.id)

    return 0
  })

  // Start editing an item
  const startEditing = (item: VocabularyItem) => {
    setEditingItemId(item.id)
    setEditedItem({ ...item })
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingItemId(null)
    setEditedItem(null)
  }

  // Save edited item
  const saveEditedItem = () => {
    if (!editedItem) return

    const updatedVocabulary = vocabulary.map((item) => (item.id === editedItem.id ? editedItem : item))

    onVocabularyUpdate(updatedVocabulary)
    setEditingItemId(null)
    setEditedItem(null)

    toast({
      title: "Vocabulary updated",
      description: `"${editedItem.word}" has been updated in your vocabulary list.`,
    })
  }

  // Delete vocabulary item
  const deleteVocabularyItem = (id: string) => {
    const itemToDelete = vocabulary.find((item) => item.id === id)
    if (!itemToDelete) return

    const updatedVocabulary = vocabulary.filter((item) => item.id !== id)
    onVocabularyUpdate(updatedVocabulary)

    toast({
      title: "Vocabulary deleted",
      description: `"${itemToDelete.word}" has been removed from your vocabulary list.`,
    })
  }

  // Add new vocabulary item
  const addNewVocabularyItem = () => {
    const newItem: VocabularyItem = {
      id: `vocab-${Date.now()}`,
      word: "New word",
      definition: "Definition",
      translation: "Translation",
      examples: ["Example sentence"],
      partOfSpeech: "noun",
    }

    onVocabularyUpdate([...vocabulary, newItem])
    startEditing(newItem)

    toast({
      title: "New vocabulary added",
      description: "A new vocabulary item has been added. Edit it now.",
    })
  }

  // Play pronunciation
  const playPronunciation = (word: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word)

      // Set language based on learning language
      switch (learningLanguage) {
        case "en":
          utterance.lang = "en-US"
          break
        case "es":
          utterance.lang = "es-ES"
          break
        case "fr":
          utterance.lang = "fr-FR"
          break
        case "de":
          utterance.lang = "de-DE"
          break
        case "ja":
          utterance.lang = "ja-JP"
          break
        case "ko":
          utterance.lang = "ko-KR"
          break
        case "zh":
          utterance.lang = "zh-CN"
          break
        default:
          utterance.lang = "en-US"
      }

      window.speechSynthesis.speak(utterance)

      toast({
        title: "Playing pronunciation",
        description: `Playing pronunciation for "${word}".`,
      })
    } else {
      toast({
        title: "Speech synthesis not supported",
        description: "Your browser does not support speech synthesis.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex-1 w-full">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vocabulary..."
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
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Words</SelectItem>
              <SelectItem value="nouns">Nouns</SelectItem>
              <SelectItem value="verbs">Verbs</SelectItem>
              <SelectItem value="adjectives">Adjectives</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SortAsc className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
              <SelectItem value="part-of-speech">Part of Speech</SelectItem>
              <SelectItem value="recently-added">Recently Added</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Vocabulary List ({vocabulary.length} words)</h2>
        <Button onClick={addNewVocabularyItem}>
          <Plus className="mr-2 h-4 w-4" />
          Add Word
        </Button>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {sortedVocabulary.length > 0 ? (
                sortedVocabulary.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      {editingItemId === item.id && editedItem ? (
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <div className="space-y-2 flex-1 mr-4">
                              <label className="text-sm font-medium">Word</label>
                              <Input
                                value={editedItem.word}
                                onChange={(e) => setEditedItem({ ...editedItem, word: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2 flex-1">
                              <label className="text-sm font-medium">Part of Speech</label>
                              <Select
                                value={editedItem.partOfSpeech}
                                onValueChange={(value) => setEditedItem({ ...editedItem, partOfSpeech: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="noun">Noun</SelectItem>
                                  <SelectItem value="verb">Verb</SelectItem>
                                  <SelectItem value="adjective">Adjective</SelectItem>
                                  <SelectItem value="adverb">Adverb</SelectItem>
                                  <SelectItem value="preposition">Preposition</SelectItem>
                                  <SelectItem value="conjunction">Conjunction</SelectItem>
                                  <SelectItem value="pronoun">Pronoun</SelectItem>
                                  <SelectItem value="interjection">Interjection</SelectItem>
                                  <SelectItem value="phrase">Phrase</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Definition</label>
                            <Input
                              value={editedItem.definition}
                              onChange={(e) => setEditedItem({ ...editedItem, definition: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Translation</label>
                            <Input
                              value={editedItem.translation}
                              onChange={(e) => setEditedItem({ ...editedItem, translation: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Examples</label>
                            {editedItem.examples.map((example, index) => (
                              <div key={index} className="flex gap-2">
                                <Input
                                  value={example}
                                  onChange={(e) => {
                                    const updatedExamples = [...editedItem.examples]
                                    updatedExamples[index] = e.target.value
                                    setEditedItem({ ...editedItem, examples: updatedExamples })
                                  }}
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const updatedExamples = [...editedItem.examples]
                                    updatedExamples.splice(index, 1)
                                    setEditedItem({ ...editedItem, examples: updatedExamples })
                                  }}
                                  disabled={editedItem.examples.length <= 1}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditedItem({
                                  ...editedItem,
                                  examples: [...editedItem.examples, ""],
                                })
                              }}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Example
                            </Button>
                          </div>

                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={cancelEditing}>
                              <X className="mr-2 h-4 w-4" />
                              Cancel
                            </Button>
                            <Button onClick={saveEditedItem}>
                              <Check className="mr-2 h-4 w-4" />
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center">
                                <h3 className="text-lg font-medium">{item.word}</h3>
                                <Badge variant="outline" className="ml-2">
                                  {item.partOfSpeech}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="ml-1"
                                  onClick={() => playPronunciation(item.word)}
                                >
                                  <Volume2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <p className="text-muted-foreground">{item.translation}</p>
                            </div>
                            <div className="flex items-center">
                              <Button variant="ghost" size="icon" onClick={() => startEditing(item)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => deleteVocabularyItem(item.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="mt-3">
                            <p className="text-sm">{item.definition}</p>
                          </div>

                          {item.examples.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium">Examples:</p>
                              <ul className="list-disc pl-5 mt-1 space-y-1 text-sm">
                                {item.examples.map((example, index) => (
                                  <li key={index}>{example}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">
                    {searchTerm ? "No matching vocabulary found." : "Your vocabulary list is empty."}
                  </p>
                  <Button className="mt-4" onClick={addNewVocabularyItem}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Word
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
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium">{item.word}</h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="ml-1"
                            onClick={() => playPronunciation(item.word)}
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center mt-1">
                          <Badge variant="outline">{item.partOfSpeech}</Badge>
                          <p className="text-sm text-muted-foreground ml-2">{item.translation}</p>
                        </div>
                      </div>
                      <div className="flex">
                        <Button variant="ghost" size="icon" onClick={() => startEditing(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteVocabularyItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-sm line-clamp-2">{item.definition}</p>
                    </div>

                    {item.examples.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground italic line-clamp-1">"{item.examples[0]}"</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  {searchTerm ? "No matching vocabulary found." : "Your vocabulary list is empty."}
                </p>
                <Button className="mt-4" onClick={addNewVocabularyItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Word
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

