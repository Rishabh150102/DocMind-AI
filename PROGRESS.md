# Project Upgrade: Adaptive RAG Ingestion Pipeline

## Roadmap
- [x] Explore existing codebase (upload/parsing)
- [x] Initialize PROGRESS.md and AGENT_LOG.md
- [x] Design adaptive ingestion pipeline
- [x] Implement adaptive ingestion pipeline
- [x] Verify and cleanup

## Current Blockages
None.

## STATE FOR NEXT SESSION
- Project completed.
- Adaptive ingestion pipeline implemented with `/upload` endpoint.

# Progress Log - NeuralDoc AI (Version 2)

**Date:** 2026-06-29

---

# Goal

Start converting the hardcoded RAG chatbot into a production-style application where users can upload their own PDF documents.

---

# Topics Learned

## 1. Product Architecture

Instead of immediately writing code, discussed the architecture of a document-based RAG application.

Topics covered:

* Why page count should not determine chunk size.
* Why chunking is based on text rather than number of pages.
* Fixed chunking vs Dynamic chunking vs Semantic chunking.
* Why fixed chunking is sufficient for Version 2.

Decision:

* Keep current chunking strategy for now.
* Improve chunking in a future version.

---

## 2. ChromaDB Design

Discussed different storage strategies.

Options considered:

* Separate Chroma database per upload.
* Single database with metadata filtering.
* Temporary session-based database.

Decision for current version:

Start with a simple implementation and evolve the architecture later.

---

## 3. User Experience Planning

Discussed upload workflow.

Final flow:

User opens website

↓

Upload PDF

↓

Processing document

↓

Chat becomes available

Important UI states identified:

* No document uploaded
* Uploading
* Processing
* Ready
* Answering

---

## 4. API Design

Learned an important backend principle:

One endpoint should have one responsibility.

Planned API structure:

POST /upload

↓

Receive and process uploaded document

POST /chat

↓

Answer questions from indexed document

Future endpoints:

* GET /documents
* DELETE /document

---

## 5. FastAPI File Uploads

Studied FastAPI documentation for UploadFile.

Implemented:

* POST /upload endpoint.
* Successfully received uploaded PDF.
* Verified upload through Swagger UI.
* Returned uploaded filename.

Important learning:

JSON is used for structured data.

Files are sent using multipart/form-data.

---

## 6. Engineering Mindset

Important realization:

Not every backend problem belongs to FastAPI.

Separated responsibilities:

FastAPI:

* Receive HTTP request
* Parse uploaded file
* Return response

Python:

* Create folders
* Save files
* Handle filesystem

This helped build a better understanding of where to search for documentation.

---

## 7. File Storage

Implemented:

* Automatic creation of uploads directory if it does not exist.
* Successfully saved uploaded PDF into uploads folder.

Current upload flow:

Receive file

↓

Create uploads folder if required

↓

Save uploaded PDF

↓

Return success response

---

# Current Project Status

Completed:

* RAG pipeline
* FastAPI backend
* Modern frontend
* Source citations
* Upload endpoint
* Upload folder creation
* File saving

Next milestone:

Read uploaded PDF instead of hardcoded PDF.

---

# Important Learning From Today

Biggest mindset shift:

Instead of asking:

"What code should I write?"

Start asking:

"Which part is handled by FastAPI, which by Python, and which by LangChain?"

Breaking a problem into responsibilities makes it much easier to decide which documentation to read and where to implement each piece of functionality.

---

# Next Session Plan

1. Read uploaded PDF from uploads folder.
2. Move ingestion from hardcoded file to uploaded file.
3. Create embeddings for uploaded document.
4. Build vector database from uploaded document.
5. Connect chat endpoint to uploaded document.
6. Add frontend upload functionality.
7. Show indexing/progress status while processing.

---

# Long-Term Roadmap

Version 2

* Single uploaded PDF
* Dynamic upload
* Temporary vector database

Version 3

* Multiple uploaded PDFs
* Sidebar showing uploaded documents
* Select which documents to search
* Better UI state management

Version 4

* Semantic chunking
* Metadata filtering
* User authentication
* Persistent document library
* Production-ready architecture
