import shutil
import os
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ingestion import load_file, split_document, reset_knowledge_base, create_vector_store
from rag import ask_question
# from backend.rag import ask_question
# from backend.ingestion import ingest_document


app = FastAPI()

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


# # API endpoint
# @app.post("/chat")
# async def chat(query: Query):
#     return {"answer": "Not implemented"}

@app.post("/upload")
async def upload(file: UploadFile):
    #Calling this function to reset everything.
    reset_knowledge_base()

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
    chunks = split_document(document)
    vectorstore = create_vector_store(chunks)
        
    # 5. Return a valid JSON dictionary
    return {"message": f"Document uploaded and processed successfully."}

@app.post("/chat")
async def chat(query: Query):

    return ask_question(query.question)


