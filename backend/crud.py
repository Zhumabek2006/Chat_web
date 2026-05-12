from firebase_config import db
from schemas import UserCreate, UserLogin, MessageCreate
from datetime import datetime, timezone
from google.cloud.firestore_v1.base_query import FieldFilter
from fastapi import HTTPException
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_conversation_id(user1: str, user2: str) -> str:
    return "_".join(sorted([user1, user2]))

def create_user(user: UserCreate):
    users_ref = db.collection('users')
    # Check uniqueness
    existing = users_ref.where(filter=FieldFilter('username', '==', user.username)).limit(1).get()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    doc_ref = users_ref.document()
    user_data = {
        "id": doc_ref.id,
        "username": user.username,
        "password": get_password_hash(user.password),
        "created_at": datetime.now(timezone.utc),
        "online": True,
        "avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={user.username}",
        "last_seen": datetime.now(timezone.utc)
    }
    doc_ref.set(user_data)
    
    # Return data without password
    return {k: v for k, v in user_data.items() if k != "password"}

def authenticate_user(login_data: UserLogin):
    users_ref = db.collection('users')
    existing = users_ref.where(filter=FieldFilter('username', '==', login_data.username)).limit(1).get()
    
    if not existing:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    user_dict = existing[0].to_dict()
    
    if not verify_password(login_data.password, user_dict.get('password', '')):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
        
    return {k: v for k, v in user_dict.items() if k != "password"}

def get_users():
    users_ref = db.collection('users')
    return [{k: v for k, v in doc.to_dict().items() if k != "password"} for doc in users_ref.stream()]

def search_users(query: str):
    # Firestore doesn't have native partial text search easily without external tools, 
    # but we can do a naive prefix search or fetch all and filter for simplicity in a small app.
    users = get_users()
    return [u for u in users if query.lower() in u.get('username', '').lower()]

def update_user_status(user_id: str, online: bool):
    doc_ref = db.collection('users').document(user_id)
    doc_ref.update({
        "online": online,
        "last_seen": datetime.now(timezone.utc)
    })
    user_dict = doc_ref.get().to_dict()
    # Never expose the hashed password to the caller
    return {k: v for k, v in user_dict.items() if k != "password"}

def create_message(msg: MessageCreate):
    msgs_ref = db.collection('messages')
    doc_ref = msgs_ref.document()
    conv_id = get_conversation_id(msg.sender_id, msg.receiver_id)
    
    msg_data = {
        "id": doc_ref.id,
        "sender_id": msg.sender_id,
        "receiver_id": msg.receiver_id,
        "content": msg.content,
        "timestamp": datetime.now(timezone.utc),
        "edited": False,
        "deleted": False,
        "conversation_id": conv_id
    }
    doc_ref.set(msg_data)
    return msg_data

def get_conversation_history(conversation_id: str):
    msgs_ref = db.collection('messages')
    # Avoid Firestore composite index requirement by sorting in Python
    docs = msgs_ref.where(filter=FieldFilter('conversation_id', '==', conversation_id)).stream()
    messages = [doc.to_dict() for doc in docs]
    return sorted(messages, key=lambda m: m.get('timestamp') or '')

def search_messages(query_str: str):
    # Fetch all and filter (inefficient for prod without Algolia/Elasticsearch, but works for exam project)
    msgs_ref = db.collection('messages')
    msgs = [doc.to_dict() for doc in msgs_ref.stream()]
    return [m for m in msgs if query_str.lower() in m.get('content', '').lower()]

def edit_message(msg_id: str, new_content: str):
    doc_ref = db.collection('messages').document(msg_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Message not found")
    
    doc_ref.update({
        "content": new_content,
        "edited": True
    })
    return doc_ref.get().to_dict()

def delete_message(msg_id: str):
    doc_ref = db.collection('messages').document(msg_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Message not found")
    
    doc_ref.update({
        "deleted": True,
        "content": "This message was deleted."
    })
    return doc_ref.get().to_dict()
