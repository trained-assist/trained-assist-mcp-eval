# Level-2 selection eval — undefined profile

Run: 2026-10-05T01:41:31.613Z · seed 20261002 · runs 1 · concurrency 4 · shuffle true · distractors 5
Catalog: 331 tools / 76 groups, names-only (~2029 tokens)
Corpus: 97 tasks

## Итог

| Метрика | Значение |
|---|---|
| Оценено (без unavailable) | 95 / 97 |
| Точность выбора | 84.2% (80/95) |
| Недоступные провайдеры | 2 |
| Ошибки парсинга ответа | 0 |
| Средняя задержка | 4760 мс |
| Средние токены на ответ | 2742 |

## По категориям

| Категория | Всего | Верно | Ошибка | Недоступно | Точность |
|---|---|---|---|---|---|
| access | 5 | 5 | 0 | 0 | 100.0% |
| ambiguous | 4 | 4 | 0 | 0 | 100.0% |
| direct | 5 | 5 | 0 | 0 | 100.0% |
| no_tool | 7 | 4 | 3 | 0 | 57.1% |
| similar | 16 | 11 | 5 | 0 | 68.8% |
| synonym | 55 | 48 | 5 | 2 | 90.6% |
| typo | 5 | 3 | 2 | 0 | 60.0% |

## Какие модели реально отвечали

Фиксируем фактически отработавшую модель: незаметный fallback не должен менять оценку.

| Модель | Ответов |
|---|---|
| opencode-zen/mimo-v2.5-free | 95 |

## Худшие инструменты

Инструменты, которые маршрутизируются хуже всех. Это и есть список на переименование:
не «красивое имя», а имя, по которому маршрутизатор не может понять назначение.

| Инструмент | Попыток | Верно | Точность |
|---|---|---|---|
| syn-018 | 1 | 0 | 0.0% |
| syn-021 | 1 | 0 | 0.0% |
| syn-024 | 1 | 0 | 0.0% |
| syn-036 | 1 | 0 | 0.0% |
| syn-041 | 1 | 0 | 0.0% |
| typo-003 | 1 | 0 | 0.0% |
| typo-004 | 1 | 0 | 0.0% |
| sim-003 | 1 | 0 | 0.0% |
| sim-005 | 1 | 0 | 0.0% |
| sim-006 | 1 | 0 | 0.0% |
| sim-012 | 1 | 0 | 0.0% |
| sim-015 | 1 | 0 | 0.0% |
| none-001 | 1 | 0 | 0.0% |
| none-005 | 1 | 0 | 0.0% |
| none-007 | 1 | 0 | 0.0% |
| syn-002 | 1 | 1 | 100.0% |
| syn-003 | 1 | 1 | 100.0% |
| syn-004 | 1 | 1 | 100.0% |
| syn-005 | 1 | 1 | 100.0% |
| syn-006 | 1 | 1 | 100.0% |
| syn-007 | 1 | 1 | 100.0% |
| syn-008 | 1 | 1 | 100.0% |
| syn-009 | 1 | 1 | 100.0% |
| syn-010 | 1 | 1 | 100.0% |
| syn-011 | 1 | 1 | 100.0% |
| syn-012 | 1 | 1 | 100.0% |
| syn-013 | 1 | 1 | 100.0% |
| syn-014 | 1 | 1 | 100.0% |
| syn-015 | 1 | 1 | 100.0% |
| syn-016 | 1 | 1 | 100.0% |
| syn-017 | 1 | 1 | 100.0% |
| syn-019 | 1 | 1 | 100.0% |
| syn-020 | 1 | 1 | 100.0% |
| syn-022 | 1 | 1 | 100.0% |
| syn-023 | 1 | 1 | 100.0% |
| syn-025 | 1 | 1 | 100.0% |
| syn-026 | 1 | 1 | 100.0% |
| syn-027 | 1 | 1 | 100.0% |
| syn-028 | 1 | 1 | 100.0% |
| syn-029 | 1 | 1 | 100.0% |

## Ошибки выбора

| Задача | Категория | Запрос | Ожидалось | Получено |
|---|---|---|---|---|
| syn-018 | synonym | проверь документ по содержанию | document_content_review | — |
| syn-021 | synonym | запиши в таблицу на google Sheets | gdrive_write_sheet | — |
| syn-024 | synonym | определи, что это за документ | freelance_classify_document | — |
| syn-036 | synonym | сходи по ссылке и вытащи оттуда текст | fetch_exa | — |
| syn-041 | synonym | найди и вытащи контакты из объявления hh | hh_discover, hh_extract_ats_config | — |
| typo-003 | typo | выпусти меня че на 3000 | nalog_create_receipt | — |
| typo-004 | typo | опубликуй стрраницу | tilda_publish_page, publish_page | — |
| sim-003 | similar | создай новый раздел | gc_section_create | — |
| sim-005 | similar | покажи список вакансий | hh_list_vacancies, applylink_list_vacancies | — |
| sim-006 | similar | покажи отклики на вакансию | hh_list_responses | — |
| sim-012 | similar | открой профиль кандидата | hh_candidate_profile, demo_candidate_profile | — |
| sim-015 | similar | покажи дела, которые я жду | task_item_wait | task_list |
| none-001 | no_tool | покажи текущий курс доллара к рублю | none | search_serper |
| none-005 | no_tool | собери мне портфолио из фотографий в pdf-каталог | none | doc_export |
| none-007 | no_tool | посчитай налоги за квартал по всем доходам | none | nalog_get_incomes |

## Недоступные

- syn-001 (run 0): fetch failed
- syn-040 (run 0): HTTP 502: {"error":{"message":"every rung failed","type":"ladder_error","attempts":[{"model":"opencode-zen/mimo-v2.5-free","outcome":"error","key":0,"error":"fetch failed: The operation was aborted due to timeo
