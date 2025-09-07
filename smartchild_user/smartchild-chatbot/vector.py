import os
import re
import fitz  # PyMuPDF

from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter


# Folder where your SmartChild docs live
docs_dir = ["E:\SMARTCHILD_final\smartchild_user\smartchild-chatbot\pdf\PDF1.pdf",
"E:\SMARTCHILD_final\smartchild_user\smartchild-chatbot\pdf\PDF2.pdf",
"E:\SMARTCHILD_final\smartchild_user\smartchild-chatbot\pdf\PDF3.pdf",
"E:\SMARTCHILD_final\smartchild_user\smartchild-chatbot\pdf\PDF4.pdf",
"E:\SMARTCHILD_final\smartchild_user\smartchild-chatbot\pdf\PDF5.pdf",
"E:\SMARTCHILD_final\smartchild_user\smartchild-chatbot\pdf\PDF6.pdf",
"E:\SMARTCHILD_final\smartchild_user\smartchild-chatbot\pdf\PDF7.pdf",
"E:\SMARTCHILD_final\smartchild_user\smartchild-chatbot\pdf\PDF8.pdf"
]




# Where Chroma DB will persist
db_location = "./chroma_smartchild_db"
collection_name = "SmartChild_Docs"


embedding_model = "models/embedding-001"

chunk_size = 1000
chunk_overlap = 150


embeddings = GoogleGenerativeAIEmbeddings(model=embedding_model)

# Check if DB already exists
add_documents = not os.path.exists(db_location)



def load_pdf(file_path: str) -> str:
    pdf_document = fitz.open(file_path)
    text = ""
    for page in pdf_document:
        text += page.get_text()
    pdf_document.close()
    return text



def clean_text(text: str) -> str:
    text = re.sub(r"\n+", "\n", text)
    text = re.sub(r"Page\s*\d+", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s{2,}", " ", text)
    return text.strip()



def split_text(raw_text: str, source_name: str):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
    )
    chunks = splitter.split_text(raw_text)
    documents = [
        Document(page_content=chunk, metadata={"source": source_name, "chunk": i})
        for i, chunk in enumerate(chunks)
    ]
    return documents



vector_store = Chroma(
    collection_name=collection_name,
    persist_directory=db_location,
    embedding_function=embeddings,
)


if add_documents:
    all_documents = []
    if not os.path.exists(docs_dir):
        os.makedirs(docs_dir, exist_ok=True)
        print(f"⚠️ No docs found. Put your PDFs/texts in: {docs_dir}")

    for file in os.listdir(docs_dir):
        file_path = os.path.join(docs_dir, file)
        if not os.path.isfile(file_path):
            continue

        raw_text = ""
        if file.lower().endswith(".pdf"):
            raw_text = load_pdf(file_path)
        elif file.lower().endswith((".txt", ".md")):
            with open(file_path, "r", encoding="utf-8") as f:
                raw_text = f.read()
        else:
            print(f"⏩ Skipped unsupported file: {file}")
            continue

        cleaned_text = clean_text(raw_text)
        split_docs = split_text(cleaned_text, file)
        print(f"📄 {file} → {len(split_docs)} chunks")
        all_documents.extend(split_docs)

    if all_documents:
        vector_store.add_documents(all_documents)
        vector_store.persist()
        print("✅ SmartChild docs ingested and persisted.")



retriever = vector_store.as_retriever(
    search_type="mmr",  # Maximal Marginal Relevance
    search_kwargs={
        "k": 10,           # final results
        "fetch_k": 20,     # candidate pool
        "lambda_mult": 0.75 
    }
)
