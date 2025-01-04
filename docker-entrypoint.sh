#!/bin/bash

# Wait for Postgres to be ready using netcat
until nc -z -v -w30 db 5432; do
  echo "Waiting for database to be ready..."
  sleep 2
done

# Run Prisma migration and log output
echo "Running Prisma migrate..."
npx prisma migrate dev --name init || { echo "Prisma migration failed"; exit 1; }

# Run the application
npm run start:prod