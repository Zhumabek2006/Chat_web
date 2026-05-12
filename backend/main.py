from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from typing import List
import crud
import base64
import uuid
from schemas import UserCreate, UserResponse, UserLogin, MessageCreate, MessageResponse, MessageUpdate, StatusUpdate
from websocket_manager import manager
import json

app = FastAPI(title="VibeChat API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Users ---

@app.post("/register", response_model=UserResponse)
def register_user(user: UserCreate):
    return crud.create_user(user)

@app.post("/login", response_model=UserResponse)
def login_user(login_data: UserLogin):
    return crud.authenticate_user(login_data)


@app.get("/users", response_model=List[UserResponse])
def get_users():
    return crud.get_users()

@app.get("/users/search", response_model=List[UserResponse])
def search_users(q: str):
    return crud.search_users(q)

@app.patch("/users/{id}/status", response_model=UserResponse)
def update_status(id: str, status: StatusUpdate):
    try:
        return crud.update_user_status(id, status.online)
    except Exception as e:
        raise HTTPException(status_code=404, detail="User not found")

@app.patch("/users/{id}/avatar", response_model=UserResponse)
async def update_avatar(id: str, file: UploadFile = File(...)):
    """Upload a new profile picture. Returns updated user."""
    allowed = {"image/jpeg", "image/png", "image/gif", "image/webp"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Unsupported image type")
    data = await file.read()
    if len(data) > 3 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Avatar too large (max 3 MB)")
    b64 = base64.b64encode(data).decode()
    data_url = f"data:{file.content_type};base64,{b64}"
    return crud.update_user_avatar(id, data_url)

# --- Image Upload ---

@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """Accept an image, return a base64 data-URL so no external storage needed."""
    allowed = {"image/jpeg", "image/png", "image/gif", "image/webp"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Unsupported image type")
    if file.size and file.size > 5 * 1024 * 1024:  # 5 MB guard
        raise HTTPException(status_code=400, detail="Image too large (max 5 MB)")
    data = await file.read()
    b64 = base64.b64encode(data).decode()
    data_url = f"data:{file.content_type};base64,{b64}"
    return {"url": data_url}

# --- Messages ---

@app.post("/messages", response_model=MessageResponse)
async def send_message(msg: MessageCreate):
    try:
        msg_data = crud.create_message(msg)
        
        # jsonable_encoder converts datetime -> ISO string so send_json doesn't crash
        ws_event = {
            "type": "new_message",
            "data": jsonable_encoder(msg_data)
        }
        await manager.send_personal_message(ws_event, msg.receiver_id)
        # Also send to sender so multiple devices could sync, optional
        await manager.send_personal_message(ws_event, msg.sender_id)
        
        return msg_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send message: {str(e)}")

# NOTE: /messages/search MUST be declared before /messages/{conversation_id}
# otherwise FastAPI will capture "search" as a conversation_id path param
@app.get("/messages/search", response_model=List[MessageResponse])
def search_messages(q: str):
    return crud.search_messages(q)

@app.get("/messages/{conversation_id}", response_model=List[MessageResponse])
def get_history(conversation_id: str):
    return crud.get_conversation_history(conversation_id)

@app.put("/messages/{message_id}", response_model=MessageResponse)
def update_message(message_id: str, msg_update: MessageUpdate):
    return crud.edit_message(message_id, msg_update.content)

@app.delete("/messages/{message_id}", response_model=MessageResponse)
def delete_message(message_id: str):
    return crud.delete_message(message_id)

# --- WebSocket ---

@app.websocket("/ws/chat/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(user_id, websocket)
    # Update online status
    crud.update_user_status(user_id, True)
    await manager.broadcast({
        "type": "presence",
        "user_id": user_id,
        "online": True
    })
    
    try:
        while True:
            data = await websocket.receive_text()
            event = json.loads(data)
            
            if event.get("type") == "typing":
                receiver_id = event.get("receiver_id")
                if receiver_id:
                    await manager.send_personal_message({
                        "type": "typing",
                        "user_id": user_id
                    }, receiver_id)
                    
    except WebSocketDisconnect:
        manager.disconnect(user_id)
        # Update offline status
        crud.update_user_status(user_id, False)
        await manager.broadcast({
            "type": "presence",
            "user_id": user_id,
            "online": False
        })
