# Use an official Node.js image
FROM node:20-slim

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv

# Set up a virtual environment and install ML dependencies
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install pandas numpy scikit-learn joblib

# Set the working directory to /app
WORKDIR /app

# Copy the entire backend workspace (including currents_ml, risk-engine, backend)
COPY . .

# Install AI subsystem dependencies
WORKDIR /app/ai
RUN npm install

# Set working directory to the actual Node backend where the server runs
WORKDIR /app/backend

# Install Node dependencies
RUN npm install

# Expose the port the app runs on
EXPOSE 5000

# Start the Node.js server
CMD ["node", "src/server.js"]
