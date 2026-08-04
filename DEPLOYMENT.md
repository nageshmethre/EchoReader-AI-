# EchoReader AI Cloud Deployment Guide

This guide details cloud deployment instructions for production environments.

---

## 1. Multi-Container Orchestration

The simplest production deployment uses Docker Compose:

```bash
# Clone remote repo
git clone https://github.com/nageshmethre/EchoReader-AI-.git
cd EchoReader-AI-

# Update database strings inside .env
nano .env

# Build and start services in the background
docker-compose up --build -d
```

---

## 2. Reverse Proxy Setup (Nginx)

We recommend mapping Nginx to route ports `3000` (Next.js web) and `3001` (Fastify API):

```nginx
server {
    listen 80;
    server_name echoreader.ai;

    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
