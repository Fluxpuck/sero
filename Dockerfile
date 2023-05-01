# Use the official Node.js v16 image as the base image
FROM node:16-alpine

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the application code to the container
COPY . .

# Set the environment variables
ENV NODE_ENV=production
ENV DISCORD_TOKEN=<your_discord_token>

# Expose the port used by the application
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
