# VibeChat - Real-Time Chat Application

A modern, scalable real-time chat platform built for the Vibe Coding Final Project.

## Short Description
VibeChat is a full-stack chat application that allows users to register, discover friends, and communicate in real-time. It features a sleek dark-mode UI, secure authentication, and lightning-fast message delivery via WebSockets.

## Features List
- **User Management:** Secure Registration/Login, User Listing, and User Search.
- **Messaging:** Real-time send/receive, Chat history retrieval, and Message searching.
- **Additional Features included:** 
  - Dark mode support
  - Online/offline presence indicators
  - Live typing indicators
  - Auto-generated Profile Pictures
  - Edit and Soft-Delete messages
  - Fully responsive design

## Tech Stack
**Frontend:** React, TypeScript, Tailwind CSS, Vite, Framer Motion
**Backend:** Python, FastAPI, WebSockets, Passlib (Bcrypt)
**Database:** Firebase Firestore (NoSQL)

## How to Run Locally

### 1. Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate   # (On Windows)
pip install -r requirements.txt
uvicorn main:app --reload
```
*Note: Ensure `firebase-service-account.json` is placed in the backend folder.*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:5174` in your browser.

## Links
- **Live Website:** [https://chat-web-umber-omega.vercel.app](https://chat-web-umber-omega.vercel.app)
- **YouTube Demo Video:**  https://youtu.be/__jRRNiqp3I

## Screenshots
*(Add your screenshots here before submitting)*
