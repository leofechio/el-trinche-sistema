FROM node:20-slim
# Install generic printer dependencies if needed (e.g. for USB)
RUN apt-get update && apt-get install -y libusb-1.0-0-dev build-essential pkg-config
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4000
CMD ["node", "server.js"]
