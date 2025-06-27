#!/bin/sh
# startup.sh

echo "Running database migrations..."
echo "Current working directory: $(pwd)"
echo "Listing files in current directory:"
ls -la
echo "Checking if drizzle.config.ts exists:"
if [ -f "./drizzle.config.ts" ]; then
  echo "drizzle.config.ts exists"
  cat ./drizzle.config.ts
else
  echo "drizzle.config.ts does not exist"
fi
echo "Checking DATABASE_URL environment variable:"
if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not set"
else
  echo "DATABASE_URL is set (value hidden for security)"
fi

# Run migration with verbose logging
npx drizzle-kit migrate --verbose

echo "Starting application..."
exec node server.js
