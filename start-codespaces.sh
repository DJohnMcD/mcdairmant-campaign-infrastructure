#!/bin/bash

echo "🎯 NY-24 Campaign Infrastructure - Cloud Setup 🎯"
echo "=================================================="

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing campaign dependencies..."
    npm install
fi

# Create uploads directory if it doesn't exist
mkdir -p uploads

# Set up environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️  Creating environment configuration..."
    cat > .env << EOF
# Campaign Infrastructure Environment Variables
NODE_ENV=development
PORT=8080
SESSION_SECRET=codespaces-campaign-secret-$(openssl rand -hex 32)

# Database Configuration (SQLite for cloud development)
# DATABASE_URL will be set for production deployment

# Email Service Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
# SMTP_USER=your-campaign-email@gmail.com
# SMTP_PASS=your-app-password

# News Intelligence API Keys
# NEWS_API_KEY=your-newsapi-key

# Campaign Configuration
CAMPAIGN_NAME=McDairmant for Congress
DISTRICT=NY-24
EOF
    echo "✅ Environment file created - configure API keys as needed"
fi

# Test database connection
echo "🗄️  Testing database connectivity..."
node -e "
const CampaignDatabase = require('./database');
const db = new CampaignDatabase();
db.ready().then(() => {
    console.log('✅ Database ready for campaign operations');
    process.exit(0);
}).catch(err => {
    console.log('❌ Database setup needed:', err.message);
    process.exit(1);
});
"

echo ""
echo "🚀 CAMPAIGN CLOUD ENVIRONMENT READY!"
echo "=================================================="
echo "📱 Mobile Access: Open this Codespace URL on any device"
echo "🖥️  Local Development: npm run dev"
echo "🎯 Campaign Server: npm start"
echo "🔍 Test Suite: npm test (when available)"
echo ""
echo "🎪 Welcome to the future of mobile campaign development!"
echo "Code from anywhere, deploy everywhere! 🌍"