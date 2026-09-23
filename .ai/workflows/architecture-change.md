# Рабочий процесс: Изменение архитектуры (Architecture Change Workflow)

## 1. Точка входа (Entry Condition)
- Потребность во внедрении нового сервиса, библиотеки, протокола или изменении структуры данных/API-контракта.

## 2. Загрузка контекста (Context Loading)
- Изучение `docs/architecture/product-architecture.md` и всех существующих ADR в `docs/adr/`.
- Активация навыков `architecture` и `architecture-decision-records`.

## 3. Создание задачи и проектирование ADR
- Оркестратор создает задачу `TASK-XXXX` типа `architecture`.
- Разрабатывается проект ADR в `docs/adr/XXXX-<title>.md` по стандартному формату:
  - Context
  - Decision
  - Consequences (Pros & Cons)
  - Alternatives considered

## 4. Обновление контрактов
- Если меняется API: вносится изменение в `docs/api/openapi.yaml`.
- Если меняются правила/ограничения: обновляются `.ai/context/` и `AGENTS.md`.

## 5. Прохождение шлюза (Architecture Review Gate)
- Проверка соответствия ограничению Zero-Maintenance (никаких скрытых VPS, только PaaS).
- Прохождение `architecture_gate` и `api_contract_gate`.

## 6. Завершение
- ADR получает статус `Accepted`.
- Производится уведомление зависимых агентов (Backend / Frontend).
- Статус задачи: `done`.
