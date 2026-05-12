import os
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase Admin SDK
# Ensure you have the firebase-service-account.json in the backend directory
# or set the FIREBASE_PROJECT_ID if using default credentials in GCP
try:
    if not firebase_admin._apps:
        cred = credentials.Certificate('firebase-service-account.json')
        firebase_admin.initialize_app(cred)
except Exception as e:
    print(f"Warning: Could not initialize Firebase with certificate. {e}")
    # Fallback for testing/default
    if not firebase_admin._apps:
        firebase_admin.initialize_app()

db = firestore.client()
