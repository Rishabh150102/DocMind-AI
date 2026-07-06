# Backend Hardening Checklist

This file tracks all backend improvements, validation, and error handling that need to be added after the core functionality is completed.

---

# Status

Current Phase:
- [x] Core Backend Development
- [ ] Backend Hardening
- [ ] Performance Optimization
- [ ] Production Ready

---

# Error Handling

## 1. Upload Validation
Status: Pending

Need to handle:

- [ ] No file uploaded
- [ ] Unsupported file type
- [ ] Empty file
- [ ] Corrupted PDF
- [ ] Large file size limit

Expected Response:
- Return proper HTTP status code.
- Return meaningful error message.

---

## 2. Upload Folder

Status: Pending

Need to handle:

- [ ] uploads folder does not exist
- [ ] Permission denied while creating folder
- [ ] Permission denied while saving file

---

## 3. PDF Loading

Status: Pending

Need to handle:

- [ ] Invalid PDF
- [ ] Password protected PDF
- [ ] PDF cannot be parsed
- [ ] Empty PDF

---

## 4. Image-only / Scanned PDFs

Status: Pending

Current Observation:

PyPDFLoader extracts only text.

Problem:

Image-based PDFs return empty text.

Future Improvements:

- [ ] Detect empty extracted text
- [ ] Return user-friendly message
- [ ] Add OCR support (Tesseract or equivalent)

---

## 5. Document Splitting

Status: Pending

Need to handle:

- [ ] Empty document
- [ ] Empty chunks generated
- [ ] Invalid splitter configuration

Current Error Faced:

ValueError because chunks == []

---

## 6. ChromaDB

Status: Pending

Need to handle:

- [ ] Existing ChromaDB
- [ ] PermissionError while deleting
- [ ] Locked SQLite database
- [ ] Failed embedding creation
- [ ] Empty embeddings

Current Error Faced:

PermissionError:
WinError 32

Current Error Faced:

ValueError:
Expected embeddings got []

---

## 7. Retrieval

Status: Pending

Need to handle:

- [ ] ChromaDB not found
- [ ] User asks question before upload
- [ ] Empty retrieval
- [ ] No relevant chunks found

Expected Behaviour:

Return:

"I could not find an answer in the uploaded document."

---

## 8. LLM

Status: Pending

Need to handle:

- [ ] API key missing
- [ ] API timeout
- [ ] Rate limit exceeded
- [ ] Model unavailable
- [ ] Invalid prompt

---

## 9. API Validation

Status: Pending

Need to handle:

- [ ] Invalid request body
- [ ] Missing question
- [ ] Empty question
- [ ] Invalid JSON

---

## 10. Logging

Status: Pending

Need to add logging for:

- [ ] Upload started
- [ ] Upload completed
- [ ] Document loaded
- [ ] Chunk creation
- [ ] Embedding creation
- [ ] ChromaDB creation
- [ ] Retrieval
- [ ] LLM response
- [ ] Errors

---

# Future Improvements

- [ ] Multiple document support
- [ ] Metadata filtering
- [ ] Separate ChromaDB per user/session
- [ ] Sidebar showing uploaded files
- [ ] Upload progress indicator
- [ ] Background document processing
- [ ] Streaming LLM responses
- [ ] Conversation history
- [ ] Authentication
- [ ] Deployment improvements

---

# Notes

This document is intentionally maintained throughout development.

Whenever a new backend issue is discovered that requires validation, exception handling, or architectural improvement, it should be added here before implementing the fix.

Core functionality is prioritized first. Hardening will be completed after the backend is feature-complete.

# Date: 05-07-2026

### Chroma Storage Investigation

Status: Future Investigation

Observation:
Chroma creates additional UUID directories inside persist_directory after collection resets.

Current Behaviour:
- Retrieval works correctly.
- Old documents are not retrieved.
- Sources are correct.

Action:
Investigate Chroma storage internals during production optimization.