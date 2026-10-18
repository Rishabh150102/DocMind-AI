import sys
import os
import shutil
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from langchain_community.document_loaders import PyPDFLoader, TextLoader, WebBaseLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
# from langchain_community.vectorstores import Chroma
from langchain_chroma import Chroma
from langchain_community.retrievers import BM25Retriever
import time
from dotenv import load_dotenv

start = time.time()

load_dotenv()

#Function for reading websites
def load_url(url):
    loader = WebBaseLoader(url)
    document = loader.load()

    print(time.time() - start)
    return document

# Function for loading file.
def load_file(file_path: str):

    file_ext = os.path.splitext(file_path)

    if file_ext[-1].lower() == ".pdf":
        loader = PyPDFLoader(file_path=file_path)
    elif file_ext[-1].lower() == ".md" or file_ext[-1].lower() == ".markdown": 
        loader = TextLoader(file_path=file_path, encoding="UTF-8")
    else:
        raise ValueError("Unsupported file type. Supported formats: PDF and Markdown.")

    document = loader.load()
    # print(len(document))

    # Count no of pages
    # print(f"Total no of pages is : {len(document)}")
    # print("*"*50)

    # # First page content
    # print(f"First Page Content: -\n {document[0]}")
    # print("*"*50)

    print(time.time() - start)
    return document

# Function for splitting into chunks
def split_document(document):
    # print(len(document))

    # Splitting the doc via token limit
    chunks = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
                model_name="text-embedding-3-small",
                chunk_size=700,
                chunk_overlap=100
            ).split_documents(documents=document)
    # print("chunks")
    # print(len(document[0].page_content))
    # print(chunks)

    print(time.time() - start)
    return chunks

# Function for creating a vectorstore
embedding_model = OpenAIEmbeddings(model="text-embedding-3-small")
def create_vector_store(chunks):

    print("Creating embeddings...")

    vectorstore = Chroma(persist_directory="chroma_db", embedding_function=embedding_model)

    # Reseting ChromaDB
    if os.path.exists("chroma_db"):
        # shutil.rmtree("chroma_db")
        # print("Deleted ChromaDB!!")
        vectorstore.reset_collection()

    vectorstore.add_documents(chunks)

    print("Embeddings stored successfully")

    print("Stored in ChromaDB")
    
    print(time.time() - start)
    return vectorstore

def bm25_index(chunks):

    # Creating indexes for BM25
    bm25_indexing = BM25Retriever.from_documents(chunks)
    bm25_indexing.k = 5

    return bm25_indexing


def process_documents(document):

    chunks = split_document(document)

    reset_knowledge_base()

    vectorstore = create_vector_store(chunks)

    bm25_retriever = bm25_index(chunks)

    return bm25_retriever

# Function to delete the ChromaDB and uploaded file
def reset_knowledge_base():        
    
    folder_path = "uploads"
    if os.path.exists(folder_path):
        contents = os.listdir(folder_path)
        if not contents:
            print("The folder is already empty. No action taken.")
        else:
            for item in contents:
                os.remove(os.path.join(folder_path, item))

            print("Uploaded file deleted.!!")

    return "Everything clear and ready to use."

