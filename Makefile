up:
	@docker-compose up -d
	@docker images -q -f dangling=true | xargs docker rmi -f
	@./prepare.sh

down:
	@docker-compose down

ps:
	@docker-compose ps

test:
	@cd tests && npm test
