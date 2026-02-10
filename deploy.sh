#!/bin/bash

# El Trinche POS - Deployment Script
# Replaces docker-compose due to version incompatibility on VPS

echo "🚀 Starting Deployment..."

# 1. Update Code
echo "📥 Pulling latest changes..."
git pull origin main

# 2. Network Setup
echo "🌐 Ensuring network exists..."
docker network create qpos-net 2>/dev/null || true

# 3. Backend Deployment
echo "⚙️ Deploying Backend..."
docker stop qpos-backend 2>/dev/null
docker rm qpos-backend 2>/dev/null
docker build -t qpos-backend ./backend
docker run -d \
  --name qpos-backend \
  --network qpos-net \
  --restart always \
  -v $(pwd)/backend/data:/app/data \
  -e PORT=4000 \
  qpos-backend

# 4. Frontend Deployment
echo "🎨 Deploying Frontend..."
docker stop qpos-frontend 2>/dev/null
docker rm qpos-frontend 2>/dev/null
docker build -t qpos-frontend ./frontend
docker run -d \
  --name qpos-frontend \
  --network qpos-net \
  --restart always \
  qpos-frontend

# 5. Nginx Deployment
echo "door Deploying Nginx..."
docker stop qpos-nginx 2>/dev/null
docker rm qpos-nginx 2>/dev/null
docker run -d \
  --name qpos-nginx \
  --network qpos-net \
  --restart always \
  -p 8888:80 \
  -v $(pwd)/nginx/nginx.conf:/etc/nginx/nginx.conf:ro \
  nginx:alpine

echo "✅ Deployment Complete!"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
