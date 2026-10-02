# Измеренные коллизии: что объединять, а не переименовывать

Замер: `node src/derive-groups.mjs` (40 групп из 523 ошибок полного прогона), затем
`node src/eval-informativeness.mjs --probes c --groups tasks/confusable-groups.auto.json`.

**518 формулировок, 40 групп, средняя точность 59.1%, 10 групп на уровне шанса или ниже.**

## Группы на уровне шанса — кандидаты на объединение

Шанс для группы из k имён — 1/k. Группа на шансе означает, что имена не дают маршрутизатору
ничего. Это не вопрос лучшего имени.

| Группа | k | Шанс | Точность | Что происходит |
|---|---|---|---|---|
| `candidate_report_render` | 4 | 25% | **25%** | `candidate_report_render`, `demo_candidate_profile`, `hermes_candidate_report`, `hh_candidate_profile` — четыре имени на «отчёт/профиль кандидата» |
| `browser_session_url` | 4 | 25% | **25%** | `browser_session_url`, `connect`, `gc_connect`, `web_state` — слово `connect` в четырёх разных смыслах |
| `checko_get` | 3 | 33% | **33%** | `checko_get`, `company_get_by_inn`, `dadata_find` — поиск компании тремя способами |
| `company_find_by_name` | 3 | 33% | **33%** | `company_find_by_name`, `company_review`, `dadata_suggest` |
| `gdrive_list_files` | 3 | 33% | **33%** | `gdrive_list_files`, `gdrive_public_folder`, `gdrive_status` |
| `hh_vacancy_publish_page` | 3 | 33% | 36% | `hh_vacancy_publish_page`, `publish_page`, `tilda_publish_page` — публикация страницы в трёх системах |
| `hermes_research` | 2 | 50% | **44%** | ниже шанса: `hermes_research` и `hermes_run` — модель систематически выбирает не то |
| `list_pages` | 2 | 50% | **50%** | `tilda_list_pages` против `list_pages` |
| `expo_enable` | 2 | 50% | **50%** | `expo_enable` против `flexi_set_exhibition` |
| `dev_workspace_setup` | 2 | 50% | **50%** | `dev_workspace_setup` против `engineering_spawn_workspace` |
| `playbook_batch_status` | 2 | 50% | **50%** | `playbook_batch_status` против `playbook_health` |

## Группы чуть выше шанса — частично различимо

| Группа | k | Шанс | Точность | ×шанс |
|---|---|---|---|---|
| `calltips_list_candidates` | 3 | 33% | 47% | 1.4× |
| `cold_message_generate` | 3 | 33% | 47% | 1.4× |
| `hh_interview_coverage` | 3 | 33% | 47% | 1.4× |
| `get_chat_history` | 4 | 25% | 55% | 2.2× |
| `browser_session_autologin` | 4 | 25% | 55% | 2.2× |
| `calltips_prepare` | 4 | 25% | 55% | 2.2× |

## Группы, где имена работают

`playbook_edit` 100% · `ba_clarify_requirements` 100% · `expo_pipeline_qualify` 100% ·
`agent_knowledge_summary` 75% (3.0×) · `playbook_run` 73% · `gdrive_public_sheet` 70% ·
`ba_export_client_doc` 70% · `search_exa` 70%

## Что это даёт по §2

§2 предлагает три исхода для близких инструментов: объединить одинаковые, выделить общий
инструмент с явным параметром, либо зафиксировать различие в назначении и имени. Теперь для каждого
случая есть измерение:

**Объединить (на шансе):**
- `company_get_by_inn` / `checko_get` / `dadata_find` — один инструмент «найти компанию» с параметром источника
- `company_find_by_name` / `company_review` / `dadata_suggest` — то же
- `gdrive_list_files` / `gdrive_public_folder` / `gdrive_status` — один инструмент «файлы Google Drive»
- `tilda_list_pages` / `list_pages` — одно и то же действие
- `expo_enable` / `flexi_set_exhibition` — включение интеграции
- `dev_workspace_setup` / `engineering_spawn_workspace` — создание рабочего окружения
- `playbook_batch_status` / `playbook_health` — состояние плейбука

**Общий инструмент с параметром (частично различимо):**
- `hh_evaluate_resume` / `hh_evaluate_candidate` — параметр `source: cold_search | application`
- `hh_generate_message` / `cold_message_generate` — параметр `channel`
- `hh_vacancy_publish_page` / `publish_page` / `tilda_publish_page` — параметр `target`

**Оставить как есть (имена работают):** `playbook_edit`, `ba_clarify_requirements`,
`expo_pipeline_qualify`, `agent_knowledge_summary`.

## Почему группы выводятся из ошибок, а не вручную

Ручной набор покрывал 14 групп и 36 инструментов — и пропустил `connect` (4-сторонняя коллизия),
`gdrive_*` и `company_*`. Матрица ошибок полного прогона не пропускает: она и есть определение
«эти два инструмента путают». Отказы (`tool: null`) намеренно исключены из групп — это отдельный
класс ошибки (отказ отвечать), и смешивать его с коллизией имён нельзя.

## Ограничение

Группы строятся как связные компоненты с ограничением размера (по умолчанию 4). Слабые рёбра
отбрасываются первыми, поэтому сильные пары сохраняются, а случайные — нет. При росте каталога
стоит поднять лимит: 4-сторонняя группа — более острый инструмент, чем пара, и различие между
«на шансе» и «почти на шансе» становится статистически заметным.