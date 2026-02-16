# Makefile for Docker Compose commands
DOCKER_COMPOSE = docker-compose
APP_SERVICE = app

# PHONY tells Make that these are not files, but commands
.PHONY: all build up down test logs clean start

# When typing 'make all', it will run these commands in order
setup: down build up wait-logs test
	@echo "All services are up and running, and tests have been executed."

start: build test up
	@echo "Deployment complete: The new version has passed testing and is online"

# Build Docker images
build: 
	@echo "Building Docker images..."
	$(DOCKER_COMPOSE) build

# Start Docker containers in detached mode
up:
	@echo "Starting Docker containers..."
	$(DOCKER_COMPOSE) up -d

# Stop and remove Docker containers
down:  
	@echo "Stopping Docker containers..."
	$(DOCKER_COMPOSE) down --remove-orphans

# Run tests inside the app container
test: 
	@echo "Running tests inside the app container..."
	$(DOCKER_COMPOSE) run --rm $(APP_SERVICE) npm test

# Follow logs of the app service
logs: 
	$(DOCKER_COMPOSE) logs -f $(APP_SERVICE)

# Clean up Docker resources including databases
clean: 
	@echo "Cleaning up Docker resources..."
	$(DOCKER_COMPOSE) down -v

# Simple wait, will be improved with health checks
wait-logs:
	@echo "Waiting for services to be healthy..."
	@sleep 5 