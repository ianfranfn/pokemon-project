# I use an official Node.js image as a parent image
FROM node:20-alpine
# Set the working directory in the container to /app
WORKDIR /app
# Copy the current directory contents into the container at /app
# Install any needed packages specified in package.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Bundle app source
COPY . .

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Define environment variable
CMD ["npm", "start"]