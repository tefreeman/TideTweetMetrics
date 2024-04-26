#!/bin/bash
set -e

echo "Restoring MongoDB data..."

mongorestore --uri "mongodb://Admin:your_password_here@localhost:27017" /docker-entrypoint-initdb.d/dump

echo "MongoDB data restored."