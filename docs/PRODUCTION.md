# 🏭 Audio Cutter Pro — Production Deployment Guide

> This guide covers deploying Audio Cutter Pro to a production server for real-world use.

---

## 📌 Production Checklist

Before deploying, ensure:

- [ ] Python 3.9+ installed on the server
- [ ] FFmpeg installed on the server
- [ ] A reverse proxy configured (Nginx recommended)
- [ ] A WSGI server configured (Gunicorn recommended)
- [ ] SSL certificate configured (Let's Encrypt)
- [ ] Firewall rules configured
- [ ] Database configured (if using logging)

---

## 1. Server Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| **CPU** | 1 core | 2+ cores |
| **RAM** | 512 MB | 2 GB |
| **Disk** | 5 GB | 20 GB (for temp audio files) |
| **OS** | Ubuntu 20.04+ | Ubuntu 22.04 LTS |
| **Network** | 10 Mbps | 100 Mbps |

---

## 2. Server Setup

### 2.1 — Install System Dependencies

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install python3 python3-pip python3-venv ffmpeg nginx git -y
```

### 2.2 — Create a Dedicated User

```bash
sudo useradd -m -s /bin/bash audiocutter
sudo su - audiocutter
```

### 2.3 — Clone & Set Up the Project

```bash
git clone https://github.com/ArPaN-DS/Audio_Cutter.git
cd Audio_Cutter

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn
```

### 2.4 — Configure Environment

```bash
cp .env.example .env
nano .env  # Set your production values
```

**Important production settings:**
```
FLASK_SECRET_KEY=<generate-a-random-64-char-string>
FLASK_DEBUG=false
```

Generate a secret key:
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

---

## 3. Gunicorn WSGI Server

### 3.1 — Test Gunicorn

```bash
gunicorn --bind 0.0.0.0:5000 app:app
```

### 3.2 — Create Systemd Service

```bash
sudo nano /etc/systemd/system/audiocutter.service
```

Paste the following:

```ini
[Unit]
Description=Audio Cutter Pro — Gunicorn Service
After=network.target

[Service]
User=audiocutter
Group=www-data
WorkingDirectory=/home/audiocutter/Audio_Cutter
Environment="PATH=/home/audiocutter/Audio_Cutter/venv/bin"
ExecStart=/home/audiocutter/Audio_Cutter/venv/bin/gunicorn \
    --workers 3 \
    --timeout 300 \
    --max-requests 1000 \
    --bind unix:audiocutter.sock \
    --access-logfile /home/audiocutter/Audio_Cutter/logs/access.log \
    --error-logfile /home/audiocutter/Audio_Cutter/logs/error.log \
    app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable audiocutter
sudo systemctl start audiocutter
sudo systemctl status audiocutter
```

> **Note:** `--timeout 300` is important because audio processing can take time for large files.

---

## 4. Nginx Reverse Proxy

### 4.1 — Create Nginx Config

```bash
sudo nano /etc/nginx/sites-available/audiocutter
```

Paste:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Change to your domain

    client_max_body_size 500M;  # Match Flask's MAX_CONTENT_LENGTH

    location / {
        proxy_pass http://unix:/home/audiocutter/Audio_Cutter/audiocutter.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;  # For large file processing
    }

    location /static {
        alias /home/audiocutter/Audio_Cutter/static;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/audiocutter /etc/nginx/sites-enabled/
sudo nginx -t        # Test config
sudo systemctl restart nginx
```

### 4.2 — SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

---

## 5. PostgreSQL Setup (Optional — For Logging)

```bash
sudo apt install postgresql postgresql-contrib -y
sudo -u postgres psql
```

In PostgreSQL:
```sql
CREATE DATABASE audio_db;
CREATE USER audiocutter WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE audio_db TO audiocutter;
\c audio_db
CREATE TABLE upload_logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_device TEXT,
    file_name TEXT,
    file_ext VARCHAR(10),
    file_size_mb DECIMAL(10,2),
    target_format VARCHAR(10),
    status VARCHAR(20) DEFAULT 'Success'
);
GRANT ALL PRIVILEGES ON TABLE upload_logs TO audiocutter;
GRANT USAGE, SELECT ON SEQUENCE upload_logs_id_seq TO audiocutter;
\q
```

Update `.env` with the database credentials.

---

## 6. Maintenance

### View Logs
```bash
# Application logs
tail -f /home/audiocutter/Audio_Cutter/logs/error.log
tail -f /home/audiocutter/Audio_Cutter/logs/access.log

# Systemd logs
sudo journalctl -u audiocutter -f
```

### Restart the App
```bash
sudo systemctl restart audiocutter
```

### Update to Latest Version
```bash
cd /home/audiocutter/Audio_Cutter
git pull origin main
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart audiocutter
```

### Clean Temporary Files
The `uploads/` and `processed/` directories can accumulate files. Set up a cron job to clean them:

```bash
crontab -e
```

Add:
```
# Clean temp files older than 1 hour, every hour
0 * * * * find /home/audiocutter/Audio_Cutter/uploads/ -type f -mmin +60 -delete
0 * * * * find /home/audiocutter/Audio_Cutter/processed/ -type f -mmin +60 -delete
```

---

## 7. Security Considerations

| Area | Recommendation |
|------|---------------|
| **Secret Key** | Use a cryptographically random string (never use the default) |
| **Debug Mode** | Always `false` in production |
| **File Uploads** | The 500MB limit is enforced; adjust in `app.py` if needed |
| **HTTPS** | Always use SSL in production (Let's Encrypt is free) |
| **Firewall** | Only expose ports 80 and 443 |
| **Database** | Use a strong PostgreSQL password |

### Firewall Setup (UFW)
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 8. Monitoring (Optional)

For production monitoring, consider adding:
- **Uptimerobot** or **Healthchecks.io** — Uptime monitoring
- **Sentry** — Error tracking
- **Prometheus + Grafana** — Metrics & dashboards

---

## ✅ Production Deployment Complete

Your Audio Cutter Pro is now live at `https://your-domain.com`. Monitor the logs for the first few days to ensure everything runs smoothly.
