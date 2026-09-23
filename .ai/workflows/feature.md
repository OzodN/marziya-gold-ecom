# Рабочий процесс: Разработка новой функциональности (Feature Workflow)

## 1. Точка входа (Entry Condition)
- Появление новой продуктовой задачи, согласованной с архитектурой `docs/architecture/product-architecture.md`.

## 2. Загрузка контекста (Context Loading)
- Исполнитель следует регламенту `.ai/instructions/context-loading.md`.
- Загружаются: `.ai/context/project.md`, `.ai/context/terminology.md`, `docs/api/openapi.yaml`.

## 3. Создание задачи (Task Creation)
- Оркестратор регистрирует задачу в `.ai/work/registry.yaml`.
- Создается директория `.ai/work/tasks/TASK-XXXX/` с файлами `task.yaml` и `plan.md`.
- Статус: `draft` -> `ready`.

## 4. Выбор агента и навыков (Agent & Skill Selection)
- Оркестратор определяет исполнителя по правилам `.ai/orchestration/routing.yaml`.
- Для бэкенда: агент `backend` (навыки: `backend-architect`, `java-pro`, `junit-5-skill`).
- Для фронтенда: агент `frontend` (навыки: `frontend-architecture`, `nextjs-app-router-patterns`, `react-best-practices`).

## 5. Изоляция и параллелизм (Worktree & Parallelism)
- Проверяется `.ai/orchestration/concurrency.yaml`.
- Создается изолированная ветка и ворктри:
  ```bash
  git worktree add .worktrees/TASK-XXXX-slug -b feat/TASK-XXXX-slug
  ```
- Статус задачи: `in_progress`.
- Если фича затрагивает и Backend, и Frontend:
  - Сначала фиксируется контракт в `docs/api/openapi.yaml`.
  - После этого Backend и Frontend могут разрабатываться **параллельно** в разных ворктри.

## 6. Разработка и локальная проверка (Implementation)
- Агент пишет код строго в своей зоне ответственности (`apps/backend/` или `apps/frontend/`).
- Агент запускает локальные тесты и проверки: `verification-before-completion`.

## 7. Хендофф и передача на ревью (Handoff & Review Gate)
- Агент формирует `.ai/work/tasks/TASK-XXXX/handoff.md`.
- Статус задачи переводится в `review`.
- Агент `reviewer` проверяет изменения согласно `.ai/orchestration/gates.yaml` (`code_review_gate`).

## 8. Тестирование QA (QA Gate)
- Агент `qa` запускает E2E или интеграционные тесты (`test_pass_gate`).
- Статус задачи: `qa`.

## 9. Интеграция и закрытие (Completion Criteria)
- Оркестратор сливает ветку в `main` (Fast-forward или squash merge).
- Ворктри удаляется: `git worktree remove .worktrees/TASK-XXXX-slug`.
- Статус задачи в `registry.yaml` и `task.yaml` обновляется на `done`.
