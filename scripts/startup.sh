#!/bin/sh
# startup.sh

echo "Running database migrations..."
npx drizzle-kit migrate

echo "Starting application..."
exec node server.js
