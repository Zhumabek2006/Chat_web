# VibeChat Backend

A real-time scalable chat backend built with FastAPI, Firebase Firestore, and WebSockets.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Firebase Setup**
   - Go to the Firebase Console and create a new project.
   - Set up a Firestore Database.
   - Go to Project Settings -> Service Accounts, and generate a new private key.
   - Save the downloaded file as `firebase-service-account.json` in the `backend/` directory.

3. **Running the Server**
   ```bash
   uvicorn main:app --reload
   ```

4. **API Documentation**
   FastAPI automatically generates documentation:
   - Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

## Features list
- User Management & Authentication (Mocked via ID references schema)
- Realtime messaging using WebSockets
- Soft delete functionality for messages
- Real-time typing indicators
- Online / Offline presence detection
