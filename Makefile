# dvpe-cyberstrikeai-lab — atajos comunes
SHELL := /bin/bash

.PHONY: help up down logs ps build rebuild restart shell-attacker shell-csai pull-models clean

help:
	@echo "Targets:"
	@echo "  make up             Levanta el laboratorio (build + up -d)"
	@echo "  make down           Detiene contenedores"
	@echo "  make logs           Sigue logs de todos los servicios"
	@echo "  make ps             Estado de contenedores"
	@echo "  make build          Construye imágenes (sin levantar)"
	@echo "  make rebuild        Reconstruye sin caché"
	@echo "  make restart        Reinicia todos los servicios"
	@echo "  make shell-attacker Entra a Attacker-PC"
	@echo "  make shell-csai     Entra al contenedor de CyberStrikeAI"
	@echo "  make pull-models    Descarga modelos Ollama recomendados en el host"
	@echo "  make clean          Elimina contenedores, volúmenes y redes del lab"

up:
	@test -f .env || cp lab.env.example .env
	docker compose up -d --build

down:
	docker compose down

logs:
	docker compose logs -f --tail=200

ps:
	docker compose ps

build:
	docker compose build

rebuild:
	docker compose build --no-cache

restart:
	docker compose restart

shell-attacker:
	docker exec -it Attacker-PC /bin/bash

shell-csai:
	docker exec -it CyberStrikeAI /bin/bash

pull-models:
	bash scripts/pull-models.sh

clean:
	docker compose down -v --remove-orphans
