# Level-2 selection eval — free profile

Run: 2026-10-02T16:41:08.118Z · seed 20261002 · runs 1 · concurrency 5 · shuffle true · distractors 0
Catalog: 331 tools / 76 groups, names-only (~2029 tokens)
Corpus: 1579 tasks

## Итог

| Метрика | Значение |
|---|---|
| Оценено (без unavailable) | 1579 / 1579 |
| Точность выбора | 66.9% (1056/1579) |
| Недоступные провайдеры | 0 |
| Ошибки парсинга ответа | 0 |
| Средняя задержка | 3479 мс |
| Средние токены на ответ | 3175 |

## По категориям

| Категория | Всего | Верно | Ошибка | Недоступно | Точность |
|---|---|---|---|---|---|
| undefined | 1579 | 1056 | 523 | 0 | 66.9% |

## Какие модели реально отвечали

Фиксируем фактически отработавшую модель: незаметный fallback не должен менять оценку.

| Модель | Ответов |
|---|---|
| opencode-go/deepseek-v4-flash | 1566 |
| opencode-go/longcat-2.5-preview-free | 10 |
| opencode-go/mimo-v2.6-flash | 2 |
| opencode-go/qwen3.8-flash | 1 |

## Худшие инструменты

Инструменты, которые маршрутизируются хуже всех. Это и есть список на переименование:
не «красивое имя», а имя, по которому маршрутизатор не может понять назначение.

| Инструмент | Попыток | Верно | Точность |
|---|---|---|---|
| gen:agent_query_artifacts | 5 | 0 | 0.0% |
| gen:agent_store_artifact | 5 | 0 | 0.0% |
| gen:ba_clarify_requirements | 5 | 0 | 0.0% |
| gen:browser_session_url | 5 | 0 | 0.0% |
| gen:calltips_list_candidates | 5 | 0 | 0.0% |
| gen:candidate_report_context | 5 | 0 | 0.0% |
| gen:checko_get | 5 | 0 | 0.0% |
| gen:cold_message_generate | 5 | 0 | 0.0% |
| gen:context_get | 5 | 0 | 0.0% |
| gen:dadata_find | 5 | 0 | 0.0% |
| gen:dadata_suggest | 5 | 0 | 0.0% |
| gen:demo_candidate_profile | 5 | 0 | 0.0% |
| gen:demo_candidates | 5 | 0 | 0.0% |
| gen:engineering_generation_note | 5 | 0 | 0.0% |
| gen:fetch_exa | 5 | 0 | 0.0% |
| gen:flexi_get_notes | 5 | 0 | 0.0% |
| gen:flexi_get_notes_bulk | 5 | 0 | 0.0% |
| gen:flexi_set_exhibition | 5 | 0 | 0.0% |
| gen:freelance_add_info | 5 | 0 | 0.0% |
| gen:freelance_assess | 5 | 0 | 0.0% |
| gen:freelance_get_project | 5 | 0 | 0.0% |
| gen:gc_connect | 5 | 0 | 0.0% |
| gen:gdrive_public_folder | 5 | 0 | 0.0% |
| gen:gdrive_public_sheet | 5 | 0 | 0.0% |
| gen:gdrive_status | 5 | 0 | 0.0% |
| gen:get_group_history | 5 | 0 | 0.0% |
| gen:hermes_candidate_report | 5 | 0 | 0.0% |
| gen:hermes_run | 5 | 0 | 0.0% |
| gen:hh_candidate_profile | 5 | 0 | 0.0% |
| gen:hh_set_publish_domain | 5 | 0 | 0.0% |
| gen:interview_set_criteria | 5 | 0 | 0.0% |
| gen:playbook_health | 5 | 0 | 0.0% |
| gen:search_exa | 5 | 0 | 0.0% |
| gen:task_item_add | 5 | 0 | 0.0% |
| gen:task_item_result | 5 | 0 | 0.0% |
| gen:task_item_update | 5 | 0 | 0.0% |
| gen:tilda_get_page | 5 | 0 | 0.0% |
| gen:tilda_list_pages | 5 | 0 | 0.0% |
| gen:tilda_set_config | 5 | 0 | 0.0% |
| gen:web_login | 5 | 0 | 0.0% |

## Ошибки выбора

| Задача | Категория | Запрос | Ожидалось | Получено |
|---|---|---|---|---|
| gen:agent_knowledge_summary | undefined | Что обо мне знаешь? | agent_knowledge_summary | context_get |
| gen:agent_knowledge_summary | undefined | Не могли бы вы показать, что вы обо мне сохранили? | agent_knowledge_summary | context_list |
| gen:agent_knowledge_summary | undefined | Скинь всю инфу, что ты обо мне записал. | agent_knowledge_summary | load_full_context |
| gen:agent_knowledge_summary | undefined | Покажи что ты обо мне знаеш. | agent_knowledge_summary | context_get |
| gen:agent_query_artifacts | undefined | Что ты обо мне знаешь? | agent_query_artifacts | load_full_context |
| gen:agent_query_artifacts | undefined | Не мог бы ты поискать, что ты сохранил обо мне раньше? | agent_query_artifacts | context_list |
| gen:agent_query_artifacts | undefined | Пробей по старым данным, что ты обо мне знаешь. | agent_query_artifacts | context_get |
| gen:agent_query_artifacts | undefined | Перед тем как продолжить, вспомни, что ты знаешь о моём проекте из прошлых разговоров. | agent_query_artifacts | load_full_context |
| gen:agent_query_artifacts | undefined | Что ты помнишь о моём проекте из предыдующих сессий? | agent_query_artifacts | context_get |
| gen:agent_store_artifact | undefined | Запомни на будущее | agent_store_artifact | context_set |
| gen:agent_store_artifact | undefined | Будьте добры, сохраните это для следующих сессий | agent_store_artifact | context_set |
| gen:agent_store_artifact | undefined | Запиши в память, чтобы между сессиями не слетело | agent_store_artifact | context_set |
| gen:agent_store_artifact | undefined | После того как закончим, запомни этот факт для будущих сессий | agent_store_artifact | context_set |
| gen:agent_store_artifact | undefined | Запони эту ссылку, чтобы в следующей сессии она была | agent_store_artifact | context_set |
| gen:applylink_create_vacancy | undefined | Ссылку на вакансию | applylink_create_vacancy | — |
| gen:applylink_create_vacancy | undefined | Скинь плиз ссылку на вакансию | applylink_create_vacancy | hh_list_vacancies |
| gen:applylink_list_vacancies | undefined | Список вакансий | applylink_list_vacancies | — |
| gen:applylink_list_vacancies | undefined | Не могли бы вы показать все вакансии со ссылками и статусами? | applylink_list_vacancies | hh_list_vacancies |
| gen:applylink_list_vacancies | undefined | Скинь выгрузку по всем вакансиям | applylink_list_vacancies | — |
| gen:applylink_list_vacancies | undefined | Перед тем как обновить вакансию, покажи список всех | applylink_list_vacancies | hh_list_vacancies |
| gen:ba_clarify_requirements | undefined | Оцени масштаб и спроси что непонятно | ba_clarify_requirements | engineering_estimate_complexity |
| gen:ba_clarify_requirements | undefined | Будьте добры, уточните, пожалуйста, детали задачи и оцените её объём перед началом работы. | ba_clarify_requirements | engineering_estimate_complexity |
| gen:ba_clarify_requirements | undefined | Давай быстро разберись, что за таска, и задай вопросы, чтобы понять, мелкая она или жирная. | ba_clarify_requirements | engineering_estimate_complexity |
| gen:ba_clarify_requirements | undefined | После того как ты получишь задачу, сначала уточни у меня всё, что неясно, и определи, это мелочь или фича. | ba_clarify_requirements | playbook_draft |
| gen:ba_clarify_requirements | undefined | Пжлст, прежд чем делать, уточни задачу и размер её, шоб понять, а то вдруг не так пойму. | ba_clarify_requirements | — |
| gen:ba_development_playbook | undefined | Глянь легаси дев-плейбук | ba_development_playbook | playbook_get |
| gen:ba_export_client_doc | undefined | Собери ТЗ в HTML+PDF+DOCX | ba_export_client_doc | doc_export |
| gen:ba_export_client_doc | undefined | Не могли бы вы собрать клиентское ТЗ в HTML, PDF и DOCX и проверить вёрстку? | ba_export_client_doc | doc_export |
| gen:ba_export_client_doc | undefined | Сгони клиентское ТЗ в html, pdf и док, чтобы не поплыло | ba_export_client_doc | doc_export |
| gen:ba_export_client_doc | undefined | После того как закончишь с markdown, собери его в HTML+PDF+DOCX и проверь, чтобы таблицы не рвались | ba_export_client_doc | doc_export |
| gen:browser_session_login | undefined | Войди в аккаунт | browser_session_login | — |
| gen:browser_session_login | undefined | Будьте добры, авторизуйтесь за меня, я дам логин и пароль. | browser_session_login | web_login |
| gen:browser_session_login | undefined | После того как откроется форма, введи мои данные и нажми войти | browser_session_login | web_login |
| gen:browser_session_login | undefined | Введи логин и параль, и нажми вайти | browser_session_login | web_login |
| gen:browser_session_navigate | undefined | Открой URL | browser_session_navigate | web_open |
| gen:browser_session_status | undefined | Не могли бы вы проверить, работает ли браузер для Tilda? | browser_session_status | ru_browser_fetch |
| gen:browser_session_status | undefined | Глянь, noVNC поднялся? | browser_session_status | engineering_workspace_status |
| gen:browser_session_url | undefined | Открой удаленный браузер | browser_session_url | — |
| gen:browser_session_url | undefined | Будьте добры, создайте ссылку на браузер для сайта с IP-привязкой, я сам введу логин и пароль | browser_session_url | connect |
| gen:browser_session_url | undefined | Скинь урл на виртуалку для Tilda, там токен нужен | browser_session_url | tilda_create_staging |
| gen:browser_session_url | undefined | Перед тем как логиниться на сайт с аппаратным токеном, дай ссылку на удаленный браузер | browser_session_url | connect |
| gen:browser_session_url | undefined | Открой броузерную сесию для сайта с IP-привязкой | browser_session_url | browser_session_navigate |
| gen:calltips_get_login | undefined | Дай токен для Call Tips | calltips_get_login | — |
| gen:calltips_get_login | undefined | Скинь токен и профиль для Call Tips | calltips_get_login | — |
| gen:calltips_get_login | undefined | Дай токин для Call Tips | calltips_get_login | — |
| gen:calltips_list_candidates | undefined | Кто откликнулся? | calltips_list_candidates | hh_list_responses |
| gen:calltips_list_candidates | undefined | Покажите, пожалуйста, список откликов. | calltips_list_candidates | hh_list_responses |
| gen:calltips_list_candidates | undefined | Скинь отклики, будем интервью мутить. | calltips_list_candidates | hh_list_responses |
| gen:calltips_list_candidates | undefined | Перед тем как строить планы, покажи, кто откликнулся. | calltips_list_candidates | hh_list_responses |
| gen:calltips_list_candidates | undefined | Пакажи список откликнувшихся. | calltips_list_candidates | hh_list_responses |
| gen:calltips_prepare | undefined | План интервью с Ивановым | calltips_prepare | hh_interview_structure |
| gen:calltips_prepare | undefined | Будьте добры, подготовьте план вопросов для звонка с Анной | calltips_prepare | interview_questions_bank |
| gen:calltips_prepare | undefined | Собери планчик на созвон с Козловым | calltips_prepare | playbook_draft |
| gen:calltips_prepare | undefined | Перед тем как позвонить Петрову, подготовь план для интервью | calltips_prepare | hh_interview_structure |
| gen:candidate_report_add_note | undefined | Запиши в требования. | candidate_report_add_note | ba_write_spec |
| gen:candidate_report_add_note | undefined | После того как обновишь профиль, запиши в требования, что нюансы подавать честно. | candidate_report_add_note | — |
| gen:candidate_report_add_note | undefined | Добавь в требования к кандитату. | candidate_report_add_note | hh_vacancy_update_draft |
| gen:candidate_report_context | undefined | Обнови профиль | candidate_report_context | hh_portrait_update |
| gen:candidate_report_context | undefined | Будьте добры, покажите требования к профилю | candidate_report_context | interview_get_criteria |
| gen:candidate_report_context | undefined | Скинь вводные по профилю | candidate_report_context | — |
| gen:candidate_report_context | undefined | Перед тем как обновить профиль, дай требования | candidate_report_context | hh_portrait_completeness |
| gen:candidate_report_context | undefined | Обнови профль | candidate_report_context | hh_portrait_update |
| gen:candidate_report_render | undefined | Пожалуйста, соберите HTML-профиль кандидата, проверьте на запрещённые фразы и опубликуйте | candidate_report_render | — |
| gen:candidate_report_render | undefined | Собери HTML-профиль кандидата, проверь на запретные фразы и опублекуй | candidate_report_render | — |
| gen:checko_get | undefined | Пробей ИНН 7701234567 | checko_get | company_get_by_inn |
| gen:checko_get | undefined | Подскажите, пожалуйста, что можно узнать по ИНН 7701234567? | checko_get | company_get_by_inn |
| gen:checko_get | undefined | Пробей по инн 7701234567, что за контора | checko_get | company_get_by_inn |
| gen:checko_get | undefined | Перед тем как ответить клиенту, пробей ИНН 7701234567 | checko_get | company_get_by_inn |
| gen:checko_get | undefined | прбей инн 7701234567 | checko_get | company_get_by_inn |
| gen:checko_qualify | undefined | Флекси по чекко? | checko_qualify | — |
| gen:checko_qualify | undefined | Глянь, это флекси по чекко? | checko_qualify | checko_get |
| gen:checko_qualify | undefined | Проверь кампаню по чекко на флекси | checko_qualify | — |
| gen:cold_message_generate | undefined | Сообщение: резюме и вакансия | cold_message_generate | — |
| gen:cold_message_generate | undefined | Не могли бы вы составить сообщение для кандидата на основе его резюме и описания вакансии? | cold_message_generate | hh_generate_message |
| gen:cold_message_generate | undefined | Накидай сообщение по резюме и вакансии для кандидата | cold_message_generate | hh_generate_message |
| gen:cold_message_generate | undefined | После того как я пришлю резюме и вакансию, сгенерируй сообщение кандидату | cold_message_generate | hh_generate_message |
| gen:cold_message_generate | undefined | Сосатвь сообщение по резюме и вакансии | cold_message_generate | hh_generate_message |
| gen:company_review | undefined | Пробей Сбер | company_review | company_find_by_name |
| gen:company_review | undefined | Будьте добры, пробейте компанию Яндекс | company_review | company_find_by_name |
| gen:company_review | undefined | Пробей контору Газпром | company_review | company_find_by_name |
| gen:company_review | undefined | Пробей кампанию Тинькофф | company_review | company_find_by_name |
| gen:company_set_dadata_token | undefined | Сохрани токен ДаДата | company_set_dadata_token | — |
| gen:company_set_dadata_token | undefined | Будьте добры, сохраните токен ДаДата | company_set_dadata_token | — |
| gen:company_set_dadata_token | undefined | Сохрни тоен дадата | company_set_dadata_token | — |
| gen:connect | undefined | Будьте добры, сделайте ссылку для авторизации в Figma | connect | — |
| gen:connect | undefined | Запили зерокредс для linear | connect | — |
| gen:connect | undefined | После того как я подготовлю поля, создай форму для входа в Kinescope | connect | credentials_form_create |
| gen:connect | undefined | Падключи гугл драйв | connect | gdrive_setup |
| gen:context_clear | undefined | Забудь всё. | context_clear | — |
| gen:context_clear | undefined | Забудь всё что я тебе расказывал. | context_clear | — |
| gen:context_get | undefined | Вспомни контекст | context_get | load_full_context |
| gen:context_get | undefined | Будьте добры, напомните, что у нас в контексте | context_get | load_full_context |
| gen:context_get | undefined | Вытащи контекст | context_get | load_full_context |
| gen:context_get | undefined | Перед тем как продолжим, напомни, что у нас в контексте | context_get | load_full_context |
| gen:context_get | undefined | Покожи, что там с контекстом | context_get | context_list |
| gen:context_set | undefined | После того как закончим, сохрани это | context_set | agent_store_artifact |
| gen:credentials_form_create | undefined | Ссылку для ввода пароля | credentials_form_create | — |
| gen:credentials_form_create | undefined | Перед тем как делать автовход, дай ссылку для ввода пароля | credentials_form_create | browser_session_autologin |
| gen:cron_create | undefined | Каждый час запускай. | cron_create | — |
| gen:cron_delete | undefined | Удали запланированное | cron_delete | — |
| gen:cron_delete | undefined | После того как всё закончится, удали задачу | cron_delete | — |
| gen:cron_run_now | undefined | Пожалуйста, запустите задачу сейчас | cron_run_now | — |
| gen:dadata_address | undefined | Забей адрес, покажи варианты | dadata_address | dadata_suggest |
| gen:dadata_address | undefined | Подскажи адрас | dadata_address | — |
| gen:dadata_find | undefined | Карточка по ИНН 7701234567 | dadata_find | company_get_by_inn |
| gen:dadata_find | undefined | Не могли бы вы найти полную информацию о компании по ИНН 7701234567? | dadata_find | company_get_by_inn |
| gen:dadata_find | undefined | Пробей ИНН 7701234567, вытащи всю инфу: директор, ОКВЭД, статус | dadata_find | inn_enrich_batch |
| gen:dadata_find | undefined | Раз уж есть ИНН 7701234567, давай полную карточку | dadata_find | company_get_by_inn |
| gen:dadata_find | undefined | Дай полную картчку по ИНН 7701234567 | dadata_find | company_get_by_inn |
| gen:dadata_suggest | undefined | Найди ИНН по названию | dadata_suggest | company_find_by_name |
| gen:dadata_suggest | undefined | Не могли бы вы найти ИНН компании по её названию? | dadata_suggest | company_find_by_name |
| gen:dadata_suggest | undefined | Пробей по названию, нужен ИНН | dadata_suggest | company_find_by_name |
| gen:dadata_suggest | undefined | После того как найдешь организацию по названию, вытащи ИНН | dadata_suggest | company_find_by_name |
| gen:dadata_suggest | undefined | Найди инн по названию кампнии | dadata_suggest | company_find_by_name |
| gen:deck_check | undefined | Проверь переполнение | deck_check | — |
| gen:demo_candidate_profile | undefined | Дай досье на кандидата. | demo_candidate_profile | hh_candidate_profile |
| gen:demo_candidate_profile | undefined | Можно посмотреть полную карточку кандидата — с опытом, навыками и перепиской? | demo_candidate_profile | hh_candidate_profile |
| gen:demo_candidate_profile | undefined | Глянь чувака по полной: скиллы, стаж и переписку. | demo_candidate_profile | hh_candidate_profile |
| gen:demo_candidate_profile | undefined | После того как закончишь с текущей задачей, покажи полный профиль кандидата: опыт, навыки и переписку. | demo_candidate_profile | hh_candidate_profile |
| gen:demo_candidate_profile | undefined | Скинь полный профиль кндидата: опыт, навыки и переписку. | demo_candidate_profile | hh_candidate_profile |
| gen:demo_candidates | undefined | Покажи отклики. | demo_candidates | hh_list_responses |
| gen:demo_candidates | undefined | Не могли бы вы показать, кто откликнулся, с их оценками и историей переписки? | demo_candidates | hh_list_responses |
| gen:demo_candidates | undefined | Скинь всех, кто наоткликался, с баллами и диалогами. | demo_candidates | hh_list_responses |
| gen:demo_candidates | undefined | Перед тем как писать кандидатам, покажи отклики с оценками и перепиской. | demo_candidates | hh_list_responses |
| gen:demo_candidates | undefined | Покажи откликнувшихся кндидатов с оценками и историей переписки. | demo_candidates | — |
| gen:demo_next_wave | undefined | Есть кто новенький? | demo_next_wave | — |
| gen:demo_next_wave | undefined | Не подскажете, появятся ли ещё отклики? | demo_next_wave | — |
| gen:demo_next_wave | undefined | После того как просмотрю этих, подкинь ещё пару-тройку резюме | demo_next_wave | hh_search_resumes |
| gen:demo_reply | undefined | Скинь кандидату сообщение и покажи его ответ | demo_reply | hh_send_message |
| gen:demo_reply | undefined | После того как напишешь кандидату, верни его ответ | demo_reply | hh_get_messages |
| gen:dev_new_repo | undefined | Создай репозиторий и workspace | dev_new_repo | — |
| gen:dev_new_repo | undefined | Не могли бы вы создать новый репозиторий и подготовить для него рабочее пространство? | dev_new_repo | — |
| gen:dev_new_repo | undefined | Замутим свежий репозиторий и сварганим изолированную рабочую зону под задачу. | dev_new_repo | — |
| gen:dev_new_repo | undefined | После того как создашь новый репозиторий, подготовь для него отдельное рабочее пространство. | dev_new_repo | dev_workspace_setup |
| gen:dev_supersede_pr | undefined | Замени #12 на #15 | dev_supersede_pr | — |
| gen:dev_supersede_pr | undefined | Закрой PR #12 как замененный #15, прокоментируй и поставь лейбл | dev_supersede_pr | — |
| gen:dev_workspace_setup | undefined | Подними воркспейс для репы | dev_workspace_setup | engineering_spawn_workspace |
| gen:dev_workspace_setup | undefined | Перед тем как я начну правки по этой задаче, сделай отдельную изолированную копию репы с веткой и установленными зависимостями, чтобы можно было тестировать. | dev_workspace_setup | engineering_spawn_workspace |
| gen:engineering_generate_all | undefined | Сделай батчем все контексты за последние 6 часов, чтобы не гонять по одному. | engineering_generate_all | — |
| gen:engineering_generate_all | undefined | Собери все контексты за последнии 6 часов и подгатовь ТЗ для каждого. | engineering_generate_all | — |
| gen:engineering_generate_spec | undefined | Long и short ТЗ | engineering_generate_spec | engineering_generate_all |
| gen:engineering_generate_spec | undefined | Будьте добры, подготовьте ТЗ в двух вариантах: long и short. | engineering_generate_spec | ba_write_spec |
| gen:engineering_generate_spec | undefined | Накидай спек на ТЗ: long и short, оба. | engineering_generate_spec | engineering_generate_all |
| gen:engineering_generate_spec | undefined | После того как соберёшь все требования, сделай long и short ТЗ. | engineering_generate_spec | ba_write_spec |
| gen:engineering_generation_note | undefined | ТЗ всегда так | engineering_generation_note | — |
| gen:engineering_generation_note | undefined | Будьте добры, запомните это правило для всех последующих генераций технического задания, пожалуйста. | engineering_generation_note | context_set |
| gen:engineering_generation_note | undefined | Запили в базу, чтобы все ТЗ теперь были такие. | engineering_generation_note | ba_client_spec_template |
| gen:engineering_generation_note | undefined | Перед тем как начнешь следующее ТЗ, учти: теперь всегда делай так. | engineering_generation_note | — |
| gen:engineering_generation_note | undefined | Запмни навсегда, что ТЗ нужо делать так. | engineering_generation_note | context_set |
| gen:engineering_pr_autofix_install | undefined | Будьте добры, установите автоправку и создайте pull request. | engineering_pr_autofix_install | — |
| gen:engineering_pr_autofix_install | undefined | Накати автофикс на репу и оформи ПР | engineering_pr_autofix_install | engineering_pr_autofix_rollout |
| gen:engineering_pr_autofix_install | undefined | После того как зарегистрируешь репозиторий, установи автоправку и открой PR | engineering_pr_autofix_install | — |
| gen:engineering_pr_autofix_install | undefined | Установи автоправку и октрой ПР | engineering_pr_autofix_install | — |
| gen:engineering_pr_autofix_register | undefined | Запили репу в автоправки: базу пропиши, фиксы и батч включи, но не активируй пока. | engineering_pr_autofix_register | engineering_pr_autofix_install |
| gen:engineering_prepare_task | undefined | Собери таск-пакет по репе | engineering_prepare_task | — |
| gen:engineering_prepare_task | undefined | Перед тем как запускать дорогую кодинг-модель, собери по локальному репо компактный инженерный пакет задачи. | engineering_prepare_task | engineering_repo_context |
| gen:engineering_repo_context | undefined | Контекст по ключам | engineering_repo_context | context_get |
| gen:engineering_repo_context | undefined | Подскажи, пожалуйста, контекст по этим ключевым словам | engineering_repo_context | context_get |
| gen:engineering_repo_context | undefined | Перед тем как писать код, дай контекст по этим ключам | engineering_repo_context | context_get |
| gen:engineering_repo_context | undefined | Дай контекст по ключевым слвам | engineering_repo_context | session_search |
| gen:engineering_spawn_workspace | undefined | Подготовь ветку | engineering_spawn_workspace | — |
| gen:engineering_spawn_workspace | undefined | Заведи новый worktree и ветку, чтобы кодить | engineering_spawn_workspace | — |
| gen:engineering_spawn_workspace | undefined | После того как решили делать PR, создай отдельную ветку | engineering_spawn_workspace | — |
| gen:engineering_spawn_workspace | undefined | Создай отдельную ветку для этой задчи | engineering_spawn_workspace | — |
| gen:expo_build_catalog | undefined | Собери каталог | expo_build_catalog | list_skills |
| gen:expo_build_catalog | undefined | Перед деплоем собери index.html | expo_build_catalog | ci_run_branch |
| gen:expo_classify_targets | undefined | Разметь целевые и почти | expo_classify_targets | — |
| gen:expo_enable | undefined | Будьте добры, активируйте выставочный пайплайн. | expo_enable | expo_pipeline_run |
| gen:expo_parse_participants | undefined | Вытащи компании из HTML | expo_parse_participants | — |
| gen:expo_parse_participants | undefined | Не могли бы вы распарсить этот HTML и выдать список компаний в CSV? | expo_parse_participants | — |
| gen:expo_parse_participants | undefined | Спарси html и выгрузи список компаний в csv | expo_parse_participants | — |
| gen:expo_parse_participants | undefined | Распарси HMTL и вытащи компании в cvs | expo_parse_participants | — |
| gen:expo_pipeline_get_criteria | undefined | Какие критерии? | expo_pipeline_get_criteria | — |
| gen:expo_pipeline_get_criteria | undefined | Покажи текущие кретерии | expo_pipeline_get_criteria | — |
| gen:expo_pipeline_get_site_config | undefined | Вытащи конфиг каталога | expo_pipeline_get_site_config | — |
| gen:expo_pipeline_qualify | undefined | Пожалуйста, примени текущие критерии к обогащённому списку и сохрани результат в targets.json | expo_pipeline_qualify | expo_pipeline_run |
| gen:expo_pipeline_qualify | undefined | Прогони обогащённый список через критерии и выгрузи таргеты | expo_pipeline_qualify | expo_pipeline_run |
| gen:expo_pipeline_qualify | undefined | Отфильтруй компании по кртериям и создай targets.json | expo_pipeline_qualify | expo_pipeline_run |
| gen:expo_pipeline_run | undefined | Сделай всё по экспо | expo_pipeline_run | — |
| gen:expo_pipeline_set_site_config | undefined | Обнови диапазоны выручки | expo_pipeline_set_site_config | expo_pipeline_set_criteria |
| gen:expo_pipeline_set_site_config | undefined | Обнови диапозоны выручки в настройках каталога | expo_pipeline_set_site_config | expo_pipeline_set_criteria |
| gen:fetch_exa | undefined | Ссылки в markdown | fetch_exa | — |
| gen:fetch_exa | undefined | Будьте добры, выгрузите эти страницы в markdown | fetch_exa | doc_export |
| gen:fetch_exa | undefined | Стяни эти урлы в md | fetch_exa | — |
| gen:fetch_exa | undefined | Перед тем как продолжить, загрузи эти ссылки в markdown | fetch_exa | — |
| gen:fetch_exa | undefined | Скачай эти стрницы в markdown | fetch_exa | ru_browser_fetch |
| gen:flexi_add_note | undefined | Добавь заметку B12 | flexi_add_note | — |
| gen:flexi_delete_note | undefined | Удали тестовую зачетку | flexi_delete_note | — |
| gen:flexi_get_notes | undefined | Статус и заметки A12? | flexi_get_notes | — |
| gen:flexi_get_notes | undefined | Будьте добры, посмотрите заметки и статус по стенду A12. | flexi_get_notes | — |
| gen:flexi_get_notes | undefined | Дай расклад по A12 | flexi_get_notes | — |
| gen:flexi_get_notes | undefined | После того как закончишь с A12, скажи, что в заметках и статус. | flexi_get_notes | — |
| gen:flexi_get_notes | undefined | Дай заметки и стасус по A12. | flexi_get_notes | — |
| gen:flexi_get_notes_bulk | undefined | Статусы и заметки стендов | flexi_get_notes_bulk | — |
| gen:flexi_get_notes_bulk | undefined | Будьте добры, статусы и заметки по этим стендам | flexi_get_notes_bulk | — |
| gen:flexi_get_notes_bulk | undefined | Скинь дайджест по стендам: кто в работе, кто с заметками | flexi_get_notes_bulk | — |
| gen:flexi_get_notes_bulk | undefined | После того как я пришлю список стендов, покажи статусы и заметки по ним | flexi_get_notes_bulk | — |
| gen:flexi_get_notes_bulk | undefined | Пакажи статусы и заметки по стендам | flexi_get_notes_bulk | — |
| gen:flexi_set_exhibition | undefined | Активируй rosupack2026 | flexi_set_exhibition | demo_activate |
| gen:flexi_set_exhibition | undefined | Будьте добры, сделайте активной выставку stonefair2026 | flexi_set_exhibition | expo_enable |
| gen:flexi_set_exhibition | undefined | Запили активку на oborot2026 | flexi_set_exhibition | expo_enable |
| gen:flexi_set_exhibition | undefined | После того как закончим с текущей, сделай активной reindustry2026 | flexi_set_exhibition | hh_set_active_vacancy |
| gen:flexi_set_exhibition | undefined | Активируй выстовку interautomechanica2026 | flexi_set_exhibition | expo_enable |
| gen:flexi_status | undefined | Что с выставкой? | flexi_status | expo_pipeline_status |
| gen:flexi_status | undefined | Не мог бы ты проверить, что сейчас активно и доступны ли заметки? | flexi_status | — |
| gen:freelance_add_info | undefined | Запиши как факт | freelance_add_info | — |
| gen:freelance_add_info | undefined | Не могли бы вы добавить это как требование? | freelance_add_info | — |
| gen:freelance_add_info | undefined | Запили в решение | freelance_add_info | — |
| gen:freelance_add_info | undefined | После того как клиент ответит, занеси это в вопросы-ответы | freelance_add_info | freelance_questions |
| gen:freelance_add_info | undefined | Добвь это как факт | freelance_add_info | — |
| gen:freelance_assess | undefined | Пересчитай риск | freelance_assess | — |
| gen:freelance_assess | undefined | Не могли бы вы обновить риск-оценку? | freelance_assess | — |
| gen:freelance_assess | undefined | Давай пересчитай риски, а то старые не катят. | freelance_assess | — |
| gen:freelance_assess | undefined | После того как я добавил все данные, пересчитай GO/NO-GO. | freelance_assess | expo_pipeline_run |
| gen:freelance_assess | undefined | Пересчтай риск и дай свежий вердикт. | freelance_assess | hh_evaluate_candidate |
| gen:freelance_classify_document | undefined | куда этот файл отнести | freelance_classify_document | — |
| gen:freelance_classify_document | undefined | сорь, кидай сюда новый файлик, нужна классика, чей он — старого проекта или новый | freelance_classify_document | tg_send_file |
| gen:freelance_get_project | undefined | Восстанови контекст | freelance_get_project | load_full_context |
| gen:freelance_get_project | undefined | Будьте добры, загрузите полный бэкграунд проекта | freelance_get_project | load_full_context |
| gen:freelance_get_project | undefined | Дай выгрузку по проекту, чтобы въехать в тему | freelance_get_project | engineering_repo_context |
| gen:freelance_get_project | undefined | Перед тем как продолжить, собери всё, что мы знаем по проекту | freelance_get_project | load_full_context |
| gen:freelance_get_project | undefined | Скинь полный контекст проэкта | freelance_get_project | engineering_repo_context |
| gen:freelance_questions | undefined | Открытые вопросы по проекту | freelance_questions | ba_clarify_requirements |
| gen:freelance_questions | undefined | Подскажите, пожалуйста, какие открытые вопросы по проекту? | freelance_questions | — |
| gen:freelance_questions | undefined | Перед тем как закончим, покажи открытые вопросы по проекту | freelance_questions | — |
| gen:freelance_search | undefined | Где в проектах бюджет? | freelance_search | — |
| gen:freelance_search | undefined | Пробей по проектам, где у нас бюджет проскочил. | freelance_search | — |
| gen:freelance_search | undefined | После того как мы обсуждали требования, найди в файлах, где это записано. | freelance_search | — |
| gen:freelance_search | undefined | Найди где мы сагласовали бюджет. | freelance_search | session_search |
| gen:gc_connect | undefined | Дай одноразовую ссылку | gc_connect | publish_page |
| gen:gc_connect | undefined | Не могли бы вы создать мне одноразовую ссылку для подключения, пожалуйста? | gc_connect | connect |
| gen:gc_connect | undefined | Скинь одноразовый линк для коннекта | gc_connect | connect |
| gen:gc_connect | undefined | После того как я введу домен и ключи, пришли мне одноразовую ссылку | gc_connect | site_deploy |
| gen:gc_connect | undefined | Дай одноразовую сылку для входа | gc_connect | — |
| gen:gc_course_create | undefined | После того как создашь курс, можно добавлять разделы. | gc_course_create | gc_section_create |
| gen:gc_lesson_sort | undefined | После того как добавил блоки, просто переставь их в нужном порядке | gc_lesson_sort | — |
| gen:gc_order_list | undefined | Скинь заказы по мылу user@mail.ru | gc_order_list | — |
| gen:gc_status | undefined | Перед тем как дёргать API, глянь, что с ключом и сессией | gc_status | connect |
| gen:gc_user_add | undefined | Заапдейть юзера и вкинь в группу | gc_user_add | — |
| gen:gc_user_add | undefined | Добавь пользвателя в группу доступа | gc_user_add | — |
| gen:gc_user_find | undefined | Пробей юзера по мылу | gc_user_find | company_find_by_email |
| gen:gc_user_notifications | undefined | Покажи письма юзера | gc_user_notifications | hh_get_messages |
| gen:gc_user_notifications | undefined | Не могли бы вы показать, какие email-уведомления получал этот пользователь? | gc_user_notifications | — |
| gen:gc_user_notifications | undefined | Скинь список писем, которые ушли на мыло этого юзера | gc_user_notifications | hh_get_messages |
| gen:gdrive_delete_file | undefined | Удали в корзину | gdrive_delete_file | — |
| gen:gdrive_delete_file | undefined | После того как закончишь с ним, удали файл | gdrive_delete_file | — |
| gen:gdrive_docs_get_structure | undefined | Дай структуру с индексами | gdrive_docs_get_structure | — |
| gen:gdrive_docs_insert_text | undefined | После того как закончится список, добавь еще один пункт. | gdrive_docs_insert_text | — |
| gen:gdrive_public_folder | undefined | Что в папке? | gdrive_public_folder | — |
| gen:gdrive_public_folder | undefined | Будьте добры, перечислите файлы из этой папки Google Drive. | gdrive_public_folder | gdrive_list_files |
| gen:gdrive_public_folder | undefined | Глянь, что за файлы в этой гугл-папке? | gdrive_public_folder | gdrive_list_files |
| gen:gdrive_public_folder | undefined | Перед тем как читать какой-либо файл, покажи список файлов в папке. | gdrive_public_folder | gdrive_list_files |
| gen:gdrive_public_folder | undefined | Скинь список файлов в етой гугл-папке | gdrive_public_folder | gdrive_list_files |
| gen:gdrive_public_sheet | undefined | Прочитай гугл-таблицу | gdrive_public_sheet | gdrive_read_file |
| gen:gdrive_public_sheet | undefined | Будьте добры, прочитайте данные из этой гугл-таблицы | gdrive_public_sheet | gdrive_read_file |
| gen:gdrive_public_sheet | undefined | Глянь, что в гугл-табличке | gdrive_public_sheet | gdrive_read_file |
| gen:gdrive_public_sheet | undefined | Перед тем как ответить, прочитай эту гугл-таблицу | gdrive_public_sheet | gdrive_read_file |
| gen:gdrive_public_sheet | undefined | Прочитай гугл-таблитсу | gdrive_public_sheet | gdrive_read_file |
| gen:gdrive_status | undefined | Драйв ок? Файлы? | gdrive_status | — |
| gen:gdrive_status | undefined | Не подскажете, драйв в порядке и сколько файлов в нем? | gdrive_status | — |
| gen:gdrive_status | undefined | Драйв пашет? Сколько файлов? | gdrive_status | gdrive_list_files |
| gen:gdrive_status | undefined | Перед тем как продолжить, проверь драйв и сколько файлов доступно. | gdrive_status | gdrive_list_files |
| gen:gdrive_status | undefined | Проверь драйв и сколь файлов доступно. | gdrive_status | gdrive_list_files |
| gen:gdrive_update_file | undefined | Заткни туда новый json в плейн-файл конфига, там старые кей-вэлу вообще устарели | gdrive_update_file | — |
| gen:gdrive_update_file | undefined | Замени текс в файле ррхдшлдшсд.txt новым содержимым: «версия 3» | gdrive_update_file | — |
| gen:get_chat_history | undefined | Будьте добры, напомните, о чём мы говорили в прошлый раз. | get_chat_history | load_full_context |
| gen:get_chat_history | undefined | Перед тем как ты вчера отключился, мы что-то обсуждали. Скинь, что было. | get_chat_history | load_full_context |
| gen:get_group_file | undefined | Забери файл 12345 | get_group_file | — |
| gen:get_group_file | undefined | Скачай файл с айдишника 12345 | get_group_file | gdrive_read_file |
| gen:get_group_file | undefined | Скачай фаил из собщения 12345 | get_group_file | — |
| gen:get_group_history | undefined | Что писали без тебя? | get_group_history | get_new_messages |
| gen:get_group_history | undefined | Не могли бы вы показать, что писали в чате, пока вы были недоступны? | get_group_history | get_new_messages |
| gen:get_group_history | undefined | Скинь, че тут в треде накалякали, пока ты в ауте. | get_group_history | get_new_messages |
| gen:get_group_history | undefined | Перед тем как ты вернулся, что тут обсуждали? | get_group_history | get_chat_history |
| gen:get_group_history | undefined | что петя писал утром? пока ты малчал | get_group_history | get_chat_history |
| gen:get_new_messages | undefined | Есть от меня? | get_new_messages | — |
| gen:get_new_messages | undefined | Глянь, я тебе черканул | get_new_messages | — |
| gen:get_new_messages | undefined | Перед тем как ответить, посмотри, я тебе писал | get_new_messages | get_chat_history |
| gen:get_page_content | undefined | Скинь исходник страницы | get_page_content | ru_browser_fetch |
| gen:get_page_content | undefined | Перед тем как вносить правки, подгрузи текущий source страницы | get_page_content | browser_session_evaluate |
| gen:get_page_content | undefined | Скинь текущий исоходник страници | get_page_content | browser_session_evaluate |
| gen:github_list_issues | undefined | Покажи ишью и PR | github_list_issues | — |
| gen:github_list_issues | undefined | Глянь ишью и пул-реквесты | github_list_issues | — |
| gen:github_list_issues | undefined | Покжи ишью и PR | github_list_issues | — |
| gen:github_pr_checks | undefined | Статус PR с ошибкой | github_pr_checks | pr_status |
| gen:github_pr_checks | undefined | Будьте добры, проверьте статус PR, а если его нет — сообщите об ошибке | github_pr_checks | pr_status |
| gen:github_pr_checks | undefined | После того как CI пройдет, покажи статус PR с ошибкой, если он не найден | github_pr_checks | pr_status |
| gen:github_pr_checks | undefined | Статус ПР, если не найден, выдовай ошибку | github_pr_checks | pr_status |
| gen:github_search | undefined | Чекни на гитхабе | github_search | — |
| gen:github_status | undefined | Кто я по токену? | github_status | — |
| gen:github_status | undefined | Пробей мой токен, скажи, под кем я. | github_status | nalog_get_profile |
| gen:github_status | undefined | Перед тем как отправить запрос, проверь мой токен и покажи, кто я. | github_status | — |
| gen:github_status | undefined | Проверь мой токен и покажи инфу о поьзователе | github_status | nalog_get_profile |
| gen:github_update_issue | undefined | измени заголовок задачи 42 | github_update_issue | task_update |
| gen:hermes_candidate_report | undefined | Собери отчёт по кандидату | hermes_candidate_report | candidate_report_render |
| gen:hermes_candidate_report | undefined | Будьте добры, подготовьте сводку по кандидату на основе резюме, вакансии и, если есть, интервью. | hermes_candidate_report | candidate_report_render |
| gen:hermes_candidate_report | undefined | Слепи кандидатский репорт из резюме, вакансии и интервью, если оно есть. | hermes_candidate_report | candidate_report_render |
| gen:hermes_candidate_report | undefined | После того как пришлю резюме и текст вакансии, собери по ним единый отчёт по кандидату. | hermes_candidate_report | candidate_report_render |
| gen:hermes_candidate_report | undefined | Собери отчёт по кндидату из резюме и вакансии, если есть интервью тоже учти. | hermes_candidate_report | candidate_report_render |
| gen:hermes_research | undefined | Найди в интернете. | hermes_research | search_serp_free |
| gen:hermes_run | undefined | Исследуй и верни JSON | hermes_run | hermes_research |
| gen:hermes_run | undefined | Будьте добры, проведите исследование и верните результат в JSON | hermes_run | hermes_research |
| gen:hermes_run | undefined | Прогони задачку на исследование и скинь JSON | hermes_run | hermes_research |
| gen:hermes_run | undefined | После того как закончишь с предыдущим, выполни это исследование и верни ответ в JSON | hermes_run | — |
| gen:hermes_run | undefined | Исследуй тему и верни резульат в JSON | hermes_run | — |
| gen:hh_api_call | undefined | Сделай произвольный запрос | hh_api_call | — |
| gen:hh_api_call | undefined | Дерни произвольный эндпоинт | hh_api_call | — |
| gen:hh_api_call | undefined | Сделай произвольнй запрос к API | hh_api_call | — |
| gen:hh_batch_evaluate | undefined | Оцени всех | hh_batch_evaluate | — |
| gen:hh_bulk_reject | undefined | Закрой вакансию, отклони всех | hh_bulk_reject | — |
| gen:hh_bulk_reject | undefined | Не могли бы вы закрыть вакансию и отклонить всех активных кандидатов? | hh_bulk_reject | — |
| gen:hh_bulk_reject | undefined | Закрой вакансию и отфутболь всех кандидатов | hh_bulk_reject | — |
| gen:hh_bulk_reject | undefined | Закрой вакансию и отклони всех кадидатов | hh_bulk_reject | — |
| gen:hh_candidate_profile | undefined | Сделай md-профиль кандидата | hh_candidate_profile | candidate_report_render |
| gen:hh_candidate_profile | undefined | Будьте добры, оформите кандидата в markdown для показа клиенту | hh_candidate_profile | candidate_report_render |
| gen:hh_candidate_profile | undefined | Накидай презенташку по кандидату в markdown, клиенту показать | hh_candidate_profile | candidate_report_render |
| gen:hh_candidate_profile | undefined | Перед тем как отправить клиенту, подготовь чистый markdown-профиль кандидата | hh_candidate_profile | candidate_report_render |
| gen:hh_candidate_profile | undefined | Сделай markdowm-профиль кандидата для нанимающего менеджера | hh_candidate_profile | candidate_report_render |
| gen:hh_connect | undefined | Дай ссылку для HH | hh_connect | — |
| gen:hh_deactivate_vacancy | undefined | Отключи отслеживание. | hh_deactivate_vacancy | — |
| gen:hh_deactivate_vacancy | undefined | После того как я откликнулся, убери её из отслеживания. | hh_deactivate_vacancy | — |
| gen:hh_discover | undefined | Что можн сделать через апи хедхантера? Нужно найти как менять статус отклика | hh_discover | hh_move_candidate |
| gen:hh_draft_review_page | undefined | сделай страницу с кандидатами | hh_draft_review_page | — |
| gen:hh_evaluate_candidate | undefined | После того как пришлют резюме и сопроводительное, сразу прогони через ATS и дай балл | hh_evaluate_candidate | hh_evaluate_resume |
| gen:hh_evaluate_resume | undefined | Прогони резюме по ATS-рубрике, как отклики | hh_evaluate_resume | hh_portrait_to_ats |
| gen:hh_extract_ats_config | undefined | Сгенерируй конфиг по вакансии. | hh_extract_ats_config | — |
| gen:hh_extract_ats_config | undefined | Будьте добры, подготовьте из текста вакансии список обязательных и желательных измеримых критериев с весами и порогами баллов. | hh_extract_ats_config | interview_set_criteria |
| gen:hh_extract_ats_config | undefined | Накидай скоринг по вакансии: обязательные и желательные фичи с весами и порогами, без отсечек. | hh_extract_ats_config | hh_proactive_scoring_prompt |
| gen:hh_extract_ats_config | undefined | Зделай конфиг для оценки по вакансии: нужные и желательные критерии с весами и порогами. | hh_extract_ats_config | interview_set_criteria |
| gen:hh_funnel_stats | undefined | Будьте добры, покажите, пожалуйста, сколько кандидатов на каждом этапе, есть ли непрочитанные сообщения и новые отклики по активной вакансии. | hh_funnel_stats | — |
| gen:hh_generate_message | undefined | Сгенерируй сообщение кандидату | hh_generate_message | — |
| gen:hh_generate_message | undefined | Накидай сообщение кандидату | hh_generate_message | cold_message_generate |
| gen:hh_generate_message | undefined | Сгенерируй саобщение кандидату | hh_generate_message | — |
| gen:hh_interview_coverage | undefined | Что из портрета пропустили? | hh_interview_coverage | hh_portrait_completeness |
| gen:hh_interview_coverage | undefined | Что из портрета требоаний не упомянуто? | hh_interview_coverage | hh_portrait_completeness |
| gen:hh_interview_evaluate | undefined | После того как структура по слагу будет на месте, прогони оценку по портрету вакансии. | hh_interview_evaluate | hh_portrait_completeness |
| gen:hh_interview_structure | undefined | Разбей интервью на Q&A | hh_interview_structure | interview_analyze |
| gen:hh_interview_structure | undefined | Помогите, пожалуйста, разметить интервью по ролям и вопросам-ответам | hh_interview_structure | interview_analyze |
| gen:hh_interview_structure | undefined | После того как загрузишь интервью, распарси его на диалог с указанием говорящих | hh_interview_structure | hh_interview_transcribe |
| gen:hh_interview_structure | undefined | Разбей интервью на вопросы и ответы, определи кто спрашивает | hh_interview_structure | interview_analyze |
| gen:hh_invite_resume | undefined | Пригласи на созвон | hh_invite_resume | — |
| gen:hh_invite_resume | undefined | Будьте добры, пригласите кандидата на телефонное интервью. Покажите текст сообщения для подтверждения | hh_invite_resume | hh_generate_message |
| gen:hh_invite_resume | undefined | Заинвай кандидата на созвон, но сначала покажи текст | hh_invite_resume | hh_generate_message |
| gen:hh_invite_resume | undefined | Пригласи кандитата на телефонное интервью, покажи текст перед отправкой | hh_invite_resume | hh_generate_message |
| gen:hh_portrait_extract | undefined | Собери портрет по вакансии и клиентской переписке, скинь полноту в процентах и что проседает | hh_portrait_extract | hh_portrait_completeness |
| gen:hh_portrait_extract | undefined | Сабери портрет кандитата из вакансии и писем, скажи чего не хватает | hh_portrait_extract | hh_portrait_completeness |
| gen:hh_portrait_get | undefined | Портрет по вакансии? | hh_portrait_get | hh_portrait_extract |
| gen:hh_portrait_get | undefined | Подскажите, пожалуйста, что уже известно о требованиях к этой вакансии? | hh_portrait_get | hh_vacancy_get_draft |
| gen:hh_portrait_update | undefined | Обнови требования кандидата | hh_portrait_update | interview_set_criteria |
| gen:hh_proactive_queries | undefined | Перед тем как запустить поиск, сбрось сохранённые поисковые фразы. | hh_proactive_queries | — |
| gen:hh_proactive_schedule | undefined | Выключи автопоиск | hh_proactive_schedule | — |
| gen:hh_proactive_schedule | undefined | Не могли бы вы проверить статус автопоиска? | hh_proactive_schedule | hh_proactive_view |
| gen:hh_proactive_scoring_prompt | undefined | Как подбирал? | hh_proactive_scoring_prompt | — |
| gen:hh_proactive_scoring_prompt | undefined | После того как ты подобрал кандидатов, покажи, почему ты их выбрал. | hh_proactive_scoring_prompt | candidate_report_render |
| gen:hh_proactive_scoring_prompt | undefined | Как ты подбирал? Пакажи критерии. | hh_proactive_scoring_prompt | — |
| gen:hh_proactive_view | undefined | Открой проактивный поиск | hh_proactive_view | hh_proactive_search |
| gen:hh_proactive_view | undefined | После того как соберешь фидбек, открой проактивный поиск | hh_proactive_view | hh_proactive_search |
| gen:hh_proactive_view | undefined | Открой проактивный посик кандидатов | hh_proactive_view | hh_proactive_search |
| gen:hh_regenerate_messages | undefined | Обнови все черновики | hh_regenerate_messages | — |
| gen:hh_search_resumes | undefined | Перед тем как открывать контакты, покажи список резюме по вакансии | hh_search_resumes | hh_list_responses |
| gen:hh_send_message | undefined | Перед тем как отправить сообщение кандидату на hh, покажи его мне | hh_send_message | hh_generate_message |
| gen:hh_set_publish_domain | undefined | Где мой домен? | hh_set_publish_domain | — |
| gen:hh_set_publish_domain | undefined | Подскажите, пожалуйста, какой сейчас домен для публикации? | hh_set_publish_domain | — |
| gen:hh_set_publish_domain | undefined | На каком адресе крутим публикации? | hh_set_publish_domain | — |
| gen:hh_set_publish_domain | undefined | Перед тем как сгенерировать страницу, скажи, какой домен будет использоваться. | hh_set_publish_domain | — |
| gen:hh_set_publish_domain | undefined | Какой у меня домен публикаци? | hh_set_publish_domain | — |
| gen:hh_set_rejection_template | undefined | Покажи шаблон отказа | hh_set_rejection_template | rejection_with_feedback |
| gen:hh_status | undefined | ХХ подключен? | hh_status | — |
| gen:hh_status | undefined | ХХ на связи? | hh_status | — |
| gen:hh_sync_messages | undefined | Перед тем как открыть ревью, подтяни переписку по вакансии | hh_sync_messages | hh_get_messages |
| gen:hh_vacancy_publish_page | undefined | Дай ссылку на лендинг | hh_vacancy_publish_page | — |
| gen:hh_vacancy_publish_page | undefined | Задеплой черновик и скинь URL | hh_vacancy_publish_page | publish_page |
| gen:hh_vacancy_publish_page | undefined | После того как поправишь черновик, опубликуй и дай ссылку | hh_vacancy_publish_page | publish_page |
| gen:hh_vacancy_publish_page | undefined | Опубликуй ченовик и дай сылку | hh_vacancy_publish_page | publish_page |
| gen:illustrate_generate | undefined | Не могли бы вы сгенерировать иллюстрацию и отправить её в Telegram? | illustrate_generate | — |
| gen:illustrate_generate | undefined | Запили учебную иллюстрацию и кинь в телегу | illustrate_generate | — |
| gen:illustrate_generate | undefined | После того как покажешь промт и я подтвержу, сгенерируй иллюстрацию и пришли | illustrate_generate | illustrate_preview_prompt |
| gen:illustrate_generate | undefined | Сгенерируй иллюстрацыю и отправь в телеграм | illustrate_generate | — |
| gen:illustrate_preview_prompt | undefined | Покажи промпт | illustrate_preview_prompt | — |
| gen:illustrate_preview_prompt | undefined | Дай глянуть промпт, не генеря | illustrate_preview_prompt | playbook_get |
| gen:illustrate_refine | undefined | Сделай потемнее | illustrate_refine | — |
| gen:illustrate_setup | undefined | Активируй иллюстрацыи | illustrate_setup | — |
| gen:illustrate_tips | undefined | Что не так с картинкой? | illustrate_tips | — |
| gen:illustrate_tips | undefined | Подскажите, пожалуйста, как улучшить качество изображения? Текст на картинке получился нечитаемым. | illustrate_tips | illustrate_refine |
| gen:illustrate_tips | undefined | Опять чепуха вышла, дай совет что поправить. | illustrate_tips | — |
| gen:illustrate_tips | undefined | Как сделать чтобы подписи были чоткими? | illustrate_tips | — |
| gen:inn_set_dadata_token | undefined | Сохрани ключи от Дадаты | inn_set_dadata_token | — |
| gen:inn_set_rusprofile_cookie | undefined | не мог бы ты сохранить сессионную куку с руспрофиля, пожалуйста | inn_set_rusprofile_cookie | browser_session_capture_cookies |
| gen:inn_status | undefined | Дай инфу по INN-обогащению. | inn_status | — |
| gen:interview_get_criteria | undefined | Покажи текущие критерии. | interview_get_criteria | — |
| gen:interview_set_criteria | undefined | Запомни критерии | interview_set_criteria | — |
| gen:interview_set_criteria | undefined | Не могли бы вы сохранить наши критерии отбора? | interview_set_criteria | expo_pipeline_set_criteria |
| gen:interview_set_criteria | undefined | Забей критерии, чтобы потом не переспрашивать | interview_set_criteria | — |
| gen:interview_set_criteria | undefined | Перед тем как будешь разбирать интервью, сохрани вот эти требования | interview_set_criteria | agent_store_artifact |
| gen:interview_set_criteria | undefined | Запмни критерии | interview_set_criteria | — |
| gen:issue_status | undefined | Будьте добры, покажите статусы всех пулл-реквестов, привязанных к этой задаче. | issue_status | pr_status |
| gen:last_messages | undefined | Что мы обсуждали? | last_messages | get_chat_history |
| gen:last_messages | undefined | Не могли бы вы напомнить, что я писал ранее в этом чате? | last_messages | get_chat_history |
| gen:last_messages | undefined | Скинь лог переписки | last_messages | get_chat_history |
| gen:last_messages | undefined | После того как я отправил последнее сообщение, я потерял контекст. Напомни, что я писал до этого. | last_messages | get_chat_history |
| gen:load_full_context | undefined | Скинь весь тред | load_full_context | get_chat_history |
| gen:load_full_context | undefined | Загрузи всю перписку | load_full_context | get_chat_history |
| gen:nalog_refresh_token | undefined | Обнови токен | nalog_refresh_token | — |
| gen:nalog_refresh_token | undefined | После того как слетела авторизация, обнови токен | nalog_refresh_token | — |
| gen:nalog_refresh_token | undefined | Обнови токен, а то ощибка авторизации | nalog_refresh_token | — |
| gen:playbook_batch_control | undefined | оживи батч | playbook_batch_control | playbook_run_batch |
| gen:playbook_batch_control | undefined | Пожалуйста, убери элемент key-7 из батча с пометкой «дубль» | playbook_batch_control | task_item_skip |
| gen:playbook_batch_control | undefined | перезапусти фейл у key-3 | playbook_batch_control | task_item_retry |
| gen:playbook_health | undefined | Плейбук виден? | playbook_health | playbook_get |
| gen:playbook_health | undefined | Не могли бы вы проверить, доступен ли плейбук для моего профиля? | playbook_health | playbook_list |
| gen:playbook_health | undefined | Плейбук доедет до меня? | playbook_health | playbook_batch_status |
| gen:playbook_health | undefined | Перед тем как обещать юзеру, проверь, что плейбук реально доходит до моего профиля. | playbook_health | playbook_batch_status |
| gen:playbook_health | undefined | Проверь, виден ли плейбук для моего профля? | playbook_health | — |
| gen:playbook_save | undefined | Сохрани черновик | playbook_save | — |
| gen:playbook_save | undefined | Запили драфт в плейбуки | playbook_save | playbook_draft |
| gen:playbook_suggest | undefined | Какой дефолтный плейбук для этого сетапа? | playbook_suggest | playbook_get |
| gen:publish_page | undefined | Сделай страницу | publish_page | — |
| gen:reproject_adjust | undefined | Поправь план | reproject_adjust | — |
| gen:reproject_adjust | undefined | Будьте добры, скорректируйте план | reproject_adjust | — |
| gen:reproject_adjust | undefined | Подшамань план, перенеси сессию | reproject_adjust | — |
| gen:reproject_adjust | undefined | Паправь план, переименуй проект | reproject_adjust | — |
| gen:reproject_apply | undefined | Применяй план. | reproject_apply | — |
| gen:reproject_apply | undefined | Не могли бы вы применить план, который мы посмотрели? | reproject_apply | playbook_run |
| gen:reproject_apply | undefined | Премини план. | reproject_apply | playbook_run |
| gen:reproject_preview | undefined | Предложи разбивку сессий | reproject_preview | — |
| gen:reproject_preview | undefined | Не могли бы вы подготовить предварительный план группировки сессий? Пока не применяйте. | reproject_preview | — |
| gen:reproject_preview | undefined | Сгруппируй мои сессии по проектам, покажи расклад, ничего не трогая. | reproject_preview | — |
| gen:search_exa | undefined | Поищи в интернете | search_exa | — |
| gen:search_exa | undefined | Не могли бы вы поискать в интернете? | search_exa | search_serper |
| gen:search_exa | undefined | Пробей в интернете | search_exa | — |
| gen:search_exa | undefined | Перед тем как отвечать, поищи в интернете | search_exa | — |
| gen:search_exa | undefined | Найди в интрнете | search_exa | search_serper |
| gen:search_serp_free | undefined | Пошукай в нете через дакдакго, без ключа. | search_serp_free | — |
| gen:search_serper | undefined | Поищи в интернете | search_serper | — |
| gen:search_serper | undefined | После того как закончишь, поищи в интернете | search_serper | — |
| gen:site_deploy_status | undefined | Какой токен для деплоя? | site_deploy_status | — |
| gen:site_deploy_status | undefined | Перед тем как запускать деплой, какой токен для этого профиля используется и какой аккаунт? | site_deploy_status | — |
| gen:site_deploy_status | undefined | Какой токен для деплоя используеца для этого профиля и какой аакаунт? | site_deploy_status | — |
| gen:task_create | undefined | Накидай таску с критериями и пунктами | task_create | engineering_prepare_task |
| gen:task_create | undefined | После того как я уточню детали, создай задачу с критериями приёмки и планом работ | task_create | engineering_prepare_task |
| gen:task_create | undefined | Создай задачу с критериями приёмки и пеунктами | task_create | engineering_prepare_task |
| gen:task_get | undefined | Перед тем как я начну, покажи мою задачу полностью. | task_get | load_full_context |
| gen:task_item_add | undefined | Добавь шаг в план | task_item_add | playbook_edit |
| gen:task_item_add | undefined | Будьте добры, добавьте ещё один шаг в этот план после текущего | task_item_add | playbook_edit |
| gen:task_item_add | undefined | Заапдейть план, вставь степу после моей последней | task_item_add | playbook_edit |
| gen:task_item_add | undefined | После того как выполнится текущий шаг, добавь в план проверку, что PR уже смержен | task_item_add | pr_status |
| gen:task_item_add | undefined | Добавь шаг в плагн, после шага 2 | task_item_add | playbook_edit |
| gen:task_item_exception | undefined | Сделай исключение: не применимо. | task_item_exception | — |
| gen:task_item_result | undefined | Вызови инструмент результата | task_item_result | — |
| gen:task_item_result | undefined | Будьте добры, отправьте итог через инструмент | task_item_result | — |
| gen:task_item_result | undefined | Запости результат через этот инструмент | task_item_result | — |
| gen:task_item_result | undefined | После того как закончишь, вызови инструмент для отправки результата | task_item_result | — |
| gen:task_item_result | undefined | Отправь резкльтат через инструмент | task_item_result | — |
| gen:task_item_skip | undefined | Шаг пропусти | task_item_skip | — |
| gen:task_item_skip | undefined | Пропустите, пожалуйста, этот шаг — он ещё не начинался | task_item_skip | — |
| gen:task_item_skip | undefined | Забей на этот шаг, он не в кассу | task_item_skip | — |
| gen:task_item_skip | undefined | Раз продакшена нет, шаг наблюдения после релиза можно пропустить | task_item_skip | — |
| gen:task_item_update | undefined | Обнови шаг | task_item_update | playbook_edit |
| gen:task_item_update | undefined | Пожалуйста, обновите этот шаг | task_item_update | — |
| gen:task_item_update | undefined | Проапдейть шаг | task_item_update | — |
| gen:task_item_update | undefined | После того как закончишь с предыдущим, обнови шаг | task_item_update | — |
| gen:task_item_update | undefined | Обнови шаг с валидацей | task_item_update | playbook_edit |
| gen:task_item_wait | undefined | Жди мержа | task_item_wait | cicd_track_pr |
| gen:task_item_wait | undefined | Не могли бы вы подождать, пока PR не вмержат? | task_item_wait | cicd_track_pr |
| gen:task_item_wait | undefined | После того как мерж пройдет, продолжай | task_item_wait | — |
| gen:task_item_wait | undefined | Подожди пока CI станет зелиным | task_item_wait | cicd_track_pr |
| gen:task_item_wake | undefined | Прожолжай, я атветил. | task_item_wake | — |
| gen:task_update | undefined | Активируй план. | task_update | playbook_run |
| gen:task_update | undefined | После того как пользователь согласится, переведи план в активный статус. | task_update | playbook_run |
| gen:tg_send_file | undefined | Скинь файл | tg_send_file | — |
| gen:tilda_create_staging | undefined | Скопируй для теста | tilda_create_staging | — |
| gen:tilda_create_staging | undefined | Перед тем как менять дизайн, продублируй страницу для проверки | tilda_create_staging | tilda_backup_page |
| gen:tilda_get_page | undefined | Что на странице? | tilda_get_page | web_text |
| gen:tilda_get_page | undefined | Будьте любезны, покажите содержимое страницы. | tilda_get_page | get_page_content |
| gen:tilda_get_page | undefined | Стяни инфу по странице. | tilda_get_page | ru_browser_fetch |
| gen:tilda_get_page | undefined | После того как загрузишь страницу, скажи, что там. | tilda_get_page | — |
| gen:tilda_get_page | undefined | Пакажи даные страницы. | tilda_get_page | get_page_content |
| gen:tilda_list_all_projects | undefined | Покажи проекты | tilda_list_all_projects | freelance_list |
| gen:tilda_list_all_projects | undefined | Перед тем как выбрать, дай список всех проектов | tilda_list_all_projects | freelance_list |
| gen:tilda_list_pages | undefined | Все страницы проекта | tilda_list_pages | — |
| gen:tilda_list_pages | undefined | Будьте добры, покажите список страниц проекта | tilda_list_pages | list_pages |
| gen:tilda_list_pages | undefined | Скинь перечень страничек проекта | tilda_list_pages | list_pages |
| gen:tilda_list_pages | undefined | Перед тем как продолжить, покажи список страниц проекта | tilda_list_pages | list_pages |
| gen:tilda_list_pages | undefined | Покажи списак страниц проекта | tilda_list_pages | list_pages |
| gen:tilda_publish_page | undefined | Опубликуй страницу | tilda_publish_page | publish_page |
| gen:tilda_publish_page | undefined | Будьте добры, опубликуйте страницу | tilda_publish_page | publish_page |
| gen:tilda_publish_page | undefined | После того как я одобрю тестовую, опубликуй прод | tilda_publish_page | publish_page |
| gen:tilda_publish_page | undefined | Опупликуй страницу | tilda_publish_page | publish_page |
| gen:tilda_set_config | undefined | Сохрани конфиг проекта | tilda_set_config | — |
| gen:tilda_set_config | undefined | Пожалуйста, сохраните параметры выбранного проекта — ID и URL страниц | tilda_set_config | context_set |
| gen:tilda_set_config | undefined | Запили настройки проекта с айдишниками и урлами | tilda_set_config | context_set |
| gen:tilda_set_config | undefined | После того как показал все проекты, сохрани ID и URL для нужного | tilda_set_config | context_set |
| gen:tilda_set_config | undefined | Сохрони настройки проэкта с ID и URL | tilda_set_config | expo_pipeline_set_site_config |
| gen:video_analyze_batch | undefined | Не могли бы вы, пожалуйста, проанализировать все эти записи интервью и дать оценку? | video_analyze_batch | interview_analyze |
| gen:video_analyze_batch | undefined | Прогони эти созвоны через разбор и выдай вердикт по каждому | video_analyze_batch | interview_analyze |
| gen:video_analyze_batch | undefined | Разбери все видео с интервью, очени их и дай портрет кандидата | video_analyze_batch | hh_interview_evaluate |
| gen:web_login | undefined | Залогинь меня | web_login | — |
| gen:web_login | undefined | Будьте добры, авторизуйтесь на сайте под моей сохранённой учётной записью | web_login | browser_session_autologin |
| gen:web_login | undefined | Заюзай мои креды и залогинь | web_login | — |
| gen:web_login | undefined | После того как проверишь почту, залогинься на сайте | web_login | — |
| gen:web_login | undefined | Залогинься на сат под моими сохранёнными данными | web_login | browser_session_autologin |
| gen:web_open | undefined | Прочитай страницу | web_open | web_text |
| gen:web_open | undefined | Сгоняй по юрлу и скинь текст | web_open | — |
| gen:web_open | undefined | После того как откроешь сайт, верни мне его заголовок и текст | web_open | web_state |
| gen:web_open | undefined | Открой сылку и вытащи текст страници | web_open | web_text |
| gen:web_screenshot | undefined | Сделай скриншот текщей страницы | web_screenshot | — |
| gen:web_state | undefined | Что сейчас открыто? | web_state | browser_session_url |
| gen:web_state | undefined | Подскажите, пожалуйста, какая страница сейчас открыта в браузере? | web_state | browser_session_url |
| gen:web_state | undefined | Глянь, что у нас на вкладке висит? | web_state | browser_session_url |
| gen:web_state | undefined | Перед тем как отвечать, скажи, я уже залогинен на сайте? | web_state | browser_session_status |
| gen:web_state | undefined | Какая страница сейчас откыта? | web_state | browser_session_url |
| gen:web_text | undefined | Дочитай дальше | web_text | — |
| gen:web_text | undefined | Не мог бы ты продолжить чтение дальше? | web_text | — |
| gen:web_text | undefined | Дочитай хвост | web_text | last_messages |
| gen:web_text | undefined | Дочитай далше | web_text | — |
| gen:website_discover | undefined | Какие ендпоинты и страници у сохраненого сайта? | website_discover | list_pages |
| gen:website_request | undefined | Можете, пожалуйста, сходить на сайт под моим сохраненным аккаунтом? | website_request | browser_session_autologin |
| gen:website_request | undefined | Сгоняй на сайт с кредами из сохраненки | website_request | browser_session_autologin |
| gen:weeek_add_task | undefined | Завтра в сделку | weeek_add_task | — |
| gen:weeek_list_contacts | undefined | Скинь контакты | weeek_list_contacts | — |
| gen:weeek_list_contacts | undefined | После того как закончишь с задачами, покажи контакты | weeek_list_contacts | — |
| gen:weeek_list_funnels | undefined | Покажи воронки | weeek_list_funnels | — |
| gen:weeek_set_token | undefined | запиши ключ от вика, а то я его потеряю | weeek_set_token | — |

## Недоступные

