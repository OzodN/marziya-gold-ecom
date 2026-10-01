# Рабочий процесс: Подготовка и выпуск релиза (Release Workflow)

## 1. Точка входа (Entry Condition)
- Завершение набора связанных задач и готовность к развертыванию версии приложения на PaaS (Railway).

## 2. Исполнитель и навыки
- Назначенный агент: `devops`.
- Навыки: `deployment-procedures`, `github-actions`, `git-workflow`.

## 3. Релизные проверки (Pre-Release Gates)
1. Все задачи в `.ai/work/registry.yaml`, входящие в релиз, имеют статус `done`.
2. Все тесты в CI проходят успешно (`test_pass_gate`).
3. Аудит безопасности не содержит открытых уязвимостей (`security_audit_gate`).
4. Контракт API `docs/api/openapi.yaml` синхронизирован с кодом.

## 4. Версионирование и теги
- Создание аннотированного тега Git согласно Semantic Versioning:
  ```bash
  git tag -a v1.0.0 -m "Release v1.0.0"
  git push origin v1.0.0
  ```
- Генерация или обновление `CHANGELOG.md`.

## 5. Деплой (Automated PaaS Deployment)
- Railway автоматически собирает сервисы монорепозитория по коммиту в `main` (с учётом Watch Paths):
  - Frontend сервис (`apps/frontend`, Next.js 15).
  - Backend сервис (`apps/backend`, Spring Boot 4.1.1).
  - База данных PostgreSQL применяет новые миграции Flyway на старте бэкенда.

## 6. Пострелизная валидация
- Проверка доступности публичного эндпоинта здоровья `/actuator/health`.
- Проверка загрузки главной страницы витрины.
- Формирование отчета о релизе.
