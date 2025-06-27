#!/bin/sh
# startup.sh

echo "Running database migrations..."
npm run db:migrate

echo "Starting application..."
exec node server.js
