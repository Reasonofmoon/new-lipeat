// Single source of truth for shadowing-module domain types.
// The LMS integration contract (userId/role props) is added in Phase 3.

export interface VideoInfo {
  videoId: string
  title: string
  thumbnailUrl: string
  channelTitle: string
}

export interface VocabEntry {
  id: string
  word: string
  definition: string
  translation: string
  examples: string[]
  partOfSpeech: string
}

export interface Subtitle {
  id: string
  startTime: number
  endTime: number
  text: string
  translation?: string
  notes?: string
  vocabularyItems?: VocabEntry[]
}
