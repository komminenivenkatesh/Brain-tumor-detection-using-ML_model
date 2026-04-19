# MongoDB Connection Setup Guide

## Current Configuration

Your project is already configured with MongoDB support!

- **Database**: `brain_tumor_db`
- **Collections**:
  - `users` - User accounts and authentication
  - `analysis_history` - MRI analysis records

## ⚡ Quick Setup Options

Choose one of these options to connect MongoDB:

---

## Option 1: MongoDB Atlas (Cloud) - Recommended ⭐

### Steps:

1. **Create Free Account**
   - Go to: https://www.mongodb.com/cloud/atlas
   - Click "Register"
   - Sign up with email or Google

2. **Create a Cluster**
   - In dashboard, click "Create Deployment"
   - Select "Free Tier" (M0)
   - Choose region (select closest to you)
   - Click "Create Deployment"

3. **Create Database User**
   - In "Security" → "Database Access"
   - Click "Add New Database User"
   - Username: `braintumor_user`
   - Password: Create a strong password (save it!)
   - Click "Add User"

4. **Whitelist IP**
   - In "Security" → "Network Access"
   - Click "Add IP Address"
   - Add: `0.0.0.0/0` (allows access from anywhere)
   - Click "Confirm"

5. **Get Connection String**
   - In "Deployment" → "Databases"
   - Click "Connect" button
   - Select "Drivers"
   - Copy the connection string (MongoDB URI)
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/brain_tumor_db?retryWrites=true&w=majority`

6. **Update `.env` File**
   ```
   MONGODB_URL=mongodb+srv://braintumor_user:YOUR_PASSWORD@cluster.mongodb.net/brain_tumor_db?retryWrites=true&w=majority
   ```
   Replace:
   - `braintumor_user` - Your database username
   - `YOUR_PASSWORD` - Your database password
   - `cluster` - Your cluster name

7. **Restart Backend**
   ```powershell
   cd web_app/backend
   python run_server.py
   ```

---

## Option 2: Local MongoDB Installation

### Windows:

1. **Download MongoDB**
   - Go to: https://www.mongodb.com/try/download/community
   - Download "MongoDB Community Server"
   - Download MSI installer (current version)

2. **Install MongoDB**
   - Run the MSI installer
   - Choose "Complete" installation
   - Select "Install MongoDB as a Service"
   - Click "Install"

3. **MongoDB Service**
   ```powershell
   # Start MongoDB service (automatic if installed as service)
   # Or manually:
   
   # Start MongoDB
   mongod
   
   # Or if installed as service
   net start MongoDB
   ```

4. **Verify Installation**
   ```powershell
   # Open new terminal
   mongo --version
   # Should show MongoDB version
   ```

5. **`.env` Configuration**
   ```
   MONGODB_URL=mongodb://localhost:27017
   ```
   (This is already the default)

6. **Restart Backend**
   ```powershell
   cd web_app/backend
   python run_server.py
   ```

### macOS:

```bash
# Install using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify
mongo --version
```

### Linux (Ubuntu):

```bash
# Import GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list

# Install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start service
sudo systemctl start mongod

# Enable on startup
sudo systemctl enable mongod

# Verify
mongosh --version
```

---

## Option 3: Docker MongoDB (Easiest Local Setup)

### Prerequisites:
- Docker installed: https://www.docker.com/

### Steps:

1. **Pull MongoDB Image**
   ```powershell
   docker pull mongo:latest
   ```

2. **Run MongoDB Container**
   ```powershell
   docker run -d `
     --name brain-tumor-mongodb `
     -p 27017:27017 `
     -e MONGO_INITDB_ROOT_USERNAME=admin `
     -e MONGO_INITDB_ROOT_PASSWORD=password123 `
     mongo:latest
   ```

3. **Update `.env`**
   ```
   MONGODB_URL=mongodb://admin:password123@localhost:27017/brain_tumor_db?authSource=admin
   ```

4. **Verify Connection**
   ```powershell
   docker exec -it brain-tumor-mongodb mongosh -u admin -p password123
   ```

5. **Stop Container**
   ```powershell
   docker stop brain-tumor-mongodb
   ```

6. **Start Container**
   ```powershell
   docker start brain-tumor-mongodb
   ```

---

## Testing MongoDB Connection

### Method 1: Using MongoDB Compass (GUI)

1. **Download MongoDB Compass**
   - Go to: https://www.mongodb.com/products/compass
   - Download and install

2. **Connect**
   - Paste your connection string into Compass
   - Click "Connect"
   - Browse your `brain_tumor_db` database

### Method 2: API Health Check

```powershell
# Verify backend is running
curl http://127.0.0.1:8000/api/advanced/health
```

### Method 3: Python Script

Create a test file: `test_mongodb_connection.py`

```python
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")

try:
    client = MongoClient(MONGODB_URL)
    # Test connection
    client.admin.command('ping')
    print("✅ MongoDB connection successful!")
    
    # List databases
    databases = client.list_database_names()
    print(f"📊 Databases: {databases}")
    
    # Get our database
    db = client["brain_tumor_db"]
    collections = db.list_collection_names()
    print(f"📁 Collections: {collections}")
    
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")
```

Run it:
```powershell
cd web_app/backend
python test_mongodb_connection.py
```

---

## Database Collections

### Users Collection
```json
{
  "_id": ObjectId,
  "username": "string",
  "email": "string (unique)",
  "hashed_password": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Analysis History Collection
```json
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "image_path": "string",
  "analysis_result": {
    "classification": "string",
    "confidence": "float",
    "tumor_volume": "float"
  },
  "timestamp": "datetime",
  "status": "string"
}
```

---

## Environment Variables

Update `web_app/backend/.env`:

```env
# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017
# OR for Atlas:
# MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/brain_tumor_db

# Security
SECRET_KEY=your-secret-key-change-in-production

# Image Processing
PIXEL_SPACING_CM=0.1
```

---

## Troubleshooting

### Connection Refused (localhost:27017)

**Problem**: Cannot connect to MongoDB on localhost

**Solution**:
1. Check if MongoDB service is running
2. Windows: `netstat -ano | findstr :27017`
3. Verify MONGODB_URL in `.env`
4. Restart MongoDB service

### Authentication Failed

**Problem**: AuthenticationError connecting to MongoDB

**Solution**:
1. Verify username and password in connection string
2. Ensure database user has correct permissions
3. Check IP whitelist in MongoDB Atlas
4. Test credentials in MongoDB Compass first

### Connection Timeout

**Problem**: Timeout waiting for MongoDB

**Solution**:
1. Check internet connection (for Atlas)
2. Verify firewall settings
3. Check IP whitelist (Atlas): add `0.0.0.0/0`
4. Increase timeout in connection string

### Database Already Exists

**Problem**: "Database already exists" error

**Solution**:
This is normal if running tests multiple times. MongoDB will reuse existing database.

---

## Production Checklist

Before deploying to production:

- [ ] Use strong password for database user
- [ ] Update `SECRET_KEY` in `.env`
- [ ] Restrict IP whitelist (don't use 0.0.0.0/0)
- [ ] Enable MongoDB encryption at rest
- [ ] Set up automated backups
- [ ] Enable authentication in MongoDB
- [ ] Use HTTPS for connections
- [ ] Store `.env` securely (never commit to git)

---

## Useful MongoDB Commands

### Using MongoDB Shell (mongosh)

```javascript
// Connect to database
use brain_tumor_db

// List collections
show collections

// Find all users
db.users.find()

// Find user by email
db.users.findOne({ email: "user@example.com" })

// Count documents
db.analysis_history.countDocuments()

// Delete all analysis history
db.analysis_history.deleteMany({})

// Create index
db.users.createIndex({ email: 1 }, { unique: true })

// Drop collection
db.users.drop()
```

---

## Next Steps

1. ✅ Choose MongoDB setup (Atlas/Local/Docker)
2. ✅ Configure MONGODB_URL in `.env`
3. ✅ Test connection using one of the methods above
4. ✅ Restart backend API
5. ✅ Start using the application

---

## Support Resources

- **MongoDB Docs**: https://docs.mongodb.com
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
- **MongoDB Compass**: https://www.mongodb.com/products/compass
- **PyMongo Docs**: https://pymongo.readthedocs.io

---

**Your Brain Tumor Detection application is MongoDB-ready!** 🎉
