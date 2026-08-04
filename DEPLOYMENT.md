# EchoReader AI Subdomain Deployment Guide (stream-in.app)

This guide details cloud deployment instructions using distinct subdomains for the Next.js web client (`app.stream-in.app`) and Fastify backend API server (`api.stream-in.app`).

---

## 1. Domain Name System (DNS) Configuration

Add the following `A Records` to your DNS provider (e.g. Cloudflare, Route 53, GoDaddy) pointing to your target cloud server IP (e.g. `203.0.113.50`):

| Host/Subdomain | Record Type | Value / Destination | Tooltip / Description |
| -------------- | ----------- | ------------------- | --------------------- |
| `app`          | `A`         | `203.0.113.50`      | Web application entry |
| `api`          | `A`         | `203.0.113.50`      | API Gateway endpoint  |

---

## 2. Environment Variables Configuration

Update your production `.env` configuration file at the server root:

```ini
# Production URLs config
API_URL=https://api.stream-in.app
WEB_URL=https://app.stream-in.app

# Production Server port listeners
PORT=3001
HOST=0.0.0.0
NODE_ENV=production
```

---

## 3. SSL Certificate Setup (Let's Encrypt & Certbot)

Install Certbot and request certificates on your hosting server:

```bash
# Install Certbot and Nginx extension
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx -y

# Generate SSL certificates for both subdomains
sudo certbot certonly --nginx -d app.stream-in.app -d api.stream-in.app
```

---

## 4. Nginx Reverse Proxy Setup

1. Copy the custom configuration:
   ```bash
   sudo cp docker/nginx.subdomains.conf /etc/nginx/sites-available/echoreader
   ```
2. Enable the site configuration:
   ```bash
   sudo ln -s /etc/nginx/sites-available/echoreader /etc/nginx/sites-enabled/
   ```
3. Test Nginx syntax correctness and reload the process:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

---

## 5. Docker Compose Startup

With domains and reverse-proxies active, launch the production containers stack:

```bash
docker-compose up --build -d
```
