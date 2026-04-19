# Brain Tumor Detection - Web Application

A professional, AI-powered web application for brain tumor detection using Convolutional Neural Networks (CNN). Built with FastAPI, React, and MongoDB.

## Features

✨ **User Authentication**
- Secure JWT-based authentication
- User registration and login
- Session management

📤 **Image Upload & Analysis**
- Drag-and-drop image upload
- Real-time tumor detection
- Automatic segmentation for positive cases

📊 **Results Visualization**
- Classification results (Tumor/Normal)
- Confidence scores and probability metrics
- Tumor segmentation overlay
- Risk level assessment

📜 **Analysis History**
- Track all past analyses
- Quick access to previous results
- Timeline view of analyses

🔐 **Multi-User Support**
- User-specific data isolation
- Private analysis history
- Secure file storage

## Project Structure

```
web_app/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py         # FastAPI application entry
│   │   ├── config.py       # Configuration settings
│   │   ├── database.py     # MongoDB connection
│   │   ├── models.py       # Pydantic models
│   │   ├── auth.py         # JWT authentication
│   │   ├── ml_model.py     # CNN model inference
│   │   ├── routes_auth.py  # Auth endpoints
│   │   └── routes_analysis.py  # Analysis endpoints
│   ├── uploads/            # Uploaded images storage
│   ├── models/             # Pre-trained model files
│   ├── requirements.txt
│   ├── .env.example
│   └── run_backend.py
│
└── frontend/            # React frontend
    ├── src/
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── Dashboard.jsx
    │   ├── components/
    │   │   ├── Header.jsx
    │   │   ├── UploadPanel.jsx
    │   │   ├── ResultsPanel.jsx
    │   │   └── HistoryPanel.jsx
    │   ├── styles/
    │   │   └── global.css
    │   ├── store.js        # Zustand state management
    │   ├── api.js          # API client
    │   ├── App.jsx
    │   └── main.jsx
    ├── vite.config.js
    ├── package.json
    └── index.html
```

## Prerequisites

- **Python 3.8+** (for backend)
- **Node.js 16+** (for frontend)
- **MongoDB 4.4+** (local or cloud instance)
- **Git**

## Installation

### 1. Backend Setup

#### 1.1 Clone/Navigate to the project
```bash
cd web_app/backend
```

#### 1.2 Create Python virtual environment
```bash
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate
```

#### 1.3 Install dependencies
```bash
pip install -r requirements.txt
```

#### 1.4 Set up environment variables
```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your settings
# SECRET_KEY=your-super-secret-key
# MONGODB_URL=mongodb://localhost:27017
# DATABASE_NAME=brain_tumor_db
```

#### 1.5 Copy model files
```bash
# Copy your pre-trained model files to backend/models/
cp ../BrainTumor/Model/* models/
```

The following files must be present in `backend/models/`:
- `model.json` - Classification model architecture
- `model_weights.h5` - Classification model weights
- `segmented_model.json` - Segmentation model architecture
- `segmented_weights.h5` - Segmentation model weights

#### 1.6 Start MongoDB
```bash
# If MongoDB is installed locally
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URL in .env accordingly
```

#### 1.7 Run the backend
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at http://localhost:8000
API documentation: http://localhost:8000/docs

### 2. Frontend Setup

#### 2.1 Navigate to frontend
```bash
cd web_app/frontend
```

#### 2.2 Install dependencies
```bash
npm install
```

#### 2.3 Start development server
```bash
npm run dev
```

The frontend will be available at http://localhost:5173

## API Endpoints

### Authentication

```
POST   /api/auth/register     - Register new user
POST   /api/auth/login        - Login user
GET    /api/auth/me           - Get current user info
```

### Analysis

```
POST   /api/analysis/predict       - Upload image and predict
GET    /api/analysis/history       - Get analysis history
GET    /api/analysis/analysis/{id} - Get specific analysis
GET    /api/analysis/image/{file}  - Download image/segmentation
```

## Usage Guide

### 1. Register/Login
- Navigate to http://localhost:5173
- Create a new account or login with existing credentials

### 2. Upload Image
- Go to "Upload & Analyze" tab
- Drag and drop or select a brain MRI image
- Click "Analyze Image" button
- Wait 2-5 seconds for results

### 3. View Results
- Classification result (Tumor/Normal)
- Confidence percentage
- Risk level assessment
- Segmentation mask (if tumor detected)

### 4. Check History
- Go to "History" tab
- Click on any past analysis to view details again
- Results are timestamped and sortable

## Configuration

### Database Setup

#### MongoDB Local
```bash
# Install MongoDB Community Edition
# https://docs.mongodb.com/manual/installation/

# Start MongoDB service
mongod
```

#### MongoDB Atlas (Cloud)
```bash
# 1. Create account at https://www.mongodb.com/cloud/atlas
# 2. Create a cluster
# 3. Get connection string
# 4. Update MONGODB_URL in .env:
MONGODB_URL=mongodb+srv://username:password@cluster0.mongodb.net/brain_tumor_db?retryWrites=true&w=majority
```

### Security Settings

Update these in `backend/.env` for production:

```env
# Change SECRET_KEY to a secure random string
SECRET_KEY=your-production-secret-key-min-32-chars

# Set allowed origins for CORS
ALLOWED_ORIGINS=["https://yourdomain.com"]

# Database connection
MONGODB_URL=your-production-db-url
```

## Model Information

The application uses two CNN models:

### 1. Classification Model
- **Input**: 64×64 grayscale brain MRI image
- **Output**: Binary classification (Normal/Tumor)
- **Architecture**: 2 Conv layers, 2 MaxPool layers, 1 Dense layer
- **Accuracy**: Based on your training results

### 2. Segmentation Model
- **Input**: 64×64 grayscale image
- **Output**: 64×64 segmentation mask
- **Purpose**: Highlight tumor region when detected

## Troubleshooting

### Backend Issues

**Models not loading**
```
Error: FileNotFoundError: model.json not found
Solution: Ensure all model files are in backend/models/ directory
```

**MongoDB connection error**
```
Error: pymongo.errors.ServerSelectionTimeoutError
Solution: 
1. Ensure MongoDB is running (mongod)
2. Check MONGODB_URL in .env
3. Verify network connectivity for MongoDB Atlas
```

**CORS error**
```
Error: Access to XMLHttpRequest blocked by CORS
Solution: Check ALLOWED_ORIGINS in backend/app/config.py
```

### Frontend Issues

**Cannot connect to API**
```
Error: Failed to fetch from http://localhost:8000
Solution:
1. Ensure backend is running on port 8000
2. Check vite.config.js proxy settings
3. Verify CORS headers in backend
```

**Port already in use**
```
Error: Port 5173 is already in use
Solution: Kill the process or use different port:
npm run dev -- --port 3000
```

## Deployment

### Docker Deployment

Create `Dockerfile` in project root:

```dockerfile
FROM node:18 as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

FROM python:3.10
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
COPY --from=frontend-build /app/frontend/dist ./static
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Production Checklist

- [ ] Update SECRET_KEY to random string
- [ ] Set ALLOWED_ORIGINS to production domains
- [ ] Configure production MongoDB connection
- [ ] Set DEBUG=False
- [ ] Configure SSL/HTTPS
- [ ] Set up proper logging
- [ ] Configure automated backups

## Performance Optimization

### Backend
- Model predictions are cached
- Database indexes on frequently queried fields
- Proper pagination for history (20 items default)

### Frontend
- Lazy code splitting with React Router
- Image lazy loading
- CSS modules for scoped styling
- Zustand for lightweight state management

## Security Features

✅ **Password Security**
- Bcrypt hashing with salt
- Minimum 8 characters required
- No plain text storage

✅ **API Security**
- JWT token-based authentication
- Token expiration (30 minutes default)
- Access control on user resources

✅ **File Upload Security**
- File type validation
- File size limits (10MB default)
- User-specific file isolation

✅ **Database Security**
- MongoDB Atlas encryption
- Network access controls
- Index-based optimization

## Future Enhancements

- [ ] Batch image processing
- [ ] Report generation (PDF export)
- [ ] Doctor sharing/collaboration
- [ ] Mobile app
- [ ] Advanced segmentation visualization
- [ ] Multi-model ensemble predictions
- [ ] Real-time WebSocket updates
- [ ] Role-based access control (Admin/Doctor/Patient)

## Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Medical Disclaimer

⚠️ **IMPORTANT**: This application is intended for research and educational purposes only. 

**Disclaimer**: This AI-based analysis is NOT a substitute for professional medical diagnosis. Always consult with qualified medical professionals for accurate diagnosis and treatment recommendations.

## Support

For issues, questions, or suggestions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Contact development team

## Authors

- **Your Name** - Initial development

## Acknowledgments

- TensorFlow/Keras for deep learning framework
- FastAPI for rapid API development
- React for frontend framework
- MongoDB for data persistence
