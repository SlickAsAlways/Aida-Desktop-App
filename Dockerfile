# Use a base image (Node.js)
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port for the application
EXPOSE 5000

# Start both the application and API
CMD ["node", "server2.js"]
