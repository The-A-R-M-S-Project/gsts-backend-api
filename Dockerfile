# An official Docker image for Node.js
FROM mhart/alpine-node:10.16.0

# Working directory for the containerised application
WORKDIR /usr/src/app

# This copies significant package.json files to the current directory
COPY package*.json ./

# install the compiler and build dependencies in order to build bcrypt in alpine linux image
RUN apk --no-cache add --virtual builds-deps build-base python

# Install essential Node.js dependencies
RUN npm install

COPY . .

# # # Opens up this port on the Docker container
EXPOSE 8080

# # # This starts the Docker application
CMD [ "npm", "test" ]