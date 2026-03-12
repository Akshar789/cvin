--
-- PostgreSQL database dump
--

\restrict 9R11y1yTDRkiU0eHhYrK5p0I6D3Yp8wefKv2HlgQmwqD7bd512GAbPTS4vewnod

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, username, password, full_name, phone_number, oauth_provider, oauth_provider_id, profile_picture, subscription_tier, subscription_end_date, language, free_credits, cv_generations, text_improvements, interview_sets, total_tokens_used, monthly_tokens_used, monthly_token_limit, daily_tokens_used, daily_token_limit, last_token_reset_date, role, is_active, location, nationality, linkedin, target_job_title, target_job_domain, career_level, industry, years_of_experience, preferred_language, education_level, degree_level, education_specialization, most_recent_job_title, most_recent_company, employment_status, strengths, career_interests, professional_summary, onboarding_completed, created_at, updated_at) FROM stdin;
2	projectmanager663@gmail.com	KT	$2b$10$0y7GVL1eLS3OWz7eIVHiHemxmIcf05hqSf89Qs7Tsq9m/2dRvbhEi	Kairav Thakar	+919009909099	\N	\N	\N	free	\N	en	5	0	0	0	0	0	\N	0	\N	\N	user	t	Riyadh	\N	\N	\N	it-software-dev	Mid-Level	technology	3-5	Both	Bachelor	\N	\N	PM	Store Transform	Employed	\N	\N	\N	t	2026-01-29 09:45:40.766442	2026-01-29 09:46:30.273
1	test@example.com	testuser	$2b$10$aoVIWw9fsiLKHom0ti.DAu3aU0MD/fadKDOhj/HPSCaKFlEKdFU3W	Test User	000088888	\N	\N	\N	premium	\N	en	5	0	0	0	0	0	\N	0	\N	\N	user	t	Riydh	\N	\N	\N	hr-people-ops	Fresh Graduate	petrochemicals	1-3	Both	Bachelor		Hr	Gr	Ggg	Unemployed	\N	\N	Dynamic and motivated fresh graduate with a Bachelor's degree in Petrochemical Engineering. Equipped with hands-on experience from internships, showcasing a strong foundation in refining processes, chemical safety, and project management. Eager to leverage technical skills in a challenging role within the petrochemical industry to drive innovation and enhance operational efficiency.	t	2026-01-28 14:34:06.604734	2026-01-28 17:03:35.412
3	sanjay.storetransform@gmail.com	sanjayst	$2b$10$hScqsHOKHVIF3ifO9LVkbupwOq8c/rKT6IoQQNR29/J9rbPsdaytu	Sanjay storetransform	987897898798	\N	\N	\N	free	\N	en	5	0	0	0	0	0	\N	0	\N	\N	user	t	India	\N	\N	\N	it-software-dev	Mid	technology	1-3	Both	Master	Master	Software Developer	Software Developer	Storetransform	Employed	\N	\N	For testing	t	2026-02-05 07:43:43.3821	2026-02-05 07:54:46.74
\.


--
-- Data for Name: ai_usage_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_usage_logs (id, user_id, feature, tokens_used, estimated_cost, model, created_at) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, admin_id, action, target_type, target_id, details, ip_address, created_at) FROM stdin;
\.


--
-- Data for Name: career_tips; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.career_tips (id, title, content, category, language, is_premium, created_at) FROM stdin;
\.


--
-- Data for Name: templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.templates (id, name, description, is_premium, language, preview_image, css_styles, layout, created_at) FROM stdin;
\.


--
-- Data for Name: cvs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cvs (id, user_id, title, template_id, personal_info, summary, language, ats_score, is_public, public_slug, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cover_letters; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cover_letters (id, user_id, cv_id, title, content, job_title, company, language, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: custom_sections; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.custom_sections (id, cv_id, user_id, title, title_ar, structure_type, content, language, is_complete, is_required, order_index, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cv_exports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cv_exports (id, user_id, cv_id, template_id, format, language, success, error_message, created_at) FROM stdin;
\.


--
-- Data for Name: data_access_log; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.data_access_log (id, user_id, action, data_type, status, requested_at, completed_at, reason, notes) FROM stdin;
\.


--
-- Data for Name: education; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.education (id, cv_id, institution, degree, field, start_date, end_date, description, "order", created_at) FROM stdin;
\.


--
-- Data for Name: experience; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.experience (id, cv_id, company, "position", location, start_date, end_date, description, achievements, "order", created_at) FROM stdin;
\.


--
-- Data for Name: skills; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.skills (id, cv_id, category, skills_list, "order", created_at) FROM stdin;
\.


--
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subscription_plans (id, name, name_ar, tier, price, currency, cv_downloads_limit, ai_requests_per_day, template_access, photo_in_cv, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subscriptions (id, user_id, tier, status, stripe_subscription_id, stripe_customer_id, start_date, end_date, auto_renew, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.system_settings (id, key, value, category, updated_by, updated_at) FROM stdin;
\.


--
-- Data for Name: usage_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usage_logs (id, user_id, feature, tokens_used, created_at) FROM stdin;
\.


--
-- Data for Name: user_consent; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_consent (id, user_id, data_processing_consent, ai_generation_consent, document_storage_consent, profile_generation_consent, feature_updates_consent, analytics_consent, survey_consent, profile_visibility, allow_anon_data_sharing, allow_anon_stats_sharing, terms_accepted_at, privacy_accepted_at, last_consent_update_at, ip_address, user_agent, created_at, updated_at) FROM stdin;
1	1	t	t	t	t	f	f	f	private	f	f	2026-01-28 16:57:39.647	2026-01-28 16:57:39.647	2026-01-28 16:57:40.263	\N	\N	2026-01-28 16:57:40.266152	2026-01-28 16:57:40.266152
2	2	t	t	t	t	f	f	f	private	f	f	2026-02-02 08:34:30.766	2026-02-02 08:34:30.766	2026-02-02 08:34:30.925	\N	\N	2026-02-02 08:34:30.92854	2026-02-02 08:34:30.92854
3	3	t	t	t	t	f	f	f	private	f	f	2026-02-05 07:52:37.106	2026-02-05 07:52:37.106	2026-02-05 07:52:51.724	\N	\N	2026-02-05 07:52:51.727804	2026-02-05 07:52:51.727804
\.


--
-- Name: ai_usage_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ai_usage_logs_id_seq', 1, false);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 1, false);


--
-- Name: career_tips_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.career_tips_id_seq', 1, false);


--
-- Name: cover_letters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cover_letters_id_seq', 1, false);


--
-- Name: custom_sections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.custom_sections_id_seq', 1, false);


--
-- Name: cv_exports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cv_exports_id_seq', 1, false);


--
-- Name: cvs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cvs_id_seq', 6, true);


--
-- Name: data_access_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.data_access_log_id_seq', 1, false);


--
-- Name: education_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.education_id_seq', 1, false);


--
-- Name: experience_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.experience_id_seq', 1, false);


--
-- Name: skills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.skills_id_seq', 1, false);


--
-- Name: subscription_plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.subscription_plans_id_seq', 1, false);


--
-- Name: subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.subscriptions_id_seq', 1, false);


--
-- Name: system_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.system_settings_id_seq', 1, false);


--
-- Name: templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.templates_id_seq', 1, false);


--
-- Name: usage_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.usage_logs_id_seq', 1, false);


--
-- Name: user_consent_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_consent_id_seq', 3, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- PostgreSQL database dump complete
--

\unrestrict 9R11y1yTDRkiU0eHhYrK5p0I6D3Yp8wefKv2HlgQmwqD7bd512GAbPTS4vewnod

