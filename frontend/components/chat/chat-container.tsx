"use client"

import { useState, useRef, useEffect } from "react"
import { ChatSidebar } from "./chat-sidebar"
import { ChatMessage } from "./chat-message"
import { ChatInput } from "./chat-input"
import { Brain } from "lucide-react"
import { toast } from "sonner"

interface Source {
  title?: string
  source?: string
  page?: number
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: Source[]
}

export function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "processing" | "ready" | "error">("idle")
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const handleSendMessage = async (content: string) => {
    if (!uploadedFile || uploadStatus !== "ready") {
      toast.error("Please upload a PDF first.")
      return
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: content,
        }),
      })

      if (!response.ok) {
        throw new Error("Unable to generate answer.")
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.answer,
        sources: data.sources,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I was unable to generate an answer. Please try again.",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadPDF = async (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Unsupported file. Please upload a PDF.")
      return
    }

    setUploadedFile(file)
    setUploadStatus("uploading")
    setMessages([]) // clear chat on new upload

    const formData = new FormData()
    formData.append("file", file)

    try {
      // It can be considered "processing" directly since the API is synchronous
      // But we can just set it to processing to show the state briefly
      setUploadStatus("processing")
      
      const response = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Document processing failed.")
      }

      setUploadStatus("ready")
    } catch (error) {
      console.error("Upload error:", error)
      setUploadStatus("error")
      toast.error("Document processing failed.")
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <ChatSidebar
        uploadStatus={uploadStatus}
        fileName={uploadedFile?.name || null}
        onUpload={handleUploadPDF}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main chat area */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-4 py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary mb-6 border border-border shadow-sm">
                <Brain className="h-8 w-8 text-accent" />
              </div>
              <h2 className="mb-3 text-2xl font-medium tracking-tight text-foreground text-center">
                Welcome to DocMind AI
              </h2>
              <p className="max-w-[280px] md:max-w-md text-center text-sm md:text-base text-muted-foreground leading-relaxed">
                Upload a PDF and start asking intelligent questions about your document.
              </p>
            </div>
          ) : (
            <div className="mx-auto w-full pb-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  sources={message.sources}
                />
              ))}
              {isLoading && (
                <ChatMessage role="assistant" content="" isLoading />
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={uploadStatus !== "ready" || isLoading}
          placeholder={uploadStatus === "ready" ? "Ask anything about your uploaded document..." : "Please upload a document to begin"}
        />
      </div>
    </div>
  )
}
