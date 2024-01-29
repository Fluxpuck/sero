# Use a Node.js base image
FROM node:latest

# Set the working directory inside the container
WORKDIR /usr/src/app/packages/api

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port the app runs on
EXPOSE 3336

# Command to start the API
CMD ["node", "app.js"]