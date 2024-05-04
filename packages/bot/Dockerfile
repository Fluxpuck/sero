# Use a Node.js base image
FROM node:20

# Set the working directory inside the container
WORKDIR /usr/src/app/packages/bot

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Command to start the API
CMD ["node", "bot.js"]
