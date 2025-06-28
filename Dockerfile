# Campaign Infrastructure Docker Configuration  
FROM node:20-alpine

# Install build tools for native module compilation
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Create uploads directory
RUN mkdir -p /app/uploads

# Copy package files
COPY package*.json ./

# Install dependencies (ignore optional failures)  
RUN npm ci --only=production --ignore-optional

# Copy application code (excluding node_modules)
COPY . .

# Remove any existing native binaries from local development
RUN find node_modules -name "*.node" -delete 2>/dev/null || true

# Rebuild native modules for target architecture
RUN npm rebuild bcrypt

# Create non-root user for security
RUN addgroup -g 1001 -S campaign && \
    adduser -S campaign -u 1001 -G campaign

# Set ownership of app directory
RUN chown -R campaign:campaign /app

# Switch to non-root user
USER campaign

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').request({host:'localhost',port:8080,path:'/'},res=>process.exit(res.statusCode===200?0:1)).end()"

# Start the application
CMD ["npm", "start"]