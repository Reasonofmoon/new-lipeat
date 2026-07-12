import { describe, expect, it, test } from "vitest"
import { parseSrt, parseVtt, parseTxt, srtTimeToSeconds, vttTimeToSeconds } from "./parse"

describe("srtTimeToSeconds", () => {
  it("converts hh:mm:ss,mmm to seconds", () => {
    expect(srtTimeToSeconds("00:00:01,500")).toBe(1.5)
    expect(srtTimeToSeconds("01:02:03,250")).toBe(3723.25)
  })
})

describe("vttTimeToSeconds", () => {
  it("converts hh:mm:ss.mmm to seconds", () => {
    expect(vttTimeToSeconds("00:00:01.500")).toBe(1.5)
  })
})

describe("parseSrt", () => {
  it("parses a two-cue SRT file", () => {
    const srt = `1
00:00:01,000 --> 00:00:05,000
Hello world.

2
00:00:06,000 --> 00:00:10,000
Second line
continues here.`
    const result = parseSrt(srt)
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ id: "1", startTime: 1, endTime: 5, text: "Hello world." })
    expect(result[1].text).toBe("Second line continues here.")
  })

  it("skips malformed blocks", () => {
    expect(parseSrt("garbage without timing")).toHaveLength(0)
  })
})

describe("parseVtt", () => {
  it("parses cues after the WEBVTT header", () => {
    const vtt = `WEBVTT

00:00:01.000 --> 00:00:04.000
First cue.

00:00:05.000 --> 00:00:08.000
Second cue.`
    const result = parseVtt(vtt)
    expect(result).toHaveLength(2)
    expect(result[0].startTime).toBe(1)
    expect(result[0].text).toBe("First cue.")
  })

  // Known bug ME-10 (PRD appendix): a cue starting exactly at 00:00:00.000
  // loses its text because the accumulator guards on currentStartTime > 0.
  // Behavior is preserved in Phase 0; the fix lands in Phase 1.
  test.todo("keeps the text of a cue starting at 00:00:00.000 (ME-10, Phase 1)")
})

describe("parseTxt", () => {
  it("assigns 3-second windows per non-empty line", () => {
    const result = parseTxt("line one\n\nline two")
    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({ startTime: 0, endTime: 3, text: "line one" })
    expect(result[1]).toMatchObject({ startTime: 6, endTime: 9, text: "line two" })
  })
})
