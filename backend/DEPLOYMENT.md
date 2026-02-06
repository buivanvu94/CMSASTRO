# Deployment Guide

## Prerequisites

- Node.js >= 18.x
- MySQL >= 8.0 or PostgreSQL >= 13
- npm >= 9.x
- Git
- Domain name (for production)
- SSL certificate (for production)

---

## Environment Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd cms-backend
```

### 2. Install Dependencies

```bash
npm install --production
```

### 3. Configure Environment Variables

Create `.env` file:

```env
# Application
NODE_ENV=production
PORT=3000

# Database
DB_HOST=your-db-host
DB_PORT=3306
DB_NAME=cms_production
DB_USER=cms_user
DB_PASSWORD=<STRONG_PASSWORD>

# JWT Secrets (Generate strong random strings!)
JWT_SECRET=<GENERATE_32_CHAR_SECRET>
JWT_REFRESH_SECRET=<GENERATE_32_CHAR_SECRET>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://yourdomain.com,https://admin.yourdomain.com

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

**Generate Secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Database Setup

### 1. Create Database

```sql
CREATE DATABASE cms_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'cms_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON cms_production.* TO 'cms_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Run Migrations

```bash
# Sync database schema
npm run db:sync

# Add indexes for performance
node src/migrations/add-indexes.js
```

### 3. Create Admin User

```bash
node -e "
const bcrypt = require('bcryptjs');
const { User } = require('./src/modules/users/user.model');
const { sequelize } = require('./src/config/database');

async function createAdmin() {
  await sequelize.sync();
  const hashedPassword = await bcrypt.hash('AdminPass123!', 10);
  await User.create({
    full_name: 'Admin User',
    email: 'admin@yourdomain.com',
    password: hashedPassword,
    role: 'admin',
    status: 'active'
  });
  console.log('Admin user created');
  process.exit(0);
}

createAdmin();
"
```

---

## Deployment Options

### Option 1: Traditional Server (VPS/Dedicated)

#### Using PM2 (Recommended)

1. **Install PM2 globally:**
```bash
npm install -g pm2
```

2. **Create PM2 ecosystem file:**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'cms-api',
    script: './src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
```

3. **Start application:**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

4. **PM2 Commands:**
```bash
pm2 status          # Check status
pm2 logs            # View logs
pm2 restart cms-api # Restart app
pm2 stop cms-api    # Stop app
pm2 delete cms-api  # Remove app
```

#### Using systemd

1. **Create service file:**
```bash
sudo nano /etc/systemd/system/cms-api.service
```

```ini
[Unit]
Description=CMS API Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/cms-backend
ExecStart=/usr/bin/node src/server.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

2. **Enable and start service:**
```bash
sudo systemctl enable cms-api
sudo systemctl start cms-api
sudo systemctl status cms-api
```

### Option 2: Docker

1. **Create Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "src/server.js"]
```

2. **Create docker-compose.yml:**
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
    env_file:
      - .env
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: cms_production
      MYSQL_USER: cms_user
      MYSQL_PASSWORD: cms_pass
    volumes:
      - db_data:/var/lib/mysql
    restart: unless-stopped

volumes:
  db_data:
```

3. **Deploy:**
```bash
docker-compose up -d
```

### Option 3: Cloud Platforms

#### Heroku

1. **Create Procfile:**
```
web: node src/server.js
```

2. **Deploy:**
```bash
heroku create your-app-name
heroku addons:create jawsdb:kitefin
git push heroku main
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
```

#### AWS Elastic Beanstalk

1. **Install EB CLI:**
```bash
pip install awsebcli
```

2. **Initialize and deploy:**
```bash
eb init
eb create cms-api-prod
eb deploy
```

#### DigitalOcean App Platform

1. Create app via web interface
2. Connect GitHub repository
3. Configure environment variables
4. Deploy automatically on push

---

## Nginx Configuration

### Reverse Proxy Setup

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # API proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files (uploads)
    location /uploads {
        alias /var/www/cms-backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;
}
```

---

## SSL/TLS Certificate

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal (already configured)
sudo certbot renew --dry-run
```

---

## Monitoring & Logging

### 1. Application Logs

```bash
# PM2 logs
pm2 logs cms-api

# System logs
tail -f /var/log/cms-api.log
```

### 2. Error Tracking

Consider integrating:
- Sentry
- Rollbar
- Bugsnag

### 3. Performance Monitoring

Consider:
- New Relic
- Datadog
- PM2 Plus

### 4. Uptime Monitoring

- UptimeRobot
- Pingdom
- StatusCake

---

## Backup Strategy

### Database Backups

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mysql"
DB_NAME="cms_production"

mysqldump -u cms_user -p$DB_PASSWORD $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

### File Backups

```bash
# Backup uploads directory
tar -czf /backups/uploads_$(date +%Y%m%d).tar.gz /var/www/cms-backend/uploads

# Sync to S3 (optional)
aws s3 sync /var/www/cms-backend/uploads s3://your-bucket/uploads
```

### Automated Backups

Add to crontab:
```bash
# Daily database backup at 2 AM
0 2 * * * /path/to/backup-db.sh

# Weekly file backup on Sunday at 3 AM
0 3 * * 0 /path/to/backup-files.sh
```

---

## Security Checklist

- [ ] Change all default passwords
- [ ] Generate strong JWT secrets
- [ ] Configure CORS for specific domains
- [ ] Enable HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Configure security headers
- [ ] Disable directory listing
- [ ] Set proper file permissions
- [ ] Keep dependencies updated
- [ ] Enable database SSL
- [ ] Configure backup strategy
- [ ] Set up monitoring
- [ ] Review logs regularly

---

## Performance Optimization

### 1. Database

```bash
# Add indexes
node src/migrations/add-indexes.js

# Optimize queries
# Review slow query log
```

### 2. Caching

Consider adding:
- Redis for session storage
- CDN for static files
- HTTP caching headers

### 3. Load Balancing

For high traffic:
- Multiple application instances
- Load balancer (Nginx, HAProxy)
- Database read replicas

---

## Troubleshooting

### Application won't start

```bash
# Check logs
pm2 logs cms-api

# Check environment variables
printenv | grep DB_

# Test database connection
node -e "require('./src/config/database').sequelize.authenticate().then(() => console.log('OK'))"
```

### Database connection errors

- Verify credentials
- Check firewall rules
- Ensure database is running
- Check connection limits

### High memory usage

```bash
# Check memory
pm2 monit

# Restart if needed
pm2 restart cms-api
```

### Slow performance

- Check database indexes
- Review slow queries
- Monitor server resources
- Check network latency

---

## Rollback Procedure

### If deployment fails:

1. **Stop new version:**
```bash
pm2 stop cms-api
```

2. **Restore previous version:**
```bash
git checkout <previous-commit>
npm install
pm2 restart cms-api
```

3. **Restore database (if needed):**
```bash
mysql -u cms_user -p cms_production < backup.sql
```

---

## Post-Deployment

### 1. Verify Deployment

```bash
# Check API health
curl https://api.yourdomain.com/api/health

# Test authentication
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yourdomain.com","password":"AdminPass123!"}'
```

### 2. Monitor Logs

```bash
pm2 logs cms-api --lines 100
```

### 3. Test Critical Paths

- User login
- File upload
- CRUD operations
- API endpoints

---

## Maintenance

### Regular Tasks

**Daily:**
- Check error logs
- Monitor disk space
- Verify backups

**Weekly:**
- Review security logs
- Check performance metrics
- Update dependencies (if needed)

**Monthly:**
- Security audit
- Database optimization
- Review and rotate logs

---

## Support

For deployment issues:
- Check logs first
- Review this guide
- Contact: devops@yourdomain.com

---

**Last Updated:** 2024  
**Version:** 1.0
