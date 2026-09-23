# Рабочий процесс: Подготовка и выпуск релиза (Release Workflow)

## 1. Точка входа (Entry Condition)
- Завершение набора связанных задач и готовность к развертыванию версии приложения на PaaS (Vercel / Render).

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
- GitHub Actions запускает пайплайн деплоя:
  - Frontend автоматически собирается и деплоится в Vercel.
  - Backend собирается и деплоится в Render / Railway.
  - База данных Neon применяет новые миграции Flyway на старте приложения.

## 6. Пострелизная валидация
- Проверка доступности публичного эндпоинта здоровья `/actuator/health`.
- Проверка загрузки главной страницы витрины.
- Формирование отчета о релизе.
