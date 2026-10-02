# Level-2 selection eval — free profile

Run: 2026-10-02T14:01:08.256Z · seed 20261002 · runs 2 · concurrency 4 · shuffle true · distractors 5
Catalog: 331 tools / 76 groups, names-only (~2029 tokens)
Corpus: 97 tasks

## Итог

| Метрика | Значение |
|---|---|
| Оценено (без unavailable) | 194 / 194 |
| Точность выбора | 90.2% (175/194) |
| Недоступные провайдеры | 0 |
| Ошибки парсинга ответа | 0 |
| Средняя задержка | 3334 мс |
| Средние токены на ответ | 3035 |

## По категориям

| Категория | Всего | Верно | Ошибка | Недоступно | Точность |
|---|---|---|---|---|---|
| access | 10 | 10 | 0 | 0 | 100.0% |
| ambiguous | 8 | 8 | 0 | 0 | 100.0% |
| direct | 10 | 10 | 0 | 0 | 100.0% |
| no_tool | 14 | 12 | 2 | 0 | 85.7% |
| similar | 32 | 27 | 5 | 0 | 84.4% |
| synonym | 110 | 100 | 10 | 0 | 90.9% |
| typo | 10 | 8 | 2 | 0 | 80.0% |

## Какие модели реально отвечали

Фиксируем фактически отработавшую модель: незаметный fallback не должен менять оценку.

| Модель | Ответов |
|---|---|
| opencode-go/deepseek-v4-flash | 190 |
| opencode-go/longcat-2.5-preview-free | 3 |
| opencode-go/qwen3.8-flash | 1 |

## Ошибки выбора

| Задача | Категория | Запрос | Ожидалось | Получено |
|---|---|---|---|---|
| syn-018 | synonym | проверь документ по содержанию | document_content_review | deck_check |
| syn-036 | synonym | сходи по ссылке и вытащи оттуда текст | fetch_exa | ru_browser_fetch |
| syn-039 | synonym | собери каталог участников и выложи его | expo_build_catalog | expo_pipeline_run |
| syn-040 | synonym | определи, наши ли это целевые клиенты | expo_classify_targets | checko_qualify |
| syn-041 | synonym | найди и вытащи контакты из объявления hh | hh_discover, hh_extract_ats_config | hh_list_responses |
| syn-053 | synonym | напиши спецификацию по этому ТЗ | ba_write_spec | engineering_generate_spec |
| typo-003 | typo | выпусти меня че на 3000 | nalog_create_receipt | — |
| sim-005 | similar | покажи список вакансий | hh_list_vacancies, applylink_list_vacancies | — |
| sim-015 | similar | покажи дела, которые я жду | task_item_wait | task_list |
| none-007 | no_tool | посчитай налоги за квартал по всем доходам | none | nalog_get_incomes |
| syn-018 | synonym | проверь документ по содержанию | document_content_review | deck_check |
| syn-036 | synonym | сходи по ссылке и вытащи оттуда текст | fetch_exa | web_text |
| syn-039 | synonym | собери каталог участников и выложи его | expo_build_catalog | — |
| syn-053 | synonym | напиши спецификацию по этому ТЗ | ba_write_spec | engineering_generate_spec |
| typo-003 | typo | выпусти меня че на 3000 | nalog_create_receipt | — |
| sim-005 | similar | покажи список вакансий | hh_list_vacancies, applylink_list_vacancies | — |
| sim-012 | similar | открой профиль кандидата | hh_candidate_profile, demo_candidate_profile | — |
| sim-015 | similar | покажи дела, которые я жду | task_item_wait | task_list |
| none-005 | no_tool | собери мне портфолио из фотографий в pdf-каталог | none | expo_build_catalog |

## Недоступные

