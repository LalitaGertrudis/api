#!/bin/bash

# run docker services
# when dev argument is provided the services run in development mode and hot reload

# Check if argument is provided and validate it
if [ $# -eq 1 ]; then
    if [ "$1" != "dev" ]; then
        echo "Error: Only 'dev' argument is supported"
        echo "Usage: $0 [dev]"
        exit 1
    fi
fi

# Function to cleanup on script exit
cleanup() {
    echo "Stopping Docker services..."
    docker-compose down
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Check if dev mode is requested
if [ "$1" = "dev" ]; then
    echo "Starting services in development mode with hot reloading..."
    # Start all services with dev profile (includes api-dev with hot reload + all supporting services)
    docker-compose --profile dev up --build
else
    echo "Starting services in production mode..."
    # Start all services except api-dev (production mode)
    docker-compose up --build api redis prometheus alertmanager grafana
fi
