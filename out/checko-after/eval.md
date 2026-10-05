# Level-2 selection eval — undefined profile

Run: 2026-10-05T02:50:36.169Z · seed 20261002 · runs 1 · concurrency 3 · shuffle true · distractors 0
Catalog: 302 tools / 66 groups, names-only (~1822 tokens)
Corpus: 15 tasks

## Итог

| Метрика | Значение |
|---|---|
| Оценено (без unavailable) | 15 / 15 |
| Точность выбора | 60.0% (9/15) |
| Недоступные провайдеры | 0 |
| Ошибки парсинга ответа | 0 |
| Средняя задержка | 5609 мс |
| Средние токены на ответ | 2903 |

## По категориям

| Категория | Всего | Верно | Ошибка | Недоступно | Точность |
|---|---|---|---|---|---|
| undefined | 15 | 9 | 6 | 0 | 60.0% |

## Какие модели реально отвечали

Фиксируем фактически отработавшую модель: незаметный fallback не должен менять оценку.

| Модель | Ответов |
|---|---|
| openrouter/nvidia/nemotron-3-super-120b-a12b:free | 15 |

## Худшие инструменты

Инструменты, которые маршрутизируются хуже всех. Это и есть список на переименование:
не «красивое имя», а имя, по которому маршрутизатор не может понять назначение.

| Инструмент | Попыток | Верно | Точность |
|---|---|---|---|
| gen:checko_get | 5 | 0 | 0.0% |
| gen:company_get_by_inn | 5 | 4 | 80.0% |
| gen:dadata_find | 5 | 5 | 100.0% |

## Ошибки выбора

| Задача | Категория | Запрос | Ожидалось | Получено |
|---|---|---|---|---|
| gen:checko_get | undefined | Пробей ИНН 7701234567 | checko_get | company_get_by_inn |
| gen:checko_get | undefined | Подскажите, пожалуйста, что можно узнать по ИНН 7701234567? | checko_get | company_get_by_inn |
| gen:checko_get | undefined | Пробей по инн 7701234567, что за контора | checko_get | company_get_by_inn |
| gen:checko_get | undefined | Перед тем как ответить клиенту, пробей ИНН 7701234567 | checko_get | company_get_by_inn |
| gen:checko_get | undefined | прбей инн 7701234567 | checko_get | company_get_by_inn |
| gen:company_get_by_inn | undefined | Прбей ИНН 7701234567, дай данные: директор, телефоны, адрес, выручка, статус. | company_get_by_inn | inn_enrich_batch |

## Недоступные

