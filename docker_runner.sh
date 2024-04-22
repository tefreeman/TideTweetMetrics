#!/bin/bash

# Pull the latest MongoDB Docker image
echo "Pulling MongoDB Docker image..."
docker pull mongo:latest

# Run MongoDB container
echo "Running MongoDB container..."
password="your_password_here"  # Change to a secure password
docker run \
    -d \
    -p 27017:27017 \
    --name ttm-mongo \
    -e MONGO_INITDB_ROOT_USERNAME=Admin \
    -e MONGO_INITDB_ROOT_PASSWORD=$password \
    mongo:latest \
    --auth

# Verify container is running
echo "Verifying MongoDB container is running..."
docker ps

# Extract the MongoDB dump
echo "Extracting MongoDB dump..."
mkdir extracted_dump
tar -xzf mongodb_dump.tar.gz -C extracted_dump

# Copy the extracted dump to the Docker container
echo "Copying dump to MongoDB container..."
docker cp extracted_dump/mongodb_dump ttm-mongo:/mongo

# Give MongoDB time to initialize
echo "Waiting for MongoDB to initialize..."
sleep 10

# Restore the database
echo "Restoring the database..."
docker exec ttm-mongo mongorestore \
    --authenticationDatabase admin \
    --username Admin \
    --password $password \
    --host localhost \
    /mongo

# Verify restoration
echo "Checking restored databases..."
docker exec ttm-mongo mongosh \
    --username Admin \
    --password $password \
    --authenticationDatabase admin \
    --eval "show dbs"

# Build and run project in Docker
echo "Building project containers..."
docker-compose build

echo "Creating metric network..."
docker network create metric-network

echo "Connecting MongoDB to metric network..."
docker network connect metric-network ttm-mongo

echo "Running project containers..."
docker-compose up -d

