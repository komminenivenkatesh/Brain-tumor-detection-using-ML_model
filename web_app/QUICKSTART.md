# Quick Start Guide - Brain Tumor Detection Web App

Get up and running in 5 minutes!

## Prerequisites Checklist

Before starting, ensure you have:
- ✅ Python 3.8 or higher
- ✅ Node.js 16 or higher  
- ✅ MongoDB installed or MongoDB Atlas account
- ✅ Your trained model files (model.json, model_weights.h5, segmented_model.json, segmented_weights.h5)

## Step 1: Backend Setup (3 minutes)

### Terminal 1 - Backend

```bash
# Navigate to backend
cd web_app/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env and set:
# - SECRET_KEY=your-secret-key-here
# - MONGODB_URL=mongodb://localhost:27017
```

### Copy Model Files

```bash
# Copy your pre-trained models to the models directory
cp ../BrainTumor/Model/model.json models/
cp ../BrainTumor/Model/model_weights.h5 models/
cp ../BrainTumor/Model/segmented_model.json models/
cp ../BrainTumor/Model/segmented_weights.h5 models/
```

### Start Backend

```bash
# Still in web_app/backend directory
python -m uvicorn app.main:app --reload --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

## Step 2: Frontend Setup (2 minutes)

### Terminal 2 - Frontend

```bash
# Open new terminal, navigate to frontend
cd web_app/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Expected output:
```
  VITE v5.0.8  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Press q to quit
```

## Step 3: Start MongoDB

### Terminal 3 - MongoDB

**Option A: Local MongoDB**
```bash
# Simply run mongod
mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Already configured in `.env` file
- No additional setup needed

Expected output:
```
{"msg":"Waiting for connections","attr":{"port":27017}}
```

## Step 4: Access the Application

Open your browser and go to:
```
http://localhost:5173
```

You should see the Login page.

## First Steps in the App

### 1. Create Account
1. Click "Create Account"
2. Enter:
   - Full Name: Dr. Your Name
   - Email: your@email.com
   - Password: (min 8 characters)
3. Click "Create Account"
4. Automatically redirected to Dashboard

### 2. Upload and Analyze
1. You're now in the Dashboard
2. In "Upload & Analyze" tab:
   - Drag and drop a brain MRI image OR
   - Click to browse and select an image
3. Click "🔍 Analyze Image"
4. Wait 2-5 seconds
5. Results appear instantly

### 3. View Results
1. See classification result (Tumor/Normal)
2. View confidence percentage
3. See risk level and probabilities
4. If tumor detected, see segmentation mask

### 4. Check History
1. Click "History" tab
2. See all past analyses
3. Click on any analysis to view details again

## Useful API Endpoints

Test these in your browser or with tools like Postman:

```
# Health check
http://localhost:8000/health

# API documentation (Swagger UI)
http://localhost:8000/docs

# API documentation (ReDoc)
http://localhost:8000/redoc
```

## Troubleshooting

### "Cannot connect to MongoDB"
```
Solution: Make sure mongod is running in Terminal 3
Run: mongod
```

### "Port 8000 already in use"
```
Solution: Change backend port in Terminal 1:
python -m uvicorn app.main:app --port 8001
```

### "Port 5173 already in use"
```
Solution: Change frontend port in Terminal 2:
npm run dev -- --port 3000
```

### "Models not loading"
```
Solution: Check models are in web_app/backend/models/
Required files:
- model.json
- model_weights.h5
- segmented_model.json
- segmented_weights.h5
```

### "CORS Error"
```
Solution: Ensure backend is running before frontend
Check all 3 services are running:
1. Terminal 1: Backend (port 8000)
2. Terminal 2: Frontend (port 5173)
3. Terminal 3: MongoDB (port 27017)
```

## File Structure Reminder

```
web_app/
├── backend/
│   ├── app/
│   ├── models/         ← Copy your model files here
│   ├── uploads/        ← Uploaded images go here
│   ├── requirements.txt
│   └── .env            ← Your config file
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Common Commands

### Backend
```bash
# From web_app/backend:
source venv/bin/activate        # Activate venv (macOS/Linux)
venv\Scripts\activate           # Activate venv (Windows)
pip install -r requirements.txt # Install packages
python -m uvicorn app.main:app --reload --port 8000  # Start server
deactivate                      # Exit venv
```

### Frontend
```bash
# From web_app/frontend:
npm install                     # Install packages
npm run dev                     # Start dev server
npm run build                   # Build for production
npm run preview                 # Preview production build
```

## Next Steps

1. **Test the app**: Upload a test brain MRI image
2. **Check database**: View MongoDB collections created
3. **Explore API**: Visit http://localhost:8000/docs
4. **Read full docs**: See README.md for detailed information
5. **Customize**: Modify colors, text, features as needed

## Performance Notes

- First model load: 10-15 seconds
- Subsequent predictions: 2-5 seconds each
- Frontend loads instantly
- Database queries: <100ms

## Important: Medical Disclaimer

⚠️ **This app is for research/educational purposes only!**

Always consult qualified medical professionals for diagnosis and treatment. This AI analysis is NOT medical advice.

---

**Enjoy your Brain Tumor Detection Web App! 🎉**

Need help? Check the full README.md or create a GitHub issue.
