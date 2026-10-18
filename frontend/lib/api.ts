export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Source {
  page?: string | number | null;
  source?: string;
  title?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

export type IngestionStatus = "idle" | "uploading" | "processing" | "ready" | "error";

export interface ActiveSource {
  type: "file" | "url";
  name: string;
}

export const SUPPORTED_FILE_EXTENSIONS = [".pdf", ".md", ".markdown"] as const;

/**
 * Validates file extension case-insensitively (.pdf, .md, .markdown).
 * Does not rely on MIME type because Markdown MIME types vary or can be empty.
 */
export function isValidFileExtension(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return SUPPORTED_FILE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

/**
 * Validates that the input is a valid HTTP or HTTPS URL.
 */
export function isValidHttpUrl(urlString: string): boolean {
  if (!urlString || typeof urlString !== "string") return false;
  try {
    const parsed = new URL(urlString.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Extracts and formats errors from FastAPI responses.
 * Handles 422 validation arrays, custom detail strings, plain text,
 * and falls back safely while ensuring raw tracebacks are never shown.
 */
export async function parseApiError(response: Response, defaultMessage: string): Promise<string> {
  try {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await response.json();
      if (data && typeof data === "object") {
        if (typeof data.detail === "string") {
          if (data.detail.includes("Traceback (most recent call last)")) {
            return defaultMessage;
          }
          return data.detail;
        }
        if (Array.isArray(data.detail)) {
          const messages = data.detail
            .map((item: unknown) => {
              if (typeof item === "string") return item;
              if (item && typeof item === "object") {
                const errObj = item as { loc?: unknown[]; msg?: string };
                const field = Array.isArray(errObj.loc)
                  ? errObj.loc.filter((part) => part !== "body").join(".")
                  : "";
                return field ? `${field}: ${errObj.msg || "Invalid value"}` : (errObj.msg || JSON.stringify(item));
              }
              return String(item);
            })
            .filter(Boolean);
          if (messages.length > 0) {
            return messages.join("; ");
          }
        }
        if (typeof data.message === "string") {
          return data.message;
        }
      }
    } else {
      const text = await response.text();
      if (
        text.includes("<html") ||
        text.includes("Traceback (most recent call last)") ||
        text.length > 250
      ) {
        return defaultMessage;
      }
      const trimmed = text.trim();
      if (trimmed) return trimmed;
    }
  } catch {
    // Return default message if parsing fails
  }
  return defaultMessage;
}
