FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build the production version
RUN npm run build

# Start the app (preview mode)
EXPOSE 5173
CMD ["npm", "run", "preview", "--", "--host"]
