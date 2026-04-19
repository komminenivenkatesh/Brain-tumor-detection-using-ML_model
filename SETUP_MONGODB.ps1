# MongoDB Quick Setup Script
# This script helps you configure MongoDB for the Brain Tumor Detection project

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  MongoDB Setup Assistant" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Menu
Write-Host "Choose MongoDB Setup Option:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1) Local MongoDB (Windows)" -ForegroundColor Green
Write-Host "2) MongoDB Atlas (Cloud - Recommended)" -ForegroundColor Green
Write-Host "3) Docker MongoDB" -ForegroundColor Green
Write-Host "4) Test Current Connection" -ForegroundColor Green
Write-Host "5) Exit" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "Enter your choice (1-5)"

$envFile = "web_app/backend/.env"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "=== Local MongoDB Setup ===" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Download MongoDB Community Edition:" -ForegroundColor Yellow
        Write-Host "  https://www.mongodb.com/try/download/community" -ForegroundColor Blue
        Write-Host ""
        Write-Host "Installation Steps:" -ForegroundColor Yellow
        Write-Host "1. Download MongoDB Community Server MSI"
        Write-Host "2. Run the installer"
        Write-Host "3. Choose 'Complete' installation"
        Write-Host "4. Select 'Install MongoDB as a Service'"
        Write-Host "5. Click Install"
        Write-Host ""
        Write-Host "After installation, MongoDB will run automatically."
        Write-Host "Your .env is already configured for local MongoDB:" -ForegroundColor Green
        Write-Host "  MONGODB_URL=mongodb://localhost:27017" -ForegroundColor Green
        Write-Host ""
        Read-Host "Press Enter to continue"
    }
    "2" {
        Write-Host ""
        Write-Host "=== MongoDB Atlas Cloud Setup ===" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Steps to get your connection string:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "1. Visit: https://www.mongodb.com/cloud/atlas" -ForegroundColor Blue
        Write-Host "2. Sign up for a free account"
        Write-Host "3. Create a FREE tier cluster (M0)"
        Write-Host "4. Create a database user:"
        Write-Host "   - Go to Security > Database Access"
        Write-Host "   - Click 'Add New Database User'"
        Write-Host "   - Username: braintumor_user"
        Write-Host "   - Password: (create strong password)"
        Write-Host "5. Whitelist your IP:"
        Write-Host "   - Go to Security > Network Access"
        Write-Host "   - Add your IP or 0.0.0.0/0"
        Write-Host "6. Get connection string:"
        Write-Host "   - Click 'Deployment' > 'Databases' > 'Connect'"
        Write-Host "   - Select 'Drivers' (not 'MongoDB Compass')"
        Write-Host "   - Copy the connection string"
        Write-Host ""
        
        $connectionString = Read-Host "Paste your MongoDB Atlas connection string"
        
        if ($connectionString) {
            # Update .env with MongoDB Atlas
            $envContent = Get-Content $envFile
            $envContent = $envContent -replace "MONGODB_URL=.*", "MONGODB_URL=$connectionString"
            Set-Content $envFile $envContent
            
            Write-Host ""
            Write-Host "✅ MongoDB Atlas connection configured!" -ForegroundColor Green
            Write-Host "   Connection string saved to $envFile" -ForegroundColor Green
        }
        else {
            Write-Host "❌ No connection string provided" -ForegroundColor Red
        }
        
        Write-Host ""
        Read-Host "Press Enter to continue"
    }
    "3" {
        Write-Host ""
        Write-Host "=== Docker MongoDB Setup ===" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Prerequisites: Docker must be installed" -ForegroundColor Yellow
        Write-Host "Download: https://www.docker.com/products/docker-desktop" -ForegroundColor Blue
        Write-Host ""
        
        Write-Host "Running Docker setup..." -ForegroundColor Green
        Write-Host ""
        Write-Host "Pull MongoDB image..." -ForegroundColor Yellow
        docker pull mongo:latest
        
        Write-Host ""
        Write-Host "Starting MongoDB container..." -ForegroundColor Yellow
        docker run -d `
          --name brain-tumor-mongodb `
          -p 27017:27017 `
          -e MONGO_INITDB_ROOT_USERNAME=admin `
          -e MONGO_INITDB_ROOT_PASSWORD=password123 `
          mongo:latest
        
        Write-Host ""
        Write-Host "✅ MongoDB Docker container started!" -ForegroundColor Green
        Write-Host "   Container name: brain-tumor-mongodb" -ForegroundColor Green
        Write-Host "   Username: admin" -ForegroundColor Green
        Write-Host "   Password: password123" -ForegroundColor Green
        Write-Host ""
        
        # Update .env for Docker
        $envContent = Get-Content $envFile
        $envContent = $envContent -replace "MONGODB_URL=.*", "MONGODB_URL=mongodb://admin:password123@localhost:27017/brain_tumor_db?authSource=admin"
        Set-Content $envFile $envContent
        
        Write-Host "✅ Docker connection configured in $envFile" -ForegroundColor Green
        Write-Host ""
        Write-Host "Useful Docker commands:" -ForegroundColor Yellow
        Write-Host "  Start:   docker start brain-tumor-mongodb"
        Write-Host "  Stop:    docker stop brain-tumor-mongodb"
        Write-Host "  Logs:    docker logs brain-tumor-mongodb"
        Write-Host "  Shell:   docker exec -it brain-tumor-mongodb mongosh -u admin -p password123"
        Write-Host ""
        Read-Host "Press Enter to continue"
    }
    "4" {
        Write-Host ""
        Write-Host "=== Testing MongoDB Connection ===" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Running connection test..." -ForegroundColor Yellow
        Write-Host ""
        
        # Run the test script
        python test_mongodb_connection.py
        
        Write-Host ""
        Read-Host "Press Enter to continue"
    }
    "5" {
        Write-Host ""
        Write-Host "Exiting MongoDB Setup Assistant" -ForegroundColor Green
        exit
    }
    default {
        Write-Host "Invalid choice. Exiting." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Verify your MongoDB instance is running"
Write-Host "2. Run connection test: python test_mongodb_connection.py"
Write-Host "3. Restart the backend: cd web_app/backend && python run_server.py"
Write-Host "4. Your backend will now persist data to MongoDB"
Write-Host ""
