# Deployment Guide

Complete guide for deploying the Brain Tumor Detection Web App to production.

## Pre-Deployment Checklist

### Security
- [ ] Change `SECRET_KEY` in `.env` to a random 32+ character string
- [ ] Set `DEBUG=False` in production
- [ ] Configure `ALLOWED_ORIGINS` with your domain(s)
- [ ] Enable HTTPS/SSL certificate
- [ ] Set strong MongoDB password

### Performance
- [ ] Test models load correctly
- [ ] Verify database indexing
- [ ] Configure CDN for static assets
- [ ] Set up caching headers

### Testing
- [ ] Test all auth flows (register, login, logout)
- [ ] Test image upload with various file sizes
- [ ] Test with actual brain MRI images
- [ ] Performance test with multiple concurrent users
- [ ] Test API endpoints with Postman/curl

## Option 1: Traditional Server (VPS/Ubuntu)

### Prerequisites
- Ubuntu 20.04+ or similar Linux
- Nginx reverse proxy
- Systemd for process management

### Step 1: Server Setup

```bash
# SSH into your server
ssh user@your-server.com

# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3.10 python3-pip nodejs npm mongodb-org nginx git
```

### Step 2: Clone and Setup Backend

```bash
# Clone your repository
git clone <your-repo> /var/www/brain-tumor-app
cd /var/www/brain-tumor-app/web_app/backend

# Create Python virtual environment
python3.10 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create production .env
cat << EOF > .env
SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=brain_tumor_db
EOF

# Copy model files
cp ../../BrainTumor/Model/* models/
```

### Step 3: Setup Systemd Service

```bash
# Create systemd service file
sudo cat << EOF > /etc/systemd/system/brain-tumor-backend.service
[Unit]
Description=Brain Tumor Detection Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/brain-tumor-app/web_app/backend
Environment="PATH=/var/www/brain-tumor-app/web_app/backend/venv/bin"
ExecStart=/var/www/brain-tumor-app/web_app/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 4
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable brain-tumor-backend
sudo systemctl start brain-tumor-backend
sudo systemctl status brain-tumor-backend
```

### Step 4: Setup Frontend

```bash
cd /var/www/brain-tumor-app/web_app/frontend

# Install and build
npm install
npm run build

# Output is in dist/ folder
```

### Step 5: Configure Nginx

```bash
# Create Nginx config
sudo cat << 'EOF' > /etc/nginx/sites-available/brain-tumor
upstream backend {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Certificate (use Let's Encrypt with Certbot)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Static files (Frontend)
    root /var/www/brain-tumor-app/web_app/frontend/dist;
    index index.html;

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, immutable";
    }

    # API proxy
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # API documentation
    location /docs {
        proxy_pass http://backend;
    }

    location /redoc {
        proxy_pass http://backend;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/brain-tumor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Step 7: Setup MongoDB

```bash
# Start MongoDB
sudo systemctl enable mongodb
sudo systemctl start mongodb

# Create database and indexes (optional)
mongosh
> use brain_tumor_db
> db.users.createIndex({ email: 1 }, { unique: true })
> db.analysis_history.createIndex({ user_id: 1 })
> exit
```

### Step 8: Verify Deployment

```bash
# Check services
sudo systemctl status brain-tumor-backend
sudo systemctl status nginx
sudo systemctl status mongodb

# Check logs
sudo journalctl -u brain-tumor-backend -f  # Backend logs
sudo tail -f /var/log/nginx/access.log     # Nginx access
sudo tail -f /var/log/nginx/error.log      # Nginx errors
```

## Option 2: Docker Deployment

### Create Docker Setup

```bash
# In web_app directory, create these files:

# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:5.0
    container_name: brain-tumor-mongodb
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"
    networks:
      - app-network

  backend:
    build: ./backend
    container_name: brain-tumor-backend
    depends_on:
      - mongodb
    environment:
      MONGODB_URL: mongodb://admin:${MONGO_PASSWORD}@mongodb:27017/brain_tumor_db
      SECRET_KEY: ${SECRET_KEY}
    ports:
      - "8000:8000"
    volumes:
      - ./backend/uploads:/app/uploads
    networks:
      - app-network
    restart: always

  frontend:
    build: ./frontend
    container_name: brain-tumor-frontend
    ports:
      - "5173:80"
    depends_on:
      - backend
    networks:
      - app-network
    restart: always

volumes:
  mongodb_data:

networks:
  app-network:
    driver: bridge
```

```bash
# Dockerfile.backend
FROM python:3.10-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
# Dockerfile.frontend
FROM node:18 as builder

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Run Docker Compose

```bash
# Create .env.docker
echo "SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')" > .env.docker
echo "MONGO_PASSWORD=your-secure-password" >> .env.docker

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Option 3: Heroku/Railway/Render Deployment

### Heroku Example

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login

# Create app
heroku create brain-tumor-detection

# Add MongoDB add-on
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')

# Deploy from Git
git push heroku main

# View logs
heroku logs -t
```

## Production Environment Variables

Create `.env` with:

```env
# Security
SECRET_KEY=your-production-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database
MONGODB_URL=mongodb+srv://admin:password@cluster.mongodb.net/brain_tumor_db?retryWrites=true&w=majority
DATABASE_NAME=brain_tumor_db

# API
ALLOWED_ORIGINS=["https://yourdomain.com","https://www.yourdomain.com"]

# Upload
MAX_UPLOAD_SIZE=10485760  # 10MB

# Files
UPLOAD_DIR=/var/app/uploads
MODEL_DIR=/var/app/models
```

## Monitoring & Logging

### Backend Logs
```bash
# Systemd
sudo journalctl -u brain-tumor-backend -f

# Docker
docker logs -f brain-tumor-backend

# File logging
# Configure in app/main.py:
import logging
logging.basicConfig(filename='/var/log/brain-tumor-backend.log')
```

### Database Monitoring
```bash
# MongoDB stats
mongostat --host your-mongodb-host

# Slow query logs
mongod --slowms 100
```

### Nginx Monitoring
```bash
# Access logs
tail -f /var/log/nginx/access.log | grep -v "GET /api" | head -20

# Error logs
tail -f /var/log/nginx/error.log
```

## Performance Tuning

### Backend
```python
# In uvicorn command
--workers 4              # 2-4 x CPU cores
--worker-class uvicorn.workers.UvicornWorker
--max-requests 1000
```

### Database
```
# MongoDB
-  Indexing on user_id and email
- Connection pooling
- Read preference for replicas
```

### Frontend
```
- Enable gzip compression in Nginx
- Cache static assets
- CDN for images
- Lazy load components
```

## Backup Strategy

### MongoDB Backup
```bash
# Daily backup
0 2 * * * mongodump --uri "mongodb://..." --out /backups/$(date +\%Y\%m\%d)

# Weekly backup to S3
0 3 * * 0 aws s3 sync /backups s3://backup-bucket/brain-tumor-db/
```

### File Backup
```bash
# Backup uploaded images
0 4 * * * tar -czf /backups/uploads-$(date +\%Y\%m\%d).tar.gz /var/app/uploads
```

## Scaling Considerations

As user base grows:

1. **Database**: Use MongoDB sharding
2. **Backend**: Use load balancer (Nginx/HAProxy)
3. **Frontend**: Use CDN
4. **Storage**: Migrate to S3/MinIO
5. **Caching**: Add Redis for sessions
6. **Async**: Use Celery for background jobs

## Troubleshooting Production Issues

### High CPU Usage
```bash
# Check running processes
top -b | head -20

# Profile backend
sudo py-spy record -o profile.svg -- uvicorn app.main:app
```

### Database Connection Issues
```bash
# Test MongoDB connection
mongosh "mongodb://localhost:27017" --eval "db.runCommand({ping:1})"

# Check connection pool
db.serverStatus().connections
```

### Memory Leaks
```bash
# Monitor memory usage
watch -n 1 'ps aux | grep uvicorn | grep -v grep'

# Profile memory
pip install memory-profiler
python -m memory_profiler app/main.py
```

## Maintenance Schedule

- **Weekly**: Check logs, verify backups, monitor performance
- **Monthly**: Update dependencies, review security
- **Quarterly**: Performance audit, capacity planning
- **Annually**: Full security audit, disaster recovery test

---

For questions or issues, refer to the main README.md or create an issue in the repository.
