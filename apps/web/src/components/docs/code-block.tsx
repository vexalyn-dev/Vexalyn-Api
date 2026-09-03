import { cn } from "@/lib/utils"
import { Copy, Check } from "lucide-react"
import { useState } from "react"

const LANGUAGES = ["curl", "javascript", "typescript", "python", "php"] as const
export type Language = (typeof LANGUAGES)[number]

const languageLabels: Record<Language, string> = {
  curl: "cURL",
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  php: "PHP",
}

interface CodeExample {
  curl: string
  javascript: string
  typescript: string
  python: string
  php: string
}

interface CodeBlockProps {
  title?: string
  language?: Language
  onLanguageChange?: (lang: Language) => void
  examples: CodeExample
  filename?: string
}

export function CodeBlock({
  title,
  language: initialLang,
  onLanguageChange,
  examples,
  filename,
}: CodeBlockProps) {
  const [activeLang, setActiveLang] = useState<Language>(initialLang ?? "curl")
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(examples[activeLang])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleLangChange(lang: Language) {
    setActiveLang(lang)
    onLanguageChange?.(lang)
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {title && (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary">
          <div className="flex items-center gap-2">
            {filename && (
              <span className="text-xs font-mono text-muted-foreground">{filename}</span>
            )}
            {title && (
              <span className="text-sm font-medium text-foreground">{title}</span>
            )}
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Copy code"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}
      <div className="flex items-center gap-0 border-b border-border bg-secondary/50 px-2">
        {LANGUAGES.map((lang) => (
          <button
            key={lang}
            onClick={() => handleLangChange(lang)}
            className={cn(
              "px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px",
              activeLang === lang
                ? "border-violet-600 text-violet-700 bg-background"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            {languageLabels[lang]}
          </button>
        ))}
      </div>
      <pre className="p-4 overflow-x-auto text-sm bg-[#0B0B12]">
        <code className="text-slate-300 font-mono leading-relaxed">
          {examples[activeLang]}
        </code>
      </pre>
    </div>
  )
}
