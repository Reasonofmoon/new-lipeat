// Add YouTube IFrame API types
interface YT {
  Player: any
  PlayerState: {
    UNSTARTED: number
    ENDED: number
    PLAYING: number
    PAUSED: number
    BUFFERING: number
    CUED: number
  }
}

interface Window {
  YT: YT
  onYouTubeIframeAPIReady: () => void
}

