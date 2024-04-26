#!/bin/bash
set -e

echo "Waiting for MongoDB to start..."
while ! mongo --host localhost --port 27017 --username Admin --password your_password_here --authenticationDatabase admin --eval "print('waited for a connection')" > /dev/null; do
  sleep 2
done

echo "Restoring MongoDB data..."
mongorestore --uri "mongodb://Admin:your_password_here@localhost:27017" /docker-entrypoint-initdb.d/dump
echo "MongoDB data restored."