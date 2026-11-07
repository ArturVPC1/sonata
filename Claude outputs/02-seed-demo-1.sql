-- SONATA: dados de demonstração (idempotente). Rode DEPOIS de 01-migracao.sql.
-- Referência: aulas de 09/11 a 14/12/2026, com 4 aulas na segunda 30/11. Senha de todas as contas demo: 123456
BEGIN;
--
-- PostgreSQL database dump
--

\restrict M5xdzliS36KDSYMLuHcRug2diq9OgOveeCdbjT2Ly2FqDckADP9nwoNECCaug45

-- Dumped from database version 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: Usuario; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "Usuario" VALUES ('cmplbr3mp0000cem4xegvh0op', 'Administrador', 'admin@exemplo.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'ADMIN', true, '2026-05-25 14:51:38.401', '2026-05-25 14:51:38.401') ON CONFLICT DO NOTHING;
INSERT INTO "Usuario" VALUES ('cmw5cxunt0000737duin8enil', 'Secretaria', 'secretaria@exemplo.com', '$2b$12$fcqyfalJUcLzcJfRac6xMODsqlH24mAA6jZRGIpB.vuYjWyMT2NxG', 'SECRETARIA', true, '2026-11-06 19:18:30.52', '2026-11-06 19:18:30.52') ON CONFLICT (id) DO UPDATE SET "nome" = EXCLUDED."nome", "senhaHash" = EXCLUDED."senhaHash", "role" = EXCLUDED."role", "ativo" = true;
INSERT INTO "Usuario" VALUES ('seed_usr_prof_001', 'Mariana Costa', 'mariana.costa@exemplo.com', '$2b$12$fcqyfalJUcLzcJfRac6xMODsqlH24mAA6jZRGIpB.vuYjWyMT2NxG', 'PROFESSOR', true, '2026-10-01 09:00:00', '2026-11-06 19:18:30.524') ON CONFLICT (id) DO UPDATE SET "nome" = EXCLUDED."nome", "senhaHash" = EXCLUDED."senhaHash", "role" = EXCLUDED."role", "ativo" = true;
INSERT INTO "Usuario" VALUES ('seed_usr_prof_002', 'Rafael Mendes', 'rafael.mendes@exemplo.com', '$2b$12$fcqyfalJUcLzcJfRac6xMODsqlH24mAA6jZRGIpB.vuYjWyMT2NxG', 'PROFESSOR', true, '2026-10-01 09:10:00', '2026-11-06 19:18:30.532') ON CONFLICT (id) DO UPDATE SET "nome" = EXCLUDED."nome", "senhaHash" = EXCLUDED."senhaHash", "role" = EXCLUDED."role", "ativo" = true;
INSERT INTO "Usuario" VALUES ('seed_usr_prof_003', 'Camila Oliveira', 'camila.oliveira@exemplo.com', '$2b$12$fcqyfalJUcLzcJfRac6xMODsqlH24mAA6jZRGIpB.vuYjWyMT2NxG', 'PROFESSOR', true, '2026-10-01 09:20:00', '2026-11-06 19:18:30.538') ON CONFLICT (id) DO UPDATE SET "nome" = EXCLUDED."nome", "senhaHash" = EXCLUDED."senhaHash", "role" = EXCLUDED."role", "ativo" = true;
INSERT INTO "Usuario" VALUES ('cmw5cxupj0001737d9rgf6w01', 'Lucas Ferreira', 'lucas.ferreira@exemplo.com', '$2b$12$fcqyfalJUcLzcJfRac6xMODsqlH24mAA6jZRGIpB.vuYjWyMT2NxG', 'ALUNO', true, '2026-11-06 19:18:30.583', '2026-11-06 19:18:30.583') ON CONFLICT (id) DO UPDATE SET "nome" = EXCLUDED."nome", "senhaHash" = EXCLUDED."senhaHash", "role" = EXCLUDED."role", "ativo" = true;
INSERT INTO "Usuario" VALUES ('cmw5cxupo0002737dm9vvgr2s', 'Beatriz Santos', 'beatriz.santos@exemplo.com', '$2b$12$fcqyfalJUcLzcJfRac6xMODsqlH24mAA6jZRGIpB.vuYjWyMT2NxG', 'ALUNO', true, '2026-11-06 19:18:30.588', '2026-11-06 19:18:30.588') ON CONFLICT (id) DO UPDATE SET "nome" = EXCLUDED."nome", "senhaHash" = EXCLUDED."senhaHash", "role" = EXCLUDED."role", "ativo" = true;
INSERT INTO "Usuario" VALUES ('cmw5cxupt0003737d2xj1msku', 'Pedro Almeida', 'pedro.almeida@exemplo.com', '$2b$12$fcqyfalJUcLzcJfRac6xMODsqlH24mAA6jZRGIpB.vuYjWyMT2NxG', 'ALUNO', true, '2026-11-06 19:18:30.593', '2026-11-06 19:18:30.593') ON CONFLICT (id) DO UPDATE SET "nome" = EXCLUDED."nome", "senhaHash" = EXCLUDED."senhaHash", "role" = EXCLUDED."role", "ativo" = true;


--
-- Data for Name: Aluno; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "Aluno" VALUES ('seed_aluno_001', 'Lucas Ferreira', 'lucas.ferreira@exemplo.com', '(11) 90000-1001', '2010-03-14 00:00:00', '00000000101', true, '2026-10-02 10:00:00', '2026-11-06 19:18:30.586', NULL, 'Marta Ferreira', '(11) 98800-1001', 'cmw5cxupj0001737d9rgf6w01') ON CONFLICT (id) DO UPDATE SET "usuarioId" = EXCLUDED."usuarioId", "responsavelNome" = EXCLUDED."responsavelNome", "responsavelTelefone" = EXCLUDED."responsavelTelefone", "observacoes" = EXCLUDED."observacoes", "telefone" = EXCLUDED."telefone", "dataNasc" = EXCLUDED."dataNasc";
INSERT INTO "Aluno" VALUES ('seed_aluno_002', 'Beatriz Santos', 'beatriz.santos@exemplo.com', '(11) 90000-1002', '2008-07-22 00:00:00', '00000000102', true, '2026-10-02 10:05:00', '2026-11-06 19:18:30.591', NULL, NULL, NULL, 'cmw5cxupo0002737dm9vvgr2s') ON CONFLICT (id) DO UPDATE SET "usuarioId" = EXCLUDED."usuarioId", "responsavelNome" = EXCLUDED."responsavelNome", "responsavelTelefone" = EXCLUDED."responsavelTelefone", "observacoes" = EXCLUDED."observacoes", "telefone" = EXCLUDED."telefone", "dataNasc" = EXCLUDED."dataNasc";
INSERT INTO "Aluno" VALUES ('seed_aluno_003', 'Pedro Almeida', 'pedro.almeida@exemplo.com', '(11) 90000-1003', '1998-11-05 00:00:00', '00000000103', true, '2026-10-02 10:10:00', '2026-11-06 19:18:30.595', NULL, NULL, NULL, 'cmw5cxupt0003737d2xj1msku') ON CONFLICT (id) DO UPDATE SET "usuarioId" = EXCLUDED."usuarioId", "responsavelNome" = EXCLUDED."responsavelNome", "responsavelTelefone" = EXCLUDED."responsavelTelefone", "observacoes" = EXCLUDED."observacoes", "telefone" = EXCLUDED."telefone", "dataNasc" = EXCLUDED."dataNasc";
INSERT INTO "Aluno" VALUES ('seed_aluno_004', 'Isabela Rocha', 'isabela.rocha@exemplo.com', '(11) 90000-1004', '2001-01-18 00:00:00', '00000000104', true, '2026-10-02 10:15:00', '2026-11-06 19:18:30.597', NULL, NULL, NULL, NULL) ON CONFLICT (id) DO UPDATE SET "usuarioId" = EXCLUDED."usuarioId", "responsavelNome" = EXCLUDED."responsavelNome", "responsavelTelefone" = EXCLUDED."responsavelTelefone", "observacoes" = EXCLUDED."observacoes", "telefone" = EXCLUDED."telefone", "dataNasc" = EXCLUDED."dataNasc";
INSERT INTO "Aluno" VALUES ('seed_aluno_005', 'Gabriel Lima', 'gabriel.lima@exemplo.com', '(11) 90000-1005', '2012-09-30 00:00:00', '00000000105', true, '2026-10-02 10:20:00', '2026-11-06 19:18:30.6', NULL, 'Paulo Lima', '(11) 98800-1005', NULL) ON CONFLICT (id) DO UPDATE SET "usuarioId" = EXCLUDED."usuarioId", "responsavelNome" = EXCLUDED."responsavelNome", "responsavelTelefone" = EXCLUDED."responsavelTelefone", "observacoes" = EXCLUDED."observacoes", "telefone" = EXCLUDED."telefone", "dataNasc" = EXCLUDED."dataNasc";
INSERT INTO "Aluno" VALUES ('seed_aluno_006', 'Sofia Martins', 'sofia.martins@exemplo.com', '(11) 90000-1006', '1995-05-11 00:00:00', '00000000106', true, '2026-10-02 10:25:00', '2026-11-06 19:18:30.602', NULL, NULL, NULL, NULL) ON CONFLICT (id) DO UPDATE SET "usuarioId" = EXCLUDED."usuarioId", "responsavelNome" = EXCLUDED."responsavelNome", "responsavelTelefone" = EXCLUDED."responsavelTelefone", "observacoes" = EXCLUDED."observacoes", "telefone" = EXCLUDED."telefone", "dataNasc" = EXCLUDED."dataNasc";
INSERT INTO "Aluno" VALUES ('seed_aluno_007', 'Enzo Ribeiro', 'enzo.ribeiro@exemplo.com', '(11) 90000-1007', '2006-12-02 00:00:00', '00000000107', true, '2026-10-02 10:30:00', '2026-11-06 19:18:30.604', NULL, NULL, NULL, NULL) ON CONFLICT (id) DO UPDATE SET "usuarioId" = EXCLUDED."usuarioId", "responsavelNome" = EXCLUDED."responsavelNome", "responsavelTelefone" = EXCLUDED."responsavelTelefone", "observacoes" = EXCLUDED."observacoes", "telefone" = EXCLUDED."telefone", "dataNasc" = EXCLUDED."dataNasc";
INSERT INTO "Aluno" VALUES ('seed_aluno_008', 'Valentina Gomes', 'valentina.gomes@exemplo.com', '(11) 90000-1008', '2014-04-09 00:00:00', '00000000108', true, '2026-10-02 10:35:00', '2026-11-06 19:18:30.606', NULL, 'Carla Gomes', '(11) 98800-1008', NULL) ON CONFLICT (id) DO UPDATE SET "usuarioId" = EXCLUDED."usuarioId", "responsavelNome" = EXCLUDED."responsavelNome", "responsavelTelefone" = EXCLUDED."responsavelTelefone", "observacoes" = EXCLUDED."observacoes", "telefone" = EXCLUDED."telefone", "dataNasc" = EXCLUDED."dataNasc";


--
-- Data for Name: Instrumento; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "Instrumento" VALUES ('seed_inst_001', 'Piano', 'piano') ON CONFLICT DO NOTHING;
INSERT INTO "Instrumento" VALUES ('seed_inst_002', 'Violão', 'guitar') ON CONFLICT DO NOTHING;
INSERT INTO "Instrumento" VALUES ('seed_inst_003', 'Guitarra', 'electric-guitar') ON CONFLICT DO NOTHING;
INSERT INTO "Instrumento" VALUES ('seed_inst_004', 'Bateria', 'drum') ON CONFLICT DO NOTHING;
INSERT INTO "Instrumento" VALUES ('seed_inst_005', 'Canto', 'mic') ON CONFLICT DO NOTHING;
INSERT INTO "Instrumento" VALUES ('seed_inst_006', 'Teclado', 'keyboard') ON CONFLICT DO NOTHING;
INSERT INTO "Instrumento" VALUES ('seed_inst_007', 'Flauta', 'flute') ON CONFLICT DO NOTHING;
INSERT INTO "Instrumento" VALUES ('seed_inst_008', 'Violino', 'violin') ON CONFLICT DO NOTHING;


--
-- Data for Name: Professor; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "Professor" VALUES ('seed_prof_001', 'seed_usr_prof_001', 'Professora de piano e teoria musical. Atua com alunos iniciantes e intermediários.', '2026-10-01 09:00:00', '2026-11-06 19:18:30.528', '(11) 98100-0001') ON CONFLICT (id) DO UPDATE SET "telefone" = EXCLUDED."telefone", "bio" = EXCLUDED."bio";
INSERT INTO "Professor" VALUES ('seed_prof_002', 'seed_usr_prof_002', 'Professor de violão e guitarra, com foco em prática e repertório.', '2026-10-01 09:10:00', '2026-11-06 19:18:30.535', '(11) 98100-0002') ON CONFLICT (id) DO UPDATE SET "telefone" = EXCLUDED."telefone", "bio" = EXCLUDED."bio";
INSERT INTO "Professor" VALUES ('seed_prof_003', 'seed_usr_prof_003', 'Professora de canto e técnica vocal.', '2026-10-01 09:20:00', '2026-11-06 19:18:30.54', '(11) 98100-0003') ON CONFLICT (id) DO UPDATE SET "telefone" = EXCLUDED."telefone", "bio" = EXCLUDED."bio";


--
-- Data for Name: Sala; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "Sala" VALUES ('seed_sala_1', 'Sala 1', 4, 'DISPONIVEL', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "Sala" VALUES ('seed_sala_2', 'Sala 2', 4, 'DISPONIVEL', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "Sala" VALUES ('seed_sala_3', 'Sala 3', 3, 'DISPONIVEL', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "Sala" VALUES ('seed_sala_4', 'Sala 4', 6, 'MANUTENCAO', '2026-12-07 00:00:00') ON CONFLICT DO NOTHING;
INSERT INTO "Sala" VALUES ('seed_sala_5', 'Sala 5', 4, 'DISPONIVEL', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "Sala" VALUES ('seed_sala_6', 'Auditório', 40, 'DISPONIVEL', NULL) ON CONFLICT DO NOTHING;


--
-- Data for Name: Turma; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "Turma" VALUES ('seed_turma_001', 'Piano Iniciante - Manhã', 'seed_inst_001', 'seed_prof_001', 'SEGUNDA', '09:00', 60, 8, true, '2026-10-03 08:00:00', '2026-11-06 19:18:30.611', 'seed_sala_1') ON CONFLICT (id) DO UPDATE SET "salaId" = EXCLUDED."salaId";
INSERT INTO "Turma" VALUES ('seed_turma_002', 'Violão Intermediário', 'seed_inst_002', 'seed_prof_002', 'TERCA', '14:00', 60, 8, true, '2026-10-03 08:05:00', '2026-11-06 19:18:30.616', 'seed_sala_2') ON CONFLICT (id) DO UPDATE SET "salaId" = EXCLUDED."salaId";
INSERT INTO "Turma" VALUES ('seed_turma_003', 'Canto - Prática Vocal', 'seed_inst_005', 'seed_prof_003', 'QUARTA', '16:00', 50, 6, true, '2026-10-03 08:10:00', '2026-11-06 19:18:30.621', 'seed_sala_3') ON CONFLICT (id) DO UPDATE SET "salaId" = EXCLUDED."salaId";
INSERT INTO "Turma" VALUES ('seed_turma_004', 'Guitarra para Iniciantes', 'seed_inst_003', 'seed_prof_002', 'QUINTA', '18:00', 60, 8, true, '2026-10-03 08:15:00', '2026-11-06 19:18:30.627', 'seed_sala_5') ON CONFLICT (id) DO UPDATE SET "salaId" = EXCLUDED."salaId";
INSERT INTO "Turma" VALUES ('seed_turma_005', 'Piano - Intermediário', 'seed_inst_001', 'seed_prof_001', 'SEXTA', '10:00', 60, 6, true, '2026-10-03 08:20:00', '2026-11-06 19:18:30.632', 'seed_sala_1') ON CONFLICT (id) DO UPDATE SET "salaId" = EXCLUDED."salaId";
INSERT INTO "Turma" VALUES ('seed_turma_006', 'Bateria - Fundamentos', 'seed_inst_004', 'seed_prof_003', 'SABADO', '11:00', 50, 5, true, '2026-10-03 08:25:00', '2026-11-06 19:18:30.637', 'seed_sala_2') ON CONFLICT (id) DO UPDATE SET "salaId" = EXCLUDED."salaId";
INSERT INTO "Turma" VALUES ('seed_turma_007', 'Violão Iniciante', 'seed_inst_002', 'seed_prof_002', 'SEGUNDA', '11:00', 60, 8, true, '2026-11-06 19:18:30.641', '2026-11-06 19:18:30.641', 'seed_sala_3') ON CONFLICT (id) DO UPDATE SET "salaId" = EXCLUDED."salaId";
INSERT INTO "Turma" VALUES ('seed_turma_008', 'Canto Coral', 'seed_inst_005', 'seed_prof_003', 'SEGUNDA', '14:30', 50, 12, true, '2026-11-06 19:18:30.645', '2026-11-06 19:18:30.645', 'seed_sala_6') ON CONFLICT (id) DO UPDATE SET "salaId" = EXCLUDED."salaId";
INSERT INTO "Turma" VALUES ('seed_turma_009', 'Guitarra - Intermediário', 'seed_inst_003', 'seed_prof_002', 'SEGUNDA', '16:00', 60, 6, true, '2026-11-06 19:18:30.65', '2026-11-06 19:18:30.65', 'seed_sala_5') ON CONFLICT (id) DO UPDATE SET "salaId" = EXCLUDED."salaId";


--
-- Data for Name: Aula; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "Aula" VALUES ('seed_aula_001', 'seed_turma_001', '2026-10-05 09:00:00', true, 'Aula introdutória: postura e localização das notas.', '2026-10-04 12:00:00') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('seed_aula_002', 'seed_turma_001', '2026-10-12 09:00:00', true, 'Exercícios de coordenação das mãos.', '2026-10-04 12:00:00') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('seed_aula_003', 'seed_turma_001', '2026-11-09 09:00:00', false, 'Leitura rítmica e prática de escalas.', '2026-10-04 12:00:00') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('seed_aula_004', 'seed_turma_002', '2026-10-06 14:00:00', true, 'Revisão de acordes e ritmo.', '2026-10-04 12:05:00') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('seed_aula_005', 'seed_turma_002', '2026-11-10 14:00:00', false, 'Prática de troca de acordes.', '2026-10-04 12:05:00') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('seed_aula_006', 'seed_turma_003', '2026-10-07 16:00:00', true, 'Aquecimento e exercícios de respiração.', '2026-10-04 12:10:00') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('seed_aula_007', 'seed_turma_003', '2026-11-11 16:00:00', false, 'Afinação e extensão vocal.', '2026-10-04 12:10:00') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('seed_aula_008', 'seed_turma_004', '2026-10-08 18:00:00', true, 'Introdução à guitarra e palhetada.', '2026-10-04 12:15:00') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('seed_aula_009', 'seed_turma_004', '2026-11-12 18:00:00', false, 'Ritmo e primeiros riffs.', '2026-10-04 12:15:00') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('seed_aula_010', 'seed_turma_005', '2026-10-09 10:00:00', true, 'Revisão de escalas e leitura.', '2026-10-04 12:20:00') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('seed_aula_011', 'seed_turma_005', '2026-11-13 10:00:00', false, 'Estudo de repertório.', '2026-10-04 12:20:00') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('seed_aula_012', 'seed_turma_006', '2026-10-10 11:00:00', true, 'Coordenação básica e pulsação.', '2026-10-04 12:25:00') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_001_20261109', 'seed_turma_001', '2026-11-09 09:00:00', true, NULL, '2026-11-06 19:18:30.686') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_007_20261109', 'seed_turma_007', '2026-11-09 11:00:00', true, NULL, '2026-11-06 19:18:30.69') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_008_20261109', 'seed_turma_008', '2026-11-09 14:30:00', true, NULL, '2026-11-06 19:18:30.693') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_009_20261109', 'seed_turma_009', '2026-11-09 16:00:00', true, NULL, '2026-11-06 19:18:30.696') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_002_20261110', 'seed_turma_002', '2026-11-10 14:00:00', true, NULL, '2026-11-06 19:18:30.699') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_003_20261111', 'seed_turma_003', '2026-11-11 16:00:00', true, NULL, '2026-11-06 19:18:30.701') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_004_20261112', 'seed_turma_004', '2026-11-12 18:00:00', true, NULL, '2026-11-06 19:18:30.704') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_005_20261113', 'seed_turma_005', '2026-11-13 10:00:00', true, NULL, '2026-11-06 19:18:30.707') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_006_20261114', 'seed_turma_006', '2026-11-14 11:00:00', true, NULL, '2026-11-06 19:18:30.71') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_001_20261116', 'seed_turma_001', '2026-11-16 09:00:00', true, NULL, '2026-11-06 19:18:30.713') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_007_20261116', 'seed_turma_007', '2026-11-16 11:00:00', true, NULL, '2026-11-06 19:18:30.715') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_008_20261116', 'seed_turma_008', '2026-11-16 14:30:00', true, NULL, '2026-11-06 19:18:30.718') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_009_20261116', 'seed_turma_009', '2026-11-16 16:00:00', true, NULL, '2026-11-06 19:18:30.721') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_002_20261117', 'seed_turma_002', '2026-11-17 14:00:00', true, NULL, '2026-11-06 19:18:30.725') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_003_20261118', 'seed_turma_003', '2026-11-18 16:00:00', true, NULL, '2026-11-06 19:18:30.727') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_004_20261119', 'seed_turma_004', '2026-11-19 18:00:00', true, NULL, '2026-11-06 19:18:30.731') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_005_20261120', 'seed_turma_005', '2026-11-20 10:00:00', true, NULL, '2026-11-06 19:18:30.734') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_006_20261121', 'seed_turma_006', '2026-11-21 11:00:00', true, NULL, '2026-11-06 19:18:30.737') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_001_20261123', 'seed_turma_001', '2026-11-23 09:00:00', true, NULL, '2026-11-06 19:18:30.74') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_007_20261123', 'seed_turma_007', '2026-11-23 11:00:00', true, NULL, '2026-11-06 19:18:30.743') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_008_20261123', 'seed_turma_008', '2026-11-23 14:30:00', true, NULL, '2026-11-06 19:18:30.746') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_009_20261123', 'seed_turma_009', '2026-11-23 16:00:00', true, NULL, '2026-11-06 19:18:30.748') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_002_20261124', 'seed_turma_002', '2026-11-24 14:00:00', true, NULL, '2026-11-06 19:18:30.751') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_003_20261125', 'seed_turma_003', '2026-11-25 16:00:00', true, NULL, '2026-11-06 19:18:30.754') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_004_20261126', 'seed_turma_004', '2026-11-26 18:00:00', true, NULL, '2026-11-06 19:18:30.757') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_005_20261127', 'seed_turma_005', '2026-11-27 10:00:00', true, NULL, '2026-11-06 19:18:30.76') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_006_20261128', 'seed_turma_006', '2026-11-28 11:00:00', true, NULL, '2026-11-06 19:18:30.763') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_001_20261130', 'seed_turma_001', '2026-11-30 09:00:00', false, NULL, '2026-11-06 19:18:30.767') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_007_20261130', 'seed_turma_007', '2026-11-30 11:00:00', false, NULL, '2026-11-06 19:18:30.773') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_008_20261130', 'seed_turma_008', '2026-11-30 14:30:00', false, NULL, '2026-11-06 19:18:30.779') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_009_20261130', 'seed_turma_009', '2026-11-30 16:00:00', false, NULL, '2026-11-06 19:18:30.784') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_002_20261201', 'seed_turma_002', '2026-12-01 14:00:00', false, NULL, '2026-11-06 19:18:30.79') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_003_20261202', 'seed_turma_003', '2026-12-02 16:00:00', false, NULL, '2026-11-06 19:18:30.794') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_004_20261203', 'seed_turma_004', '2026-12-03 18:00:00', false, NULL, '2026-11-06 19:18:30.797') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_005_20261204', 'seed_turma_005', '2026-12-04 10:00:00', false, NULL, '2026-11-06 19:18:30.801') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_006_20261205', 'seed_turma_006', '2026-12-05 11:00:00', false, NULL, '2026-11-06 19:18:30.807') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_001_20261207', 'seed_turma_001', '2026-12-07 09:00:00', false, NULL, '2026-11-06 19:18:30.81') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_007_20261207', 'seed_turma_007', '2026-12-07 11:00:00', false, NULL, '2026-11-06 19:18:30.814') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_008_20261207', 'seed_turma_008', '2026-12-07 14:30:00', false, NULL, '2026-11-06 19:18:30.817') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_009_20261207', 'seed_turma_009', '2026-12-07 16:00:00', false, NULL, '2026-11-06 19:18:30.822') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_002_20261208', 'seed_turma_002', '2026-12-08 14:00:00', false, NULL, '2026-11-06 19:18:30.825') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_003_20261209', 'seed_turma_003', '2026-12-09 16:00:00', false, NULL, '2026-11-06 19:18:30.829') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_004_20261210', 'seed_turma_004', '2026-12-10 18:00:00', false, NULL, '2026-11-06 19:18:30.832') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_005_20261211', 'seed_turma_005', '2026-12-11 10:00:00', false, NULL, '2026-11-06 19:18:30.837') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_006_20261212', 'seed_turma_006', '2026-12-12 11:00:00', false, NULL, '2026-11-06 19:18:30.84') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_001_20261214', 'seed_turma_001', '2026-12-14 09:00:00', false, NULL, '2026-11-06 19:18:30.844') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_007_20261214', 'seed_turma_007', '2026-12-14 11:00:00', false, NULL, '2026-11-06 19:18:30.848') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_008_20261214', 'seed_turma_008', '2026-12-14 14:30:00', false, NULL, '2026-11-06 19:18:30.854') ON CONFLICT DO NOTHING;
INSERT INTO "Aula" VALUES ('aula_seed_turma_009_20261214', 'seed_turma_009', '2026-12-14 16:00:00', false, NULL, '2026-11-06 19:18:30.861') ON CONFLICT DO NOTHING;


--
-- Data for Name: Matricula; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "Matricula" VALUES ('seed_matr_001', 'seed_aluno_001', 'seed_turma_001', '2026-10-05 00:00:00', NULL, true, '2026-10-02 11:00:00') ON CONFLICT DO NOTHING;
INSERT INTO "Matricula" VALUES ('seed_matr_002', 'seed_aluno_002', 'seed_turma_001', '2026-10-05 00:00:00', NULL, true, '2026-10-02 11:05:00') ON CONFLICT DO NOTHING;
INSERT INTO "Matricula" VALUES ('seed_matr_003', 'seed_aluno_003', 'seed_turma_002', '2026-10-06 00:00:00', NULL, true, '2026-10-02 11:10:00') ON CONFLICT DO NOTHING;
INSERT INTO "Matricula" VALUES ('seed_matr_004', 'seed_aluno_004', 'seed_turma_003', '2026-10-07 00:00:00', NULL, true, '2026-10-02 11:15:00') ON CONFLICT DO NOTHING;
INSERT INTO "Matricula" VALUES ('seed_matr_005', 'seed_aluno_005', 'seed_turma_001', '2026-10-05 00:00:00', NULL, true, '2026-10-02 11:20:00') ON CONFLICT DO NOTHING;
INSERT INTO "Matricula" VALUES ('seed_matr_006', 'seed_aluno_006', 'seed_turma_004', '2026-10-08 00:00:00', NULL, true, '2026-10-02 11:25:00') ON CONFLICT DO NOTHING;
INSERT INTO "Matricula" VALUES ('seed_matr_007', 'seed_aluno_007', 'seed_turma_005', '2026-10-09 00:00:00', NULL, true, '2026-10-02 11:30:00') ON CONFLICT DO NOTHING;
INSERT INTO "Matricula" VALUES ('seed_matr_008', 'seed_aluno_008', 'seed_turma_006', '2026-10-10 00:00:00', NULL, true, '2026-10-02 11:35:00') ON CONFLICT DO NOTHING;
INSERT INTO "Matricula" VALUES ('seed_matr_009', 'seed_aluno_003', 'seed_turma_004', '2026-10-08 00:00:00', NULL, true, '2026-10-02 11:40:00') ON CONFLICT DO NOTHING;
INSERT INTO "Matricula" VALUES ('cmw5cxurz000d737dmu8k35nq', 'seed_aluno_005', 'seed_turma_007', '2026-10-05 00:00:00', NULL, true, '2026-11-06 19:18:30.671') ON CONFLICT DO NOTHING;
INSERT INTO "Matricula" VALUES ('cmw5cxus1000e737ddd35m25d', 'seed_aluno_008', 'seed_turma_007', '2026-10-05 00:00:00', NULL, true, '2026-11-06 19:18:30.673') ON CONFLICT DO NOTHING;
INSERT INTO "Matricula" VALUES ('cmw5cxus3000f737dac545x6p', 'seed_aluno_002', 'seed_turma_008', '2026-10-05 00:00:00', NULL, true, '2026-11-06 19:18:30.675') ON CONFLICT DO NOTHING;
INSERT INTO "Matricula" VALUES ('cmw5cxus5000g737dwnlwhx4r', 'seed_aluno_004', 'seed_turma_008', '2026-10-05 00:00:00', NULL, true, '2026-11-06 19:18:30.677') ON CONFLICT DO NOTHING;
INSERT INTO "Matricula" VALUES ('cmw5cxus7000h737d8u8mv76r', 'seed_aluno_006', 'seed_turma_008', '2026-10-05 00:00:00', NULL, true, '2026-11-06 19:18:30.679') ON CONFLICT DO NOTHING;
INSERT INTO "Matricula" VALUES ('cmw5cxusa000i737d2427uqfb', 'seed_aluno_007', 'seed_turma_009', '2026-10-05 00:00:00', NULL, true, '2026-11-06 19:18:30.682') ON CONFLICT DO NOTHING;
INSERT INTO "Matricula" VALUES ('cmw5cxusc000j737d3hca65xw', 'seed_aluno_003', 'seed_turma_009', '2026-10-05 00:00:00', NULL, true, '2026-11-06 19:18:30.684') ON CONFLICT DO NOTHING;


--
-- PostgreSQL database dump complete
--

\unrestrict M5xdzliS36KDSYMLuHcRug2diq9OgOveeCdbjT2Ly2FqDckADP9nwoNECCaug45


COMMIT;
