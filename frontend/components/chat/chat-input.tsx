"use client"

import { useState, useRef, type KeyboardEvent, type ChangeEvent, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, ArrowUp } from "lucide-react"

interface ChatInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = "Ask anything about your uploaded document...",
}: ChatInputProps) {
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage("")
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }

  // Focus textarea when it becomes enabled
  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [disabled])

  return (
    <div className="p-4 md:p-6 bg-background">
      <div className="max-w-3xl mx-auto relative flex items-end gap-2 bg-secondary border border-border/50 rounded-2xl shadow-sm focus-within:ring-1 focus-within:border-border focus-within:ring-accent/30 transition-all duration-200 overflow-hidden px-2 py-2">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 max-h-48 min-h-[44px] resize-none border-0 bg-transparent py-3 px-4 focus-visible:ring-0 shadow-none text-base md:text-sm"
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          size="icon"
          className="h-10 w-10 shrink-0 rounded-xl mb-0.5 bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <ArrowUp size={18} />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </div>
  )
}
