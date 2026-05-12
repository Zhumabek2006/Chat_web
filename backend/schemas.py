from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    created_at: datetime
    online: bool
    avatar: Optional[str] = None
    last_seen: Optional[datetime] = None

class StatusUpdate(BaseModel):
    online: bool

class MessageCreate(BaseModel):
    sender_id: str
    receiver_id: str
    content: str
    
class MessageUpdate(BaseModel):
    content: str

class MessageResponse(BaseModel):
    id: str
    sender_id: str
    receiver_id: str
    content: str
    timestamp: datetime
    edited: bool
    deleted: bool
    conversation_id: str
