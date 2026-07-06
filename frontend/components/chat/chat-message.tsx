"use client"

import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Bot, User, FileText } from "lucide-react"

interface Source {
  title?: string
  source?: string
  page?: number
}

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
            <div className="flex flex-col gap-2 mt-1">
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pl-1 mb-1">
                Sources
              </div>
              <div className="flex flex-wrap gap-2">
                {sources.map((source, idx) => (
                  <div
                    key={idx}
                    className="inline-flex flex-col gap-0.5 px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-xs text-muted-foreground hover:bg-secondary hover:border-border transition-all duration-200 cursor-default"
                  >
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <FileText size={12} className="text-muted-foreground" />
                      <span className="truncate max-w-[200px]">
                        {source.source || source.title || "Unknown Document"}
                      </span>
                    </div>
                    {source.page && (
                      <span className="text-[11px] pl-[18px] opacity-80">Page {source.page}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
