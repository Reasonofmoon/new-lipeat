type ServerEnvKey = "GEMINI_API_KEY" | "YOUTUBE_API_KEY"

const warned = new Set<ServerEnvKey>()

/** Read a server-side env var, warning once per process when it is missing. */
export function getServerEnv(key: ServerEnvKey): string | undefined {
  const value = process.env[key]
  if (!value && !warned.has(key)) {
    warned.add(key)
    console.warn(`[env] ${key} is not set — related features will not work. See .env.example`)
  }
  return value
}
