"use client"

import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Bot, FileText, Globe, ExternalLink } from "lucide-react"
import { Source, isValidHttpUrl } from "@/lib/api"

interface ChatMessageProps {
  role: "user" | "assistant"
  content: string
  sources?: Source[]
  isLoading?: boolean
}

export function ChatMessage({ role, content, sources, isLoading }: ChatMessageProps) {
  const isUser = role === "user"

  return (
    <div className={cn("px-4 py-6 md:py-8 w-full flex", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("flex gap-4 md:gap-5 w-full max-w-3xl", isUser ? "flex-row-reverse" : "flex-row")}>
        <div className="shrink-0 mt-1">
          {!isUser && (
            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center border border-border/50 shadow-sm">
              <Bot size={16} className="text-foreground" />
            </div>
          )}
        </div>

        <div className={cn("flex-1 min-w-0 flex flex-col gap-2", isUser ? "items-end" : "items-start")}>
          <div className={cn(
            "text-base md:text-sm leading-relaxed",
            isUser ? "bg-secondary text-foreground px-5 py-3.5 rounded-2xl rounded-tr-sm" : "bg-transparent text-foreground px-0 py-1"
          )}>
            {isLoading ? (
              <div className="flex items-center gap-1.5 h-5 px-1">
                <div className="typing-dot w-2 h-2 bg-muted-foreground rounded-full" />
                <div className="typing-dot w-2 h-2 bg-muted-foreground rounded-full" />
                <div className="typing-dot w-2 h-2 bg-muted-foreground rounded-full" />
              </div>
            ) : (
              <div className="markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {!isLoading && sources && sources.length > 0 && !isUser && (
            <div className="flex flex-col gap-2 mt-1 w-full min-w-0">
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pl-1 mb-1">
                Sources
              </div>
              <div className="flex flex-wrap gap-2 min-w-0">
                {sources.map((source, idx) => {
                  const rawSource = source.source || source.title || "Unknown source"
                  const isUrl = isValidHttpUrl(rawSource)
                  const hasPage =
                    source.page !== null &&
                    source.page !== undefined &&
                    String(source.page).trim() !== ""

                  if (isUrl) {
                    return (
                      <a
                        key={idx}
                        href={rawSource}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex flex-col gap-0.5 px-3 py-2 rounded-xl bg-secondary/50 border border-border/50 text-xs text-muted-foreground hover:bg-secondary hover:border-accent/40 hover:text-foreground transition-all duration-200 group max-w-full min-w-0"
                        title={rawSource}
                      >
                        <div className="flex items-center gap-1.5 font-medium text-foreground min-w-0">
                          <Globe size={12} className="text-muted-foreground shrink-0 group-hover:text-accent transition-colors" />
                          <span className="truncate max-w-[200px] sm:max-w-xs md:max-w-sm">
                            {rawSource}
                          </span>
                          <ExternalLink size={10} className="text-muted-foreground/60 shrink-0 group-hover:text-accent transition-colors" />
                        </div>
                        {hasPage && (
                          <span className="text-[11px] pl-[18px] opacity-80">
                            Page {String(source.page)}
                          </span>
                        )}
                      </a>
                    )
                  }

                  return (
                    <div
                      key={idx}
                      className="inline-flex flex-col gap-0.5 px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-xs text-muted-foreground hover:bg-secondary hover:border-border transition-all duration-200 cursor-default max-w-full min-w-0"
                      title={rawSource}
                    >
                      <div className="flex items-center gap-1.5 font-medium text-foreground min-w-0">
                        <FileText size={12} className="text-muted-foreground shrink-0" />
                        <span className="truncate max-w-[200px] sm:max-w-xs md:max-w-sm">
                          {rawSource}
                        </span>
                      </div>
                      {hasPage && (
                        <span className="text-[11px] pl-[18px] opacity-80">
                          Page {String(source.page)}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

