# I use an official Node.js image as a parent image
FROM node:20-alpine
# Set the working directory in the container to /app
WORKDIR /app
# Copy the current directory contents into the container at /app
# Install any needed packages specified in package.json
COPY package*.json ./

# Install dependencies
RUN npm ci

RUN apk add --no-cache wget

# Bundle app source
COPY . .

# Make port 4000 available to the world outside this container
ARG PORT=4000
ENV PORT $PORT
EXPOSE $PORT

# Define environment variable
CMD ["npm", "start"]
