from pymongo import MongoClient
from app.config import MONGODB_URL, DATABASE_NAME

client = MongoClient(MONGODB_URL)
db = client[DATABASE_NAME]

# Collections
users_collection = db["users"]
analysis_collection = db["analysis_history"]

# Create indexes
users_collection.create_index("email", unique=True)
analysis_collection.create_index("user_id")
analysis_collection.create_index("timestamp")

def get_db():
    return db
