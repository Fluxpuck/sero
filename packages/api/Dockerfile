# Use a Node.js base image
FROM node:latest

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY packages/api/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY packages/api/ ./

# Command to start the API
CMD ["node", "app.js"]