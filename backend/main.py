from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import crud
from schemas import UserCreate, UserResponse, UserLogin, MessageCreate, MessageResponse, MessageUpdate, StatusUpdate
from websocket_manager import manager
import json

app = FastAPI(title="VibeChat API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
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

@app.post("/users", response_model=UserResponse)
def register_user(user: UserCreate):
    return crud.create_user(user)

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

# --- Messages ---

@app.post("/messages", response_model=MessageResponse)
async def send_message(msg: MessageCreate):
    msg_data = crud.create_message(msg)
    
    # Broadcast to receiver if online
    ws_event = {
        "type": "new_message",
        "data": msg_data
    }
    await manager.send_personal_message(ws_event, msg.receiver_id)
    # Also send to sender so multiple devices could sync, optional
    await manager.send_personal_message(ws_event, msg.sender_id)
    
    return msg_data

@app.get("/messages/{conversation_id}", response_model=List[MessageResponse])
def get_history(conversation_id: str):
    return crud.get_conversation_history(conversation_id)

@app.get("/messages/search", response_model=List[MessageResponse])
def search_messages(q: str):
    return crud.search_messages(q)

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
