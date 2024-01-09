up:
	@docker-compose up -d
	@docker images -q -f dangling=true | xargs docker rmi -f

down:
	@docker-compose down

ps:
	@docker-compose ps

test:
	@$(MAKE) down
	$(MAKE) up
	@./start.sh
	@$(MAKE) down
