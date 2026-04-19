@echo off
cd /d "d:\Brain-tumor-detection-of-MRI-images-using-CNN-main"

REM Set full path to git
set GIT="C:\Program Files\Git\bin\git.exe"

REM Initialize git repo
%GIT% init

REM Configure git user
%GIT% config user.name "Brain Tumor Detection"
%GIT% config user.email "dev@braintumor.local"

REM Add remote
%GIT% remote add origin https://github.com/yedma-raju/Brain-tumor-detection-of-MRI-images-using-CNN.git

REM Stage all changed files
%GIT% add web_app/frontend/src/App.jsx
%GIT% add web_app/frontend/src/styles/advanced-features.css
%GIT% add web_app/frontend/src/components/ModelPerformancePanel.jsx

REM Commit with message
%GIT% commit -m "Add Model Performance styling improvements and image loading fixes"

REM Push to GitHub - may require authentication
%GIT% push -u origin main

echo.
echo Push completed! Check your GitHub repository.
pause
