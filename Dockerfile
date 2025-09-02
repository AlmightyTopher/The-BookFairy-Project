# Book Fairy Discord Bot - Production Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/
COPY data/ ./data/

# Build TypeScript
RUN npm run build

# Create non-root user for security
RUN addgroup -g 1001 -S bookfairy && \
    adduser -S bookfairy -u 1001

# Change ownership of app directory
RUN chown -R bookfairy:bookfairy /app
USER bookfairy

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/healthz || exit 1

# Expose health check port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
