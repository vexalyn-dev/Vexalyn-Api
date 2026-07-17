#!/bin/sh
# Startup script for Railway deployment

# Use PORT from environment or default to 8000
PORT=${PORT:-8000}

echo "Starting Uvicorn server on port $PORT..."
exec uvicorn api:app --host 0.0.0.0 --port "$PORT"
