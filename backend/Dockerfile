# Use the official Node.js 16 image as the base image
FROM node:16

RUN npm install --global nodemon

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Compile TypeScript (if applicable)
RUN npm run build

# Expose the port your app runs on (change from 3000 to 3001)
EXPOSE 3001

# Command to run the application with nodemon
CMD ["nodemon", "npm", "start"]
