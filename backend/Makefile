.DEFAULT_GOAL := help
PROJ_NAME := karpo_backend
KARPO_BACKEND_VERSION ?= latest
DOCKER_COMPOSE_DEV := COMPOSE_PROJECT_NAME=karpo_backend docker compose -f deploy/docker-compose.dev.yml --project-directory .

.PHONY: help
#help:	@ List available tasks on this project
help:
	@grep -E '[a-zA-Z\.\-]+:.*?@ .*$$' $(MAKEFILE_LIST)| tr -d '#'  | awk 'BEGIN {FS = ":.*?@ "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.PHONY: lint
#lint: @ run linters like black, flake8, and mypy
lint:
	poetry run black --check $(PROJ_NAME)
	poetry run flake8 $(PROJ_NAME)
	poetry run mypy $(PROJ_NAME)

.PHONY: format
#format: @ run auto formatters like black
format:
	poetry run isort $(PROJ_NAME)
	poetry run black $(PROJ_NAME)

.PHONY: build
#build: @ build the image for production
build:
	docker build -f deploy/Dockerfile --platform linux/amd64 --target prod -t karpo_backend:$(KARPO_BACKEND_VERSION) .

.PHONY: build-dev
#build-dev: @ build the image for developing
build-dev:
	$(DOCKER_COMPOSE_DEV) build

.PHONY: docker-up
#docker-up: @ start containers for developing in background
docker-up:
	$(DOCKER_COMPOSE_DEV) up -d

.PHONY: docker-down
#docker-down: @ shutdown containers for developing
docker-down:
	$(DOCKER_COMPOSE_DEV) down

.PHONY: test
#test: @ run all tests in docker containers
test: docker-up
	$(DOCKER_COMPOSE_DEV) exec api poetry run pytest -vv --cov="$(PROJ_NAME)"
