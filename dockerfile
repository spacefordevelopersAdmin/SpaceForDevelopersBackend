# Use an official Node.js runtime as the base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json .

# Install dependencies
RUN npm ci

# Copy the rest of the app
COPY . .

# Expose the port your backend runs on
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
