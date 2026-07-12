import type { Subtitle } from "../../types"

/** Convert SRT time format (00:00:00,000) to seconds. */
export function srtTimeToSeconds(timeString: string): number {
  const [time, milliseconds] = timeString.split(",")
  const [hours, minutes, seconds] = time.split(":").map(Number)
  return hours * 3600 + minutes * 60 + seconds + Number(milliseconds) / 1000
}

/** Convert VTT time format (00:00:00.000) to seconds. */
export function vttTimeToSeconds(timeString: string): number {
  const [time, milliseconds] = timeString.split(".")
  const [hours, minutes, seconds] = time.split(":").map(Number)
  return hours * 3600 + minutes * 60 + seconds + Number(milliseconds) / 1000
}

export function parseSrt(content: string): Subtitle[] {
  const subtitles: Subtitle[] = []
  const blocks = content.trim().split(/\r?\n\r?\n/)

  for (const block of blocks) {
    const lines = block.split(/\r?\n/)
    if (lines.length < 3) continue

    const id = lines[0].trim()
    const timeRange = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/)
    if (!timeRange) continue

    subtitles.push({
      id,
      startTime: srtTimeToSeconds(timeRange[1]),
      endTime: srtTimeToSeconds(timeRange[2]),
      text: lines.slice(2).join(" "),
    })
  }

  return subtitles
}

export function parseVtt(content: string): Subtitle[] {
  const subtitles: Subtitle[] = []
  const lines = content.trim().split(/\r?\n/)

  let currentId = ""
  let currentStartTime = 0
  let currentEndTime = 0
  let currentText = ""
  let index = 0

  // Skip everything before the first cue timing line (WEBVTT header etc.)
  let i = 0
  while (i < lines.length && !lines[i].includes("-->")) {
    i++
  }

  for (; i < lines.length; i++) {
    const line = lines[i].trim()

    if (line === "") {
      if (currentText) {
        subtitles.push({
          id: currentId || String(index++),
          startTime: currentStartTime,
          endTime: currentEndTime,
          text: currentText.trim(),
        })
        currentText = ""
      }
    } else if (line.includes("-->")) {
      const timeRange = line.match(/(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/)
      if (timeRange) {
        currentStartTime = vttTimeToSeconds(timeRange[1])
        currentEndTime = vttTimeToSeconds(timeRange[2])
        currentId = String(index)
      }
    } else if (currentStartTime > 0) {
      // NOTE: drops text for cues starting at exactly 0 — known bug ME-10, fixed in Phase 1
      currentText += (currentText ? " " : "") + line
    }
  }

  if (currentText) {
    subtitles.push({
      id: currentId || String(index),
      startTime: currentStartTime,
      endTime: currentEndTime,
      text: currentText.trim(),
    })
  }

  return subtitles
}

/** Parse plain text: one subtitle per non-empty line, 3-second windows. */
export function parseTxt(content: string): Subtitle[] {
  const subtitles: Subtitle[] = []
  const lines = content.trim().split(/\r?\n/)
  const durationPerLine = 3

  lines.forEach((line, index) => {
    if (line.trim()) {
      const startTime = index * durationPerLine
      subtitles.push({
        id: String(index + 1),
        startTime,
        endTime: startTime + durationPerLine,
        text: line.trim(),
      })
    }
  })

  return subtitles
}
