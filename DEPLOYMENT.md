# EchoReader AI Deployment Guide (Vercel + VPS Hybrid Setup)

This guide details how to deploy the Next.js web application to **Vercel** and host the backend Fastify API, PostgreSQL, Redis, Meilisearch, and Qdrant containers on a cloud **VPS** (virtual private server).

---

## 1. Vercel Frontend Deployment

Vercel automatically detects npm monorepos and workspaces. 

### Step-by-Step Vercel Setup:
1. Log in to your [Vercel Dashboard](https://vercel.com/) and click **Add New Project**.
2. Connect your GitHub repository `nageshmethre/EchoReader-AI-`.
3. In the project setup, configure:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `apps/web`
   - **Build Command**: `next build`
   - **Output Directory**: `.next`
4. Add the following **Environment Variable** in Vercel:
   - `NEXT_PUBLIC_API_URL`: `https://api.echoreader.ai.stream-in.app`
5. Click **Deploy**. Vercel will build the frontend and serve it on a secure `https://*.vercel.app` domain.

### Custom Domain on Vercel:
- Go to Project Settings -> **Domains** in Vercel.
- Add `echoreader.ai.stream-in.app`.
- Vercel will guide you to set a `CNAME` record pointing `echoreader.ai.stream-in.app` to `cname.vercel-dns.com`.

---

## 2. VPS Backend Deployment (Fastify, DB, Cache)

Deploy the database, Redis, vector database, and Fastify server on your cloud VPS.

### DNS Records (pointing to VPS IP, e.g. `203.0.113.50`):
| Host/Subdomain      | Record Type | Value / Destination | Description |
| ------------------- | ----------- | ------------------- | ----------- |
| `api.echoreader.ai` | `A`         | `203.0.113.50`      | API Gateway |

### VPS Setup:
1. Log into your VPS and clone the repository:
   ```bash
   git clone https://github.com/nageshmethre/EchoReader-AI-.git
   cd EchoReader-AI-
   ```
2. Create your `.env` file at the root:
   ```bash
   cp .env.example .env
   ```
3. Request Let's Encrypt certificates for the API subdomain:
   ```bash
   sudo apt-get install certbot python3-certbot-nginx -y
   sudo certbot certonly --nginx -d api.echoreader.ai.stream-in.app
   ```
4. Copy the Nginx subdomain configuration:
   ```bash
   sudo cp docker/nginx.subdomains.conf /etc/nginx/sites-available/echoreader
   sudo ln -s /etc/nginx/sites-available/echoreader /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```
5. Run the docker-compose stack (running database, redis, search, and the Fastify api container):
   ```bash
   docker-compose up --build -d postgres redis meilisearch qdrant api
   ```
