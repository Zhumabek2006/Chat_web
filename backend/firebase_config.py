import os
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase Admin SDK
try:
    if not firebase_admin._apps:
        # Check if running on Render (Render mounts secret files to /etc/secrets by default)
        # or use local path
        cert_path = '/etc/secrets/firebase-service-account.json' if os.path.exists('/etc/secrets/firebase-service-account.json') else 'firebase-service-account.json'
        cred = credentials.Certificate(cert_path)
        firebase_admin.initialize_app(cred)
except Exception as e:
    print(f"Warning: Could not initialize Firebase with certificate. {e}")
    # Fallback for testing/default
    if not firebase_admin._apps:
        firebase_admin.initialize_app()

db = firestore.client()
