# Use Node.js 18 Alpine
FROM node:18-alpine

# Install bash and build tools for native modules
RUN apk add --no-cache bash python3 make g++ git

# Set working directory
WORKDIR /app

# Copy package files first (for Docker cache optimization)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source code
COPY . .

# Expose backend port
EXPOSE 5000

# Start the backend app
CMD ["node", "server.js"]

