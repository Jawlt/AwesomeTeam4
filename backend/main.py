from fastapi import FastAPI, Request, APIRouter, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from openai import OpenAI
from typing import List, Dict
from pydantic import BaseModel
import json
import io
import base64
from PIL import Image
import fitz  # PyMuPDF
import slideshow_generator


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to your frontend's URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter()
load_dotenv()

# MongoDB setup
MONGODB_URI = os.getenv("MONGODB_URI")
client = MongoClient(MONGODB_URI)
db = client["Hackville2025"]
users_collection = db["users"]
youtube_collection = db["youtube"]
documents_collection = db["documents"]  # Collection for uploaded documents

# OpenAI setup
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class MessageRequest(BaseModel):
    message: str

class GPTRequest(BaseModel):
    message: str
    context: str


# Helper Functions ------------------------------------------------------------------------------------------------------------------------
    
def create_text_chunks(text: str, chunk_size: int = 1000, chunk_overlap: int = 50) -> List[str]:
    """Split text into overlapping chunks."""
    words = text.split()
    chunks = []
    current_chunk = []
    current_length = 0
    
    for word in words:
        if current_length + len(word) > chunk_size and current_chunk:
            chunks.append(" ".join(current_chunk))
            overlap_start = max(0, len(current_chunk) - int(len(current_chunk) * (chunk_overlap / chunk_size)))
            current_chunk = current_chunk[overlap_start:]
            current_length = sum(len(word) + 1 for word in current_chunk)
        
        current_chunk.append(word)
        current_length += len(word) + 1
    
    if current_chunk:
        chunks.append(" ".join(current_chunk))
    
    return chunks
    

def format_time(seconds):
    """Helper function to convert seconds to hh:mm:ss format."""
    return str(timedelta(seconds=seconds))


async def stream_gpt_response(messages, user_id: str):
    try:
        print("\nSending messages to GPT:")
        for msg in messages:
            print(f"\nRole: {msg['role']}")
            print(f"Content: {msg['content']}\n")
        
        response = openai_client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=messages,
            temperature=0.7,
            max_tokens=500,
            stream=True
        )
        
        for chunk in response:
            if chunk.choices[0].delta.content is not None:
                content = chunk.choices[0].delta.content
                yield f"data: {json.dumps({'content': content})}\n\n"
        
    except Exception as e:
        print(f"\nError in stream_gpt_response: {str(e)}")
        yield f"data: {json.dumps({'error': str(e)})}\n\n"
    finally:
        yield "data: [DONE]\n\n"




# Endpoints ------------------------------------------------------------------------------------------------------------------------

@app.api_route("/api", methods=["GET", "POST", "PUT", "DELETE"])
async def handle_crud():
    return {"message": "Handling CRUD operations"}


@router.post("/get_context")
async def search_context(request: MessageRequest):
    try:
        print(f"\nSearching context for message: {request.message}")
        query_embedding_response = openai_client.embeddings.create(
            model="text-embedding-ada-002",
            input=request.message
        )
        query_embedding = query_embedding_response.data[0].embedding

        pipeline = [
            {
                "$vectorSearch": {   
                    "index": "vector_search_index",
                    "path": "embedding",
                    "queryVector": query_embedding,
                    "numCandidates": 100,
                    "limit": 5
                }
            }
        ]

        results = list(youtube_collection.aggregate(pipeline))
        contexts = [doc["text"] for doc in results]
        concatenated_context = " ".join(contexts)
        
        print(f"\nFound context: {concatenated_context}\n")
        return {"context": concatenated_context}
    except Exception as e:
        print(f"Search error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/chat_gpt")
def create_new_presentation():
    print('new presentation called')


@router.post("/chat_gpt")
async def get_gpt_response(request: GPTRequest, current_user: str = None):
    try:
        print("\nReceived GPT request:")
        print(f"Message: {request.message}")
        print(f"Context: {request.context}")

        system_prompt = """ADD SYSTEM PROMPT HERE"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Context from video:\n{request.context}\n\nUser question: {request.message}"}
        ]

        return StreamingResponse(
            stream_gpt_response(messages, current_user),
            media_type="text/event-stream"
        )
    except Exception as e:
        print(f"GPT error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/create_new_presentation")
async def create_new_presentation():
    try:
        print('Received request to create new presentation')
        slideshow_generator.main()
        return {"message": "Presentation created successfully"}
    except Exception as e:
        print(f"Error creating presentation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/upload")
async def upload_documents(files: List[UploadFile]):
    try:
        uploaded_count = 0
        
        for file in files:
            content = await file.read()
            file_extension = file.filename.lower().split('.')[-1]
            preview_image = None
            text = ""
            
            # Process different file types
            if file_extension == 'pdf':
                pdf_document = fitz.open(stream=content, filetype="pdf")
                for page in pdf_document:
                    text += page.get_text()
                
                if len(pdf_document) > 0:
                    first_page = pdf_document[0]
                    pix = first_page.get_pixmap(matrix=fitz.Matrix(1, 1))
                    img_data = pix.tobytes("png")
                    preview_image = base64.b64encode(img_data).decode()
                pdf_document.close()
            
            elif file_extension in ['txt', 'csv', 'json']:
                text = content.decode('utf-8', errors='ignore')
            
            elif file_extension in ['png', 'jpg', 'jpeg', 'gif']:
                img = Image.open(io.BytesIO(content))
                img.thumbnail((200, 200))
                img_byte_arr = io.BytesIO()
                img.save(img_byte_arr, format='PNG')
                preview_image = base64.b64encode(img_byte_arr.getvalue()).decode()
                text = f"Image file: {file.filename}"
            
            else:
                raise HTTPException(status_code=400, detail=f"Unsupported file type: {file_extension}")
            
            # Create and process chunks
            chunks = create_text_chunks(text)
            embedded_chunks = []
            
            for chunk in chunks:
                try:
                    embedding_response = openai_client.embeddings.create(
                        model="text-embedding-ada-002",
                        input=chunk
                    )
                    embedded_chunks.append({
                        "text": chunk,
                        "embedding": embedding_response.data[0].embedding,
                        "metadata": {
                            "filename": file.filename,
                            "preview_image": preview_image,
                            "file_type": file_extension,
                            "upload_timestamp": datetime.utcnow().isoformat(),
                            "file_size": len(content)
                        }
                    })
                except Exception as e:
                    print(f"Error creating embedding: {str(e)}")
                    continue
            
            if embedded_chunks:
                documents_collection.insert_many(embedded_chunks)
                uploaded_count += 1
        
        return {
            "message": f"Successfully processed {uploaded_count} documents",
            "status": "success"
        }
    except Exception as e:
        print(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


app.include_router(router, prefix="/api")