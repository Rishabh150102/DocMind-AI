# DeepLearning RAG Chatbot

A modern AI-powered PDF chatbot built using **LangChain**, **FastAPI**, **ChromaDB**, and **Next.js**.  
The application uses **Retrieval-Augmented Generation (RAG)** to answer questions from pre-indexed technical documents using semantic search and source-grounded responses with citations.

# Demo Video

https://github.com/user-attachments/assets/0e6ea8b7-87f0-4769-8f38-2b9dbeb12650

# Features

- AI-powered PDF question answering
- Retrieval-Augmented Generation (RAG)
- Semantic document search using embeddings
- Source citations with page references
- FastAPI backend
- Modern responsive frontend built with Next.js
- Dark futuristic UI
- Vector database using ChromaDB
- Mistral LLM integration
- OpenAI embeddings

---

# Tech Stack

## Backend
- Python
- FastAPI
- LangChain
- ChromaDB
- OpenAI Embeddings
- Mistral AI

## Frontend
- Next.js
- Tailwind CSS
- shadcn/ui

---

# Architecture

```text
Frontend (Next.js)
        ↓
FastAPI Backend
        ↓
LangChain RAG Pipeline
        ↓
ChromaDB Vector Store
        ↓
LLM Response Generation
```

---

# How It Works

1. PDF documents are loaded and split into chunks
2. Text chunks are converted into embeddings
3. Embeddings are stored in ChromaDB
4. User query is semantically matched against document chunks
5. Relevant context is sent to the LLM
6. AI-generated response is returned with source citations

---

# Project Structure

```text
project-root/
│
├── backend/
│   ├── api.py
│   ├── rag.py
│   ├── create_database.py
│   ├── chroma_db/
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── public/
│   ├── package.json
│   └── ...
│
└── README.md
```

---

# Backend Setup

## 1. Navigate to backend

```bash
cd backend
```

## 2. Create virtual environment

```bash
python -m venv venv
```

## 3. Activate virtual environment

### Windows

```bash
venv\Scripts\activate
```

### Mac/Linux

```bash
source venv/bin/activate
```

## 4. Install dependencies

```bash
pip install -r requirements.txt
```

## 5. Add environment variables

Create a `.env` file:

```env
OPENAI_API_KEY=your_openai_api_key
MISTRAL_API_KEY=your_mistral_api_key
```

## 6. Create vector database

```bash
python create_database.py
```

## 7. Start FastAPI server

```bash
uvicorn api:app --reload
```

Backend runs at:

```text
http://127.0.0.1:8000
```

Swagger docs:

```text
http://127.0.0.1:8000/docs
```

---

# Frontend Setup

## 1. Navigate to frontend

```bash
cd frontend
```

## 2. Install dependencies

```bash
npm install
```

## 3. Run development server

```bash
npm run dev
```

Frontend runs at:

```text
http://localhost:3000
```

---

# API Response Format

```json
{
  "answer": "AI-generated response",
  "sources": [
    {
      "page": 61,
      "source": "deeplearning.pdf"
    }
  ]
}
```

---

# Future Improvements

- Dynamic PDF uploads
- Multi-document support
- Streaming responses
- Conversational memory
- User authentication
- Cloud deployment
- Hybrid search
- Reranking pipeline
