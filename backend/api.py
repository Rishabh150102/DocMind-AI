import shutil
import os
from fastapi import FastAPI, UploadFile, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from ingestion import load_file
from rag import ask_question
from ingestion import process_documents, load_url
# from backend.rag import ask_question
# from backend.ingestion import ingest_document



app = FastAPI()
app.state.bm25_retriever = None

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request schema
class Query(BaseModel):
    question: str

class UrlSchema(BaseModel):
    url: HttpUrl

@app.post("/url")
async def url_upload(url: UrlSchema):

    document = load_url(str(url.url))

    app.state.bm25_retriever = None

    app.state.bm25_retriever = process_documents(document)
    
    return {"message": "Web page loaded and processed successfully."}



@app.post("/upload")
async def upload(file: UploadFile):

    # 1. Use relative path so it creates the folder in your project root
    upload_dir = "uploads" 
    
    # 2. Your directory check (can also just use os.makedirs(upload_dir, exist_ok=True))
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
        
    # 3. Construct the exact file destination path
    file_path = os.path.join(upload_dir, file.filename)
    
    # 4. Open the destination file and copy the file stream correctly
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    document = load_file(file_path)

    app.state.bm25_retriever = None

    app.state.bm25_retriever = process_documents(document)
        
    return {"message": "Document uploaded and processed successfully."}


@app.post("/chat")
async def chat(query: Query, request: Request):
    bm25_retriever = request.app.state.bm25_retriever

    if bm25_retriever is None:
        raise HTTPException(
            status_code=409,
            detail="Upload a PDF before asking a question."
        )

    return ask_question(query.question, bm25_retriever)


