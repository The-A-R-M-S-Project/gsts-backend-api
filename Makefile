PROJECT_NAME := arms-graduate-tracking-system

test: ## Run tests on the API
	@echo "Running Tests with Mocha"
	@npm test

install: ## Install npm dependencies for the api
	@echo "Installing Node dependencies"
	@npm install

srv: ## Run server on port 8080
	@echo "Running Server on PORT 8080"
	@npm start
	
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help

.PHONY: test install help