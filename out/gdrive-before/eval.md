# Level-2 selection eval — undefined profile

Run: 2026-10-05T02:37:01.953Z · seed 20261002 · runs 1 · concurrency 3 · shuffle true · distractors 0
Catalog: 304 tools / 66 groups, names-only (~1827 tokens)
Corpus: 15 tasks

## Итог

| Метрика | Значение |
|---|---|
| Оценено (без unavailable) | 15 / 15 |
| Точность выбора | 26.7% (4/15) |
| Недоступные провайдеры | 0 |
| Ошибки парсинга ответа | 0 |
| Средняя задержка | 4140 мс |
| Средние токены на ответ | 2726 |

## По категориям

| Категория | Всего | Верно | Ошибка | Недоступно | Точность |
|---|---|---|---|---|---|
| undefined | 15 | 4 | 11 | 0 | 26.7% |

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
| gen:gdrive_public_folder | 5 | 0 | 0.0% |
| gen:gdrive_status | 5 | 0 | 0.0% |
| gen:gdrive_list_files | 5 | 4 | 80.0% |

## Ошибки выбора

| Задача | Категория | Запрос | Ожидалось | Получено |
|---|---|---|---|---|
| gen:gdrive_list_files | undefined | После того как откроешь папку, перечисли файлы. | gdrive_list_files | — |
| gen:gdrive_public_folder | undefined | Что в папке? | gdrive_public_folder | — |
| gen:gdrive_public_folder | undefined | Будьте добры, перечислите файлы из этой папки Google Drive. | gdrive_public_folder | gdrive_list_files |
| gen:gdrive_public_folder | undefined | Глянь, что за файлы в этой гугл-папке? | gdrive_public_folder | gdrive_list_files |
| gen:gdrive_public_folder | undefined | Перед тем как читать какой-либо файл, покажи список файлов в папке. | gdrive_public_folder | gdrive_list_files |
| gen:gdrive_public_folder | undefined | Скинь список файлов в етой гугл-папке | gdrive_public_folder | gdrive_list_files |
| gen:gdrive_status | undefined | Драйв ок? Файлы? | gdrive_status | — |
| gen:gdrive_status | undefined | Не подскажете, драйв в порядке и сколько файлов в нем? | gdrive_status | — |
| gen:gdrive_status | undefined | Драйв пашет? Сколько файлов? | gdrive_status | gdrive_list_files |
| gen:gdrive_status | undefined | Перед тем как продолжить, проверь драйв и сколько файлов доступно. | gdrive_status | gdrive_list_files |
| gen:gdrive_status | undefined | Проверь драйв и сколь файлов доступно. | gdrive_status | gdrive_list_files |

## Недоступные

