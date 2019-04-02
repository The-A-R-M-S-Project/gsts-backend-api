PROJECT_NAME := arms-graduate-tracking-system

test: ## Run tests on the API
	@echo "Running Tests with Mocha on $(PROJECT_NAME)"
	@npm test

install: ## Install npm dependencies for the API
	@echo "Installing Node dependencies"
	@npm install

srv: ## Run server on port 8080
	@echo "Running Server on PORT 8080"
	@npm start

ifneq ($(OS),Windows_NT)
help: help-unix ## Target for printing all targets
mongod: mongod-unix ## Run mongod on unix
else
help: help-win
mongod: mongod-win
endif

mongod-unix:
	@echo "Running mongod using config: /usr/local/etc/mongod.conf"
	@mongod --config /usr/local/etc/mongod.conf

mongod-win: ## Run mongod on windows
	@echo "Running mongod ..."
	StartMongo.bat

help-win:
	@echo The following targets are available for the $(PROJECT_NAME):
	@echo - help
	@echo - test
	@echo - install
	@echo - srv
	@echo - mongod

help-unix:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'


.DEFAULT_GOAL := help

.PHONY: test install help mongod srv db mongod-unix mongod-win