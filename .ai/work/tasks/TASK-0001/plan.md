# План выполнения: TASK-0001 — Bootstrap AI-Native Development Infrastructure

## 1. Фаза исследования (Discovery)
- [x] Проверить локальную кодовую базу и Git-репозиторий.
- [x] Инспектировать установленные глобальные навыки Antigravity (`~/.gemini/antigravity-cli/skills`).
- [x] Изучить документацию по Antigravity Customizations (`AGENTS.md`, `GEMINI.md`, worktrees).
- [x] Сформировать отчет `.ai/reports/agent-discovery.md`.

## 2. Фаза проектирования контрольного слоя (.ai/)
- [x] Скопировать каноническую архитектуру в `docs/architecture/product-architecture.md`.
- [x] Сформировать контекстный слой (`project.md`, `domain.md`, `terminology.md`, `constraints.md`, `non-goals.md`, `integrations.md`).
- [x] Создать спецификацию источников истины `.ai/instructions/source-of-truth.md`.
- [x] Создать регламент загрузки контекста `.ai/instructions/context-loading.md`.
- [x] Создать протокол хендоффов `.ai/instructions/handoff-protocol.md`.
- [x] Сформировать манифест глобальных навыков `.ai/stack/aas-stack.json`.
- [x] Разработать контракты оркестрации (`ownership.yaml`, `capabilities.yaml`, `concurrency.yaml`, `routing.yaml`, `gates.yaml`).
- [x] Описать ролевые профили агентов в `.ai/agents/*.yaml`.
- [x] Создать рабочие процессы в `.ai/workflows/*.md`.
- [x] Развернуть реестр задач `.ai/work/registry.yaml`.

## 3. Фаза иерархии AGENTS.md и структуры репозитория
- [x] Создать корневой `AGENTS.md`.
- [x] Создать вложенные `AGENTS.md` (`apps/backend/`, `apps/frontend/`, `database/`, `infra/`, `.github/`).
- [x] Оформить канонические ADR в `docs/adr/`.
- [x] Оформить канонический API-контракт `docs/api/openapi.yaml`.
- [x] Оформить документацию схемы БД в `database/schema-model.md`.
- [x] Создать сгенерированные файлы состояния в `.ai/state/generated/`.

## 4. Фаза валидации
- [x] Написать скрипт валидации инфраструктуры `scripts/validate-ai-state.ps1`.
- [x] Запустить скрипт валидации и устранить расхождения.
- [x] Подготовить итоговый отчет.
