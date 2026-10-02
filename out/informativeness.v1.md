# Name-informativeness eval — free

Run: 2026-10-02T18:45:21.688Z · seed 20261002 · probes c

## Probe A — имя → назначение (судья против реального описания)

| Метрика | Значение |
|---|---|
| Инструментов | 0 |
| Оценено | 0 |
| Средний балл (0–4) | n/a |
| Недоступно | 0 |
| Ошибок парсинга | 0 |

Распределение баллов:

| Балл | Инструментов |
|---|---|
| 4 | 0 |
| 3 | 0 |
| 2 | 0 |
| 1 | 0 |
| 0 | 0 |

Модель сама считает имя понятным: 0 из 0.
Из них судья согласен (балл ≥3): 0.

**Самоуверенные имена** — модель говорит «понятно», а судья ставит ≤1. Это худший класс:
маршрутизатор уверенно выберет не тот инструмент.

| Имя | Догадка | Балл | Почему |
|---|---|---|---|

**Честно непонятные имена** — модель сама признаёт, что угадывает (clear=false), и судья
подтверждает (балл ≤1). Такие имена хотя бы не вводят в заблуждение.

| Имя | Догадка | Балл |
|---|---|---|

## Probe B — сопоставление описаний именам в группах близких имён

| Метрика | Значение |
|---|---|
| Групп | 0 |
| Имен в группах | 0 |
| Средняя точность | n/a |
| Недоступно | 0 |

Шанс для группы из k имён — 1/k. Группа, где точность на уровне шанса, означает, что имена
не дают маршрутизатору ничего, кроме позиции в списке.

| Группа | k | Шанс | Верно | Точность |
|---|---|---|---|---|

## Probe C — маршрутизация в закрытом наборе близких имён

Probe B показывает высокую точность, но это утечка: модель получает настоящие описания и
матчит по словам, которых при маршрутизации не будет. Probe C убирает обе подсказки —
остаются только k похожих имён и реальные формулировки корпуса.

| Метрика | Значение |
|---|---|
| Групп | 40 |
| Формулировок | 518 |
| Средняя точность | 59.1% |
| Групп на уровне шанса или ниже | 10 |

Группа на уровне шанса или ниже — имена не различают инструменты. Это не вопрос лучшего
имени, это вопрос объединения: §2 предлагает «объединить действительно одинаковые
возможности» либо «выделить общий инструмент с явным параметром».

| Группа | k | Шанс | Точность | Отказ | ×шанс | Различие |
|---|---|---|---|---|---|---|
| auto-4-candidate_report_render ⚠ | 4 | 25% | 25% | 0 | 1.0× | измерено: demo_candidate_profile→hh_candidate_profile ×5, hh_candidate_profile→candidate_report_render ×5, hermes_candidate_report→candidate_report_render ×5 |
| auto-4-browser_session_url ⚠ | 4 | 25% | 25% | 3 | 1.0× | измерено: web_state→browser_session_url ×4, browser_session_url→connect ×2, gc_connect→connect ×2 |
| auto-3-checko_get ⚠ | 3 | 33% | 33% | 0 | 1.0× | измерено: checko_get→company_get_by_inn ×5, dadata_find→company_get_by_inn ×4 |
| auto-3-company_find_by_name ⚠ | 3 | 33% | 33% | 0 | 1.0× | измерено: dadata_suggest→company_find_by_name ×5, company_review→company_find_by_name ×4 |
| auto-3-gdrive_list_files ⚠ | 3 | 33% | 33% | 0 | 1.0× | измерено: gdrive_public_folder→gdrive_list_files ×4, gdrive_status→gdrive_list_files ×3 |
| auto-3-hh_vacancy_publish_page | 3 | 33% | 36% | 0 | 1.1× | измерено: tilda_publish_page→publish_page ×4, hh_vacancy_publish_page→publish_page ×3 |
| auto-2-hermes_research ⚠ | 2 | 50% | 44% | 0 | 0.9× | измерено: hermes_run→hermes_research ×3 |
| auto-3-calltips_list_candidates | 3 | 33% | 47% | 0 | 1.4× | измерено: calltips_list_candidates→hh_list_responses ×5, demo_candidates→hh_list_responses ×4 |
| auto-3-cold_message_generate | 3 | 33% | 47% | 0 | 1.4× | измерено: cold_message_generate→hh_generate_message ×4, hh_invite_resume→hh_generate_message ×3 |
| auto-3-hh_interview_coverage | 3 | 33% | 47% | 0 | 1.4× | измерено: hh_interview_coverage→hh_portrait_completeness ×2, hh_portrait_extract→hh_portrait_completeness ×2 |
| auto-2-list_pages ⚠ | 2 | 50% | 50% | 0 | 1.0× | измерено: tilda_list_pages→list_pages ×4 |
| auto-2-expo_enable ⚠ | 2 | 50% | 50% | 2 | 1.0× | измерено: flexi_set_exhibition→expo_enable ×3 |
| auto-2-dev_workspace_setup ⚠ | 2 | 50% | 50% | 3 | 1.0× | измерено: dev_workspace_setup→engineering_spawn_workspace ×2 |
| auto-2-playbook_batch_status ⚠ | 2 | 50% | 50% | 2 | 1.0× | измерено: playbook_health→playbook_batch_status ×2 |
| auto-4-get_chat_history | 4 | 25% | 55% | 0 | 2.2× | измерено: last_messages→get_chat_history ×4, get_chat_history→load_full_context ×2, get_group_history→get_chat_history ×2 |
| auto-4-browser_session_autologin | 4 | 25% | 55% | 0 | 2.2× | измерено: browser_session_login→web_login ×3, web_login→browser_session_autologin ×2, website_request→browser_session_autologin ×2 |
| auto-4-calltips_prepare | 4 | 25% | 55% | 0 | 2.2× | измерено: hh_interview_structure→interview_analyze ×3, calltips_prepare→hh_interview_structure ×2, video_analyze_batch→interview_analyze ×2 |
| auto-3-ba_write_spec | 3 | 33% | 58% | 0 | 1.8× | измерено: engineering_generate_spec→engineering_generate_all ×2, engineering_generate_spec→ba_write_spec ×2 |
| auto-2-github_pr_checks | 2 | 50% | 60% | 0 | 1.2× | измерено: github_pr_checks→pr_status ×4 |
| auto-2-hh_proactive_search | 2 | 50% | 60% | 0 | 1.2× | измерено: hh_proactive_view→hh_proactive_search ×3 |
| auto-2-applylink_list_vacancies | 2 | 50% | 60% | 0 | 1.2× | измерено: applylink_list_vacancies→hh_list_vacancies ×2 |
| auto-2-web_open | 2 | 50% | 60% | 0 | 1.2× | измерено: web_open→web_text ×2 |
| auto-4-agent_store_artifact | 4 | 25% | 65% | 1 | 2.6× | измерено: agent_store_artifact→context_set ×5, tilda_set_config→context_set ×3, engineering_generation_note→context_set ×2 |
| auto-3-browser_session_evaluate | 3 | 33% | 67% | 0 | 2.0× | измерено: get_page_content→browser_session_evaluate ×2, tilda_get_page→get_page_content ×2 |
| auto-2-github_status | 2 | 50% | 67% | 0 | 1.3× | измерено: github_status→nalog_get_profile ×2 |
| auto-2-gdrive_public_sheet | 2 | 50% | 70% | 0 | 1.4× | измерено: gdrive_public_sheet→gdrive_read_file ×5 |
| auto-2-ba_export_client_doc | 2 | 50% | 70% | 0 | 1.4× | измерено: ba_export_client_doc→doc_export ×4 |
| auto-2-cicd_track_pr | 2 | 50% | 70% | 0 | 1.4× | измерено: task_item_wait→cicd_track_pr ×3 |
| auto-2-expo_pipeline_set_criteria | 2 | 50% | 70% | 0 | 1.4× | измерено: expo_pipeline_set_site_config→expo_pipeline_set_criteria ×2 |
| auto-2-search_exa | 2 | 50% | 70% | 0 | 1.4× | измерено: search_exa→search_serper ×2 |
| auto-3-playbook_run | 3 | 33% | 73% | 0 | 2.2× | измерено: reproject_apply→playbook_run ×2, task_update→playbook_run ×2 |
| auto-4-agent_knowledge_summary | 4 | 25% | 75% | 0 | 3.0× | измерено: context_get→load_full_context ×4, engineering_repo_context→context_get ×3, agent_knowledge_summary→context_get ×2 |
| auto-2-candidate_report_context | 2 | 50% | 80% | 0 | 1.6× | измерено: candidate_report_context→hh_portrait_update ×2 |
| auto-2-hh_extract_ats_config | 2 | 50% | 80% | 1 | 1.6× | измерено: hh_extract_ats_config→interview_set_criteria ×2 |
| auto-2-freelance_list | 2 | 50% | 89% | 0 | 1.8× | измерено: tilda_list_all_projects→freelance_list ×2 |
| auto-2-engineering_prepare_task | 2 | 50% | 90% | 0 | 1.8× | измерено: task_create→engineering_prepare_task ×3 |
| auto-2-gc_user_notifications | 2 | 50% | 90% | 0 | 1.8× | измерено: gc_user_notifications→hh_get_messages ×2 |
| auto-3-playbook_edit | 3 | 33% | 100% | 0 | 3.0× | измерено: task_item_add→playbook_edit ×4, task_item_update→playbook_edit ×2 |
| auto-2-ba_clarify_requirements | 2 | 50% | 100% | 0 | 2.0× | измерено: ba_clarify_requirements→engineering_estimate_complexity ×3 |
| auto-2-expo_pipeline_qualify | 2 | 50% | 100% | 0 | 2.0× | измерено: expo_pipeline_qualify→expo_pipeline_run ×3 |
