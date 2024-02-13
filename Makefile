up:
	@docker-compose up -d
	@docker images -q -f dangling=true | xargs docker rmi -f
	@./prepare.sh

down:
	@docker-compose down

ps:
	@docker-compose ps

# If the first argument is "test"...
ifeq (test,$(firstword $(MAKECMDGOALS)))
  # use the rest as arguments for "test"
  RUN_ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
  # ...and turn them into do-nothing targets
  $(eval $(RUN_ARGS):;@:)
endif
test:
	@cd tests && npx jest -t "$(RUN_ARGS)"
