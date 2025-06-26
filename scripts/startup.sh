#!/bin/sh
# startup.sh

echo "Running database migrations..."
npm run migrate  # Or whatever command runs your migrations

echo "Starting application..."
exec node server.js  # Or whatever command starts your application
