"use client"

import { useState, useRef, useEffect } from "react"
import { ChatSidebar } from "./chat-sidebar"
import { ChatMessage } from "./chat-message"
import { ChatInput } from "./chat-input"
import { Brain } from "lucide-react"
import { toast } from "sonner"
import {
  API_BASE_URL,
  ActiveSource,
  IngestionStatus,
  Message,
  isValidFileExtension,
  isValidHttpUrl,
  parseApiError,
} from "@/lib/api"

export function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeSource, setActiveSource] = useState<ActiveSource | null>(null)
  const [uploadStatus, setUploadStatus] = useState<IngestionStatus>("idle")

  const scrollRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatAbortControllerRef = useRef<AbortController | null>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const handleUploadFile = async (file: File) => {
    if (!isValidFileExtension(file.name)) {
      toast.error(
        "Unsupported file. Please upload a PDF or Markdown file (.pdf, .md, .markdown)."
      )
      return
    }

    // Abort any inflight chat response from previous source
    if (chatAbortControllerRef.current) {
      chatAbortControllerRef.current.abort()
      chatAbortControllerRef.current = null
    }
    setIsLoading(false)

    // Clear chat immediately on valid new ingestion; chat stays disabled until ready
    setMessages([])
    setActiveSource({ type: "file", name: file.name })
    setUploadStatus("uploading")

    const formData = new FormData()
    formData.append("file", file)

    try {
      setUploadStatus("processing")

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorMsg = await parseApiError(
          response,
          "Document processing failed. Please check the file and try again."
        )
        throw new Error(errorMsg)
      }

      setUploadStatus("ready")
      toast.success(`"${file.name}" loaded and processed successfully.`)
    } catch (error: unknown) {
      console.error("Upload error:", error)
      setUploadStatus("error")
      const safeMsg =
        error instanceof Error && error.message && !error.message.includes("Traceback")
          ? error.message
          : "Document processing failed. Please try again."
      toast.error(safeMsg)
    }
  }

  const handleUploadUrl = async (url: string) => {
    if (!isValidHttpUrl(url)) {
      toast.error(
        "Please enter a valid HTTP or HTTPS URL (e.g. https://example.com)."
      )
      return
    }

    // Abort any inflight chat response from previous source
    if (chatAbortControllerRef.current) {
      chatAbortControllerRef.current.abort()
      chatAbortControllerRef.current = null
    }
    setIsLoading(false)

    // Clear chat immediately on valid new ingestion
    setMessages([])
    setActiveSource({ type: "url", name: url })
    setUploadStatus("processing")

    try {
      const response = await fetch(`${API_BASE_URL}/url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        const errorMsg = await parseApiError(
          response,
          "Web page processing failed. Please verify the URL and try again."
        )
        throw new Error(errorMsg)
      }

      setUploadStatus("ready")
      toast.success("Web page loaded and processed successfully.")
    } catch (error: unknown) {
      console.error("URL ingestion error:", error)
      setUploadStatus("error")
      const safeMsg =
        error instanceof Error && error.message && !error.message.includes("Traceback")
          ? error.message
          : "Web page processing failed. Please check the URL and try again."
      toast.error(safeMsg)
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!activeSource || uploadStatus !== "ready") {
      toast.error("Please upload a document or submit a website URL first.")
      return
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    const controller = new AbortController()
    chatAbortControllerRef.current = controller

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: content,
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        // On 409, clear readiness and prompt user to ingest a source
        if (response.status === 409) {
          setUploadStatus("idle")
          toast.error("No active document or website found. Please ingest a source first.")
          const parsedError = await parseApiError(
            response,
            "Please upload a document or enter a website URL before asking questions."
          )
          const warningMessage: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: parsedError || "Please upload a document or enter a website URL before asking questions.",
          }
          setMessages((prev) => [...prev, warningMessage])
          return
        }

        const errorMsg = await parseApiError(response, "Unable to generate answer.")
        throw new Error(errorMsg)
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.answer || "I could not find an answer in the source.",
        sources: Array.isArray(data.sources) ? data.sources : [],
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        // Chat was intentionally aborted by a new ingestion action
        return
      }
      console.error("Error sending message:", error)
      const safeMsg =
        error instanceof Error && error.message && !error.message.includes("Traceback")
          ? error.message
          : "Sorry, I was unable to generate an answer. Please try again."

      toast.error(safeMsg)
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: safeMsg,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      chatAbortControllerRef.current = null
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <ChatSidebar
        uploadStatus={uploadStatus}
        activeSource={activeSource}
        onUploadFile={handleUploadFile}
        onUploadUrl={handleUploadUrl}
        isAnswering={isLoading}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main chat area */}
      <div className="relative flex flex-1 flex-col overflow-hidden min-w-0">
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
              <p className="max-w-[320px] md:max-w-md text-center text-sm md:text-base text-muted-foreground leading-relaxed">
                Upload a document (PDF or Markdown) or submit a website URL to start asking intelligent questions.
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
          placeholder={
            uploadStatus === "ready"
              ? activeSource?.type === "url"
                ? "Ask anything about this website..."
                : "Ask anything about your document..."
              : "Please upload a document or website to begin"
          }
        />
      </div>
    </div>
  )
}

