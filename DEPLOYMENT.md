# Campaign Infrastructure Deployment Guide

## Quick Deployment Options

### Option 1: Railway (Recommended for MVP)
1. Fork this repository to your GitHub account
2. Sign up at [Railway.app](https://railway.app)
3. Connect your GitHub account
4. Deploy from GitHub repository
5. Add environment variables from `.env.example`
6. Access your deployed app at the Railway-provided URL

### Option 2: DigitalOcean App Platform
1. Create account at [DigitalOcean](https://digitalocean.com)
2. Go to Apps → Create App
3. Connect GitHub repository
4. Configure build settings:
   - Build Command: `npm install`
   - Run Command: `npm start`
5. Add environment variables
6. Deploy

### Option 3: AWS Elastic Beanstalk
1. Install AWS CLI and EB CLI
2. Run `eb init` in project directory
3. Run `eb create campaign-infrastructure`
4. Set environment variables in EB console
5. Deploy with `eb deploy`

### Option 4: Docker Self-Hosted
```bash
# Clone repository
git clone <your-repo-url>
cd calendar-bridge

# Copy environment file
cp .env.example .env
# Edit .env with your values

# Build and run with Docker Compose
docker-compose up -d

# Access at http://your-server-ip:80
```

## Environment Variables Setup

### Required Variables
```bash
# Basic Configuration
NODE_ENV=production
PORT=8080
SESSION_SECRET=your-super-secure-session-secret

# Database (SQLite for development, PostgreSQL for production)
DATABASE_URL=sqlite:./personal_ai.db

# News Intelligence
NEWS_API_KEY=your-newsapi-key-from-newsapi.org

# Campaign Info
CAMPAIGN_NAME="Your Name for Congress"
CAMPAIGN_DISTRICT="NY-24"
CAMPAIGN_YEAR=2026
```

### Optional Variables
```bash
# Payment Processing
SQUARE_APPLICATION_ID=your-square-app-id
SQUARE_ACCESS_TOKEN=your-square-token
SQUARE_ENVIRONMENT=sandbox

# Email/SMS Notifications
SENDGRID_API_KEY=your-sendgrid-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token

# Cloud Storage
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=your-bucket-name

# Monitoring
SENTRY_DSN=your-sentry-dsn
GOOGLE_ANALYTICS_ID=your-ga-id
```

## Domain Setup

### Custom Domain Configuration
1. Purchase domain from registrar (Namecheap, GoDaddy, etc.)
2. Configure DNS records:
   ```
   A Record: @ → your-server-ip
   CNAME: www → your-domain.com
   ```
3. Update nginx.conf with your domain name
4. Obtain SSL certificate (Let's Encrypt recommended)

### SSL Certificate (Let's Encrypt)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## Database Migration (Production)

### Upgrade to PostgreSQL (Recommended for Production)
1. Install PostgreSQL on your server
2. Create database and user:
   ```sql
   CREATE DATABASE campaign_infrastructure;
   CREATE USER campaign_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE campaign_infrastructure TO campaign_user;
   ```
3. Update DATABASE_URL in environment
4. The app will auto-create tables on first run

### Data Migration from SQLite
```bash
# Export SQLite data
sqlite3 personal_ai.db .dump > backup.sql

# Import to PostgreSQL (modify for PostgreSQL syntax)
psql -h localhost -d campaign_infrastructure -U campaign_user < backup.sql
```

## Security Checklist

### Pre-Deployment Security
- [ ] Change all default passwords and secrets
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure firewall (only ports 22, 80, 443 open)
- [ ] Set up regular database backups
- [ ] Configure fail2ban for SSH protection
- [ ] Enable automatic security updates

### Application Security
- [ ] Review all environment variables
- [ ] Enable rate limiting in nginx.conf
- [ ] Configure CORS appropriately
- [ ] Set secure session configuration
- [ ] Enable security headers in nginx
- [ ] Configure CSP (Content Security Policy)

## Monitoring and Maintenance

### Health Monitoring
- Access health check at: `https://your-domain.com/health`
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Configure error tracking with Sentry

### Log Management
```bash
# View application logs
docker-compose logs -f campaign-app

# Nginx access logs
tail -f /var/log/nginx/access.log

# Database backup logs
docker-compose logs backup
```

### Regular Maintenance
- Daily: Check health endpoints and error logs
- Weekly: Review security updates and backup integrity
- Monthly: Update dependencies and security patches
- Quarterly: Full system backup and disaster recovery test

## Troubleshooting

### Common Issues

**App won't start:**
```bash
# Check logs
docker-compose logs campaign-app

# Verify environment variables
docker-compose exec campaign-app env

# Test database connection
docker-compose exec campaign-app node -e "
const db = require('sqlite3').Database('personal_ai.db');
db.get('SELECT 1', console.log);
"
```

**Database errors:**
```bash
# Check database file permissions
ls -la personal_ai.db

# Recreate database
rm personal_ai.db
docker-compose restart campaign-app
```

**SSL/Domain issues:**
```bash
# Test SSL configuration
openssl s_client -connect your-domain.com:443

# Check nginx configuration
nginx -t

# Reload nginx
nginx -s reload
```

## Performance Optimization

### Production Optimizations
1. Enable gzip compression in nginx
2. Configure browser caching for static assets
3. Set up CDN for media files (Cloudflare)
4. Optimize database queries and add indexes
5. Configure Redis for session storage

### Scaling Considerations
- Use load balancer for multiple app instances
- Database connection pooling
- Separate database server for larger campaigns
- Content delivery network (CDN) for global access
- Monitoring and alerting system

## Backup and Recovery

### Automated Backups
The Docker Compose configuration includes automated SQLite backups every hour. For production:

```bash
# Manual backup
sqlite3 personal_ai.db ".backup backup_$(date +%Y%m%d_%H%M%S).db"

# Restore from backup
cp backup_file.db personal_ai.db
docker-compose restart campaign-app
```

### Disaster Recovery Plan
1. Keep backups in multiple locations (local + cloud)
2. Test restoration procedure monthly
3. Document recovery steps and contact information
4. Maintain infrastructure-as-code for quick rebuilding

## Getting Help

### Support Resources
- Technical issues: Check application logs first
- Deployment issues: Verify environment variables and network connectivity
- Campaign strategy: Use built-in AI agents for guidance
- FEC compliance: Consult with campaign legal counsel

### Emergency Contacts
- Server issues: Your hosting provider support
- Domain/DNS: Your domain registrar support
- Payment processing: Square developer support
- Legal compliance: Campaign counsel

---

**Ready to deploy?** Start with Railway for fastest deployment, then migrate to self-hosted infrastructure as your campaign grows.