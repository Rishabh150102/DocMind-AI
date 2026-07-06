import sys
import os
import shutil
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
# from langchain_community.vectorstores import Chroma
from langchain_chroma import Chroma
from dotenv import load_dotenv

load_dotenv()

# Function for loading file.
def load_file(file_path):
    loader = PyPDFLoader(file_path=file_path)
    document = loader.load()
    # print(len(document))

    # Count no of pages
    # print(f"Total no of pages is : {len(document)}")
    # print("*"*50)

    # # First page content
    # print(f"First Page Content: -\n {document[0]}")
    # print("*"*50)

    return document

# Function for splitting into chunks
def split_document(document):
    # print(len(document))
    chunks = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200).split_documents(document)
    # print("chunks")
    # print(len(document[0].page_content))
    # print(chunks)

    return chunks

# Function for creating a vectorstore
embedding_model = OpenAIEmbeddings(model="text-embedding-3-small")
def create_vector_store(chunks):
    vectorstore = Chroma(persist_directory="chroma_db", embedding_function=embedding_model)

    # Reseting ChromaDB
    if os.path.exists("chroma_db"):
        # shutil.rmtree("chroma_db")
        # print("Deleted ChromaDB!!")
        vectorstore.reset_collection()

    vectorstore.add_documents(chunks)

    print("Stored in ChromaDB")
    
    return vectorstore

# Function to delete the ChromaDB and uploaded file
def reset_knowledge_base():        
    
    folder_path = "uploads"
    contents = os.listdir(folder_path)
    if not contents:
        print("The folder is already empty. No action taken.")
    else:
        for item in contents:
            os.remove(os.path.join(folder_path, item))

        print("Uploaded file deleted.!!")

    return "Everything clear and ready to use."


# embedding_model = OpenAIEmbeddings(model="text-embedding-3-small")
# vectorstore = Chroma(persist_directory="chroma_db", embedding_function=embedding_model)

# def get_splitter(file_type: str):
#     if file_type == "pdf":
#         return RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
#     elif file_type == "docx":
#         return RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
#     else:
#         return RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)

# def ingest_document(file_path: str):
#     file_extension = os.path.splitext(file_path)[1].lower()
    
#     if file_extension == ".pdf":
#         loader = PyPDFLoader(file_path)
#         file_type = "pdf"
#     elif file_extension == ".docx":
#         loader = UnstructuredWordDocumentLoader(file_path)
#         file_type = "docx"
#     else:
#         loader = TextLoader(file_path)
#         file_type = "text"
        
#     docs = loader.load()
#     splitter = get_splitter(file_type)
#     chunks = splitter.split_documents(docs)
    
#     vectorstore.add_documents(chunks)
#     return f"Processed {len(chunks)} chunks"
