"use client"

import { useState, useRef, DragEvent, KeyboardEvent } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  UploadCloud,
  FileText,
  Globe,
  CheckCircle2,
  Loader2,
  Menu,
  X,
  Brain,
} from "lucide-react"
import { toast } from "sonner"
import {
  ActiveSource,
  IngestionStatus,
  isValidFileExtension,
  isValidHttpUrl,
} from "@/lib/api"

interface ChatSidebarProps {
  uploadStatus: IngestionStatus
  activeSource: ActiveSource | null
  onUploadFile: (file: File) => void
  onUploadUrl: (url: string) => void
  isAnswering: boolean
  isOpen: boolean
  onToggle: () => void
}

export function ChatSidebar({
  uploadStatus,
  activeSource,
  onUploadFile,
  onUploadUrl,
  isAnswering,
  isOpen,
  onToggle,
}: ChatSidebarProps) {
  const [activeTab, setActiveTab] = useState<"file" | "website">("file")
  const [urlInput, setUrlInput] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isBusy =
    uploadStatus === "uploading" ||
    uploadStatus === "processing" ||
    isAnswering

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // Reset file input value immediately so re-selecting the same file works reliably
    e.target.value = ""
    if (!file) return

    if (isValidFileExtension(file.name)) {
      onUploadFile(file)
    } else {
      toast.error(
        "Unsupported file. Please upload a PDF or Markdown file (.pdf, .md, .markdown)."
      )
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (isBusy) return

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    if (isValidFileExtension(file.name)) {
      onUploadFile(file)
    } else {
      toast.error(
        "Unsupported file. Please upload a PDF or Markdown file (.pdf, .md, .markdown)."
      )
    }
  }

  const handleUrlSubmit = () => {
    if (isBusy) return
    const trimmed = urlInput.trim()
    if (!trimmed) {
      toast.error("Please enter a website URL.")
      return
    }
    if (!isValidHttpUrl(trimmed)) {
      toast.error(
        "Please enter a valid HTTP or HTTPS URL (e.g. https://example.com)."
      )
      return
    }
    onUploadUrl(trimmed)
  }

  const handleTabKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault()
      const nextTab = activeTab === "file" ? "website" : "file"
      setActiveTab(nextTab)
      const tabElement = document.getElementById(`tab-${nextTab}`)
      tabElement?.focus()
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-secondary border-r border-border transition-transform duration-300 ease-in-out md:static md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <Brain size={18} />
            </div>
            <h1 className="text-sm font-semibold tracking-tight">
              DocMind AI
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onToggle}
          >
            <X size={18} />
          </Button>
        </div>

        <div className="flex-1 flex flex-col p-4 gap-5 overflow-y-auto scrollbar-thin">
          {/* Accessible Segmented Control / Tabs */}
          <div
            role="tablist"
            aria-label="Source ingestion type"
            onKeyDown={handleTabKeyDown}
            className="grid grid-cols-2 p-1 bg-background/70 rounded-xl border border-border"
          >
            <button
              type="button"
              role="tab"
              id="tab-file"
              aria-selected={activeTab === "file"}
              aria-controls="panel-file"
              tabIndex={activeTab === "file" ? 0 : -1}
              onClick={() => setActiveTab("file")}
              disabled={isBusy}
              className={cn(
                "flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium rounded-lg transition-all",
                activeTab === "file"
                  ? "bg-secondary text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
                isBusy && "opacity-50 cursor-not-allowed"
              )}
            >
              <FileText size={14} />
              <span>File</span>
            </button>
            <button
              type="button"
              role="tab"
              id="tab-website"
              aria-selected={activeTab === "website"}
              aria-controls="panel-website"
              tabIndex={activeTab === "website" ? 0 : -1}
              onClick={() => setActiveTab("website")}
              disabled={isBusy}
              className={cn(
                "flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium rounded-lg transition-all",
                activeTab === "website"
                  ? "bg-secondary text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
                isBusy && "opacity-50 cursor-not-allowed"
              )}
            >
              <Globe size={14} />
              <span>Website</span>
            </button>
          </div>

          {/* Tab Panel: File Upload */}
          {activeTab === "file" && (
            <div
              role="tabpanel"
              id="panel-file"
              aria-labelledby="tab-file"
              className="flex flex-col"
            >
              <div
                className={cn(
                  "group flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 text-center bg-background/50 hover:bg-secondary hover:border-accent/50 transition-all duration-200 cursor-pointer",
                  isBusy && "opacity-50 pointer-events-none"
                )}
                onClick={() => !isBusy && fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <UploadCloud
                  size={28}
                  className="mb-2 text-muted-foreground group-hover:text-accent transition-colors"
                />
                <p className="text-sm font-medium mb-1">Upload Document</p>
                <p className="text-xs text-muted-foreground">
                  PDF or Markdown (.md, .markdown)
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.md,.markdown,application/pdf,text/markdown,text/plain"
                  className="hidden"
                  disabled={isBusy}
                />
              </div>
            </div>
          )}

          {/* Tab Panel: Website URL */}
          {activeTab === "website" && (
            <div
              role="tabpanel"
              id="panel-website"
              aria-labelledby="tab-website"
              className="flex flex-col gap-3"
            >
              <div>
                <label
                  htmlFor="website-url-input"
                  className="text-xs font-medium text-foreground block mb-1.5"
                >
                  Website URL
                </label>
                <input
                  id="website-url-input"
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isBusy) {
                      e.preventDefault()
                      handleUrlSubmit()
                    }
                  }}
                  placeholder="https://example.com/docs"
                  disabled={isBusy}
                  className="w-full px-3 py-2.5 text-xs bg-background/60 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-border disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
              </div>

              <Button
                type="button"
                onClick={handleUrlSubmit}
                disabled={isBusy || !urlInput.trim()}
                className="w-full py-2.5 text-xs font-medium rounded-xl flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {uploadStatus === "uploading" || uploadStatus === "processing" ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Globe size={14} />
                    <span>Load Website</span>
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Active Source Status Area */}
          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Source Status
            </h2>
            {activeSource ? (
              <div className="flex flex-col gap-3 p-3.5 rounded-xl bg-background border border-border shadow-sm min-w-0 overflow-hidden">
                <div className="flex items-center gap-2.5 min-w-0">
                  {activeSource.type === "url" ? (
                    <Globe size={16} className="text-accent shrink-0" />
                  ) : (
                    <FileText size={16} className="text-accent shrink-0" />
                  )}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span
                      className="text-xs font-medium truncate text-foreground"
                      title={activeSource.name}
                    >
                      {activeSource.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground capitalize">
                      {activeSource.type === "url" ? "Website" : "Document"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs pt-2 border-t border-border/40 min-w-0">
                  {uploadStatus === "uploading" && (
                    <>
                      <Loader2 size={14} className="animate-spin text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground truncate">
                        {activeSource.type === "url" ? "Loading web page..." : "Uploading file..."}
                      </span>
                    </>
                  )}
                  {uploadStatus === "processing" && (
                    <>
                      <Loader2 size={14} className="animate-spin text-accent shrink-0" />
                      <span className="text-accent truncate">Indexing content...</span>
                    </>
                  )}
                  {uploadStatus === "ready" && (
                    <>
                      <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                      <span className="text-green-500 truncate">Ready for questions</span>
                    </>
                  )}
                  {uploadStatus === "error" && (
                    <>
                      <X size={14} className="text-destructive shrink-0" />
                      <span className="text-destructive truncate">Processing failed</span>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-border/50 rounded-xl bg-background/30">
                <p className="text-[13px] text-muted-foreground">
                  No document or website loaded.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 mt-auto border-t border-border/50 text-[11px] text-muted-foreground">
          <div className="font-semibold text-foreground/80 mb-1">DocMind AI</div>
          <p className="leading-relaxed">
            AI-powered document and web question answering using<br />
            <span className="font-mono text-[10px] mt-1 block opacity-80">
              FastAPI &bull; LangChain &bull; ChromaDB &bull; Hybrid Search (BM25 + Vector)
            </span>
          </p>
        </div>
      </aside>

      {/* Mobile toggle button */}
      {!isOpen && (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open sidebar"
          className="fixed left-4 top-4 z-40 md:hidden bg-secondary border border-border shadow-sm"
          onClick={onToggle}
        >
          <Menu size={18} />
        </Button>
      )}
    </>
  )
}

