#!/bin/bash

# Define a file to check if the script has already run
FLAG_FILE="/app/.migrate_done"

if [ -f "$FLAG_FILE" ]; then
  echo "Migration already completed. Skipping."
else
  # Wait for Postgres to be ready using netcat
  until nc -z -v -w30 db 5432; do
    echo "Waiting for database to be ready..."
    sleep 2
  done

  # Run Prisma migration and log output
  echo "Running Prisma migrate..."
  npx prisma migrate dev --name init || { echo "Prisma migration failed"; exit 1; }

  # Create the flag file to indicate migration has run
  touch "$FLAG_FILE"
fi

# Run the application
npm run start:prod
