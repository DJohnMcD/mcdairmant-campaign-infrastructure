#!/bin/bash

# McDairmant for Congress - Campaign Infrastructure Startup Script
# This script helps you get the campaign system running quickly

echo "🎪 McDairmant for Congress - Campaign Infrastructure"
echo "=================================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js $(node --version) detected"
echo "✅ npm $(npm --version) detected"
echo ""

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo ""
    echo "⚙️  Setting up environment..."
    cp .env.example .env
    echo "✅ Created .env file from .env.example"
    echo "📝 Please edit .env file with your configuration before starting the server"
    echo ""
    
    # Generate a random session secret
    if command -v openssl &> /dev/null; then
        SESSION_SECRET=$(openssl rand -base64 32)
        sed -i.bak "s/your-super-secure-session-secret-change-this/$SESSION_SECRET/" .env
        echo "🔐 Generated secure session secret"
    fi
    
    echo "🔧 Key configurations needed in .env:"
    echo "   - NEWS_API_KEY: Get free key from https://newsapi.org"
    echo "   - CAMPAIGN_NAME: Your campaign name"
    echo "   - SQUARE_* keys: For payment processing (optional)"
    echo ""
else
    echo "✅ Environment file exists"
fi

# Create uploads directory
mkdir -p uploads
echo "✅ Created uploads directory"

# Run syntax check
echo ""
echo "🔍 Checking server syntax..."
node -c server.js
if [ $? -ne 0 ]; then
    echo "❌ Server syntax check failed"
    exit 1
fi
echo "✅ Server syntax check passed"

# Run tests
echo ""
echo "🧪 Running system tests..."
echo "Testing expense classification..."
node test-expense-classification.js > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Expense classification test passed"
else
    echo "⚠️  Expense classification test had issues (check manually)"
fi

echo "Testing news intelligence..."
node test-news-intelligence.js > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ News intelligence test passed"
else
    echo "⚠️  News intelligence test had issues (check manually)"
fi

# Final startup
echo ""
echo "🚀 Starting Campaign Infrastructure..."
echo ""
echo "📊 Campaign Dashboard: http://localhost:8080/campaign-dashboard"
echo "🤖 AI Agents Dashboard: http://localhost:8080/dashboard"
echo "💰 Financial Tracking: Built into campaign dashboard"
echo "📰 Daily Briefings: http://localhost:8080/api/intelligence/daily-briefing"
echo ""
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Start the server
if [ "$1" = "--dev" ]; then
    echo "Starting in development mode with auto-restart..."
    if command -v nodemon &> /dev/null; then
        nodemon server.js
    else
        echo "⚠️  nodemon not found, starting normally..."
        node server.js
    fi
else
    node server.js
fi