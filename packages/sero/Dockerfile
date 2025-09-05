# Use a Node.js base image
FROM node:latest

# Set the working directory inside the container
WORKDIR /usr/src/app/packages/sero

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build TypeScript code
RUN npm run build

# Run the deploy script
RUN npm run deploy

# Cleanup dev dependencies to reduce image size
RUN npm prune --production

# Set environment variables
ENV NODE_ENV=production

# Start the bot
CMD [ "npm", "start" ]