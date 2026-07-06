"use client"

import { useRef, DragEvent } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { UploadCloud, FileText, CheckCircle2, Loader2, Menu, X, Brain } from "lucide-react"
import { toast } from "sonner"

interface ChatSidebarProps {
  uploadStatus: "idle" | "uploading" | "processing" | "ready" | "error"
  fileName: string | null
  onUpload: (file: File) => void
  isOpen: boolean
  onToggle: () => void
}

export function ChatSidebar({
  uploadStatus,
  fileName,
  onUpload,
  isOpen,
  onToggle,
}: ChatSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onUpload(file)
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type === "application/pdf") {
      onUpload(file)
    } else {
      toast.error("Please upload a PDF file.")
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

        <div className="flex-1 flex flex-col p-4 gap-6">
          <div
            className={cn(
              "group flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-8 text-center bg-background/50 hover:bg-secondary hover:border-accent/50 transition-all duration-200 cursor-pointer",
              (uploadStatus === "uploading" || uploadStatus === "processing") && "opacity-50 pointer-events-none"
            )}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <UploadCloud size={28} className="mb-3 text-muted-foreground group-hover:text-accent transition-colors" />
            <p className="text-sm font-medium mb-1">Upload PDF</p>
            <p className="text-xs text-muted-foreground">Drag and drop or browse</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="application/pdf"
              className="hidden"
            />
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Document Status
            </h2>
            {fileName ? (
              <div className="flex flex-col gap-3 p-3.5 rounded-xl bg-background border border-border shadow-sm">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-accent shrink-0" />
                  <span className="text-sm font-medium truncate">{fileName}</span>
                </div>
                
                <div className="flex items-center gap-2 text-xs">
                  {uploadStatus === "uploading" && (
                    <>
                      <Loader2 size={14} className="animate-spin text-muted-foreground" />
                      <span className="text-muted-foreground">Uploading...</span>
                    </>
                  )}
                  {uploadStatus === "processing" && (
                    <>
                      <Loader2 size={14} className="animate-spin text-accent" />
                      <span className="text-accent">Processing...</span>
                    </>
                  )}
                  {uploadStatus === "ready" && (
                    <>
                      <CheckCircle2 size={14} className="text-green-500" />
                      <span className="text-green-500">Ready</span>
                    </>
                  )}
                  {uploadStatus === "error" && (
                    <>
                      <X size={14} className="text-destructive" />
                      <span className="text-destructive">Upload failed</span>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-border/50 rounded-xl bg-background/30">
                <p className="text-[13px] text-muted-foreground">
                  No document uploaded.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 mt-auto border-t border-border/50 text-[11px] text-muted-foreground">
          <div className="font-semibold text-foreground/80 mb-1">DocMind AI</div>
          <p className="leading-relaxed">
            AI-powered document question answering using<br />
            <span className="font-mono text-[10px] mt-1 block opacity-80">FastAPI &bull; LangChain &bull; ChromaDB &bull; OpenAI Embeddings &bull; Mistral AI</span>
          </p>
        </div>
      </aside>

      {/* Mobile toggle button */}
      {!isOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4 top-4 z-40 md:hidden bg-secondary border border-border"
          onClick={onToggle}
        >
          <Menu size={18} />
        </Button>
      )}
    </>
  )
}
