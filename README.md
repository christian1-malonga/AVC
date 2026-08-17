# AVC | Amazing Voices Choir Management Platform

[![Repository](https://img.shields.io/badge/repository-GitHub-181717?logo=github)](https://github.com/christian1-malonga/AVC) [![Documentation](https://img.shields.io/badge/docs-README-0A66C2)](https://github.com/christian1-malonga/AVC#readme) ![Status](https://img.shields.io/badge/status-active%20development-1f6feb) ![Frontend](https://img.shields.io/badge/frontend-React%20%7C%20TypeScript-61dafb) ![Backend](https://img.shields.io/badge/backend-Django-092e20) ![License](https://img.shields.io/badge/license-project%20specific-lightgrey)

> A professional digital platform for the administration, coordination, and growth of St. Barnabas Amazing Voices Choir.

## Overview

AVC is a full-stack choir-management platform designed to bring membership, communication, attendance, music, documents, finance, and leadership operations into one dependable digital environment. The product is built for clarity: members should understand what they need to do, and administrators should have the structure required to coordinate the choir responsibly.

This repository is organized around a decoupled React frontend and a Django backend. The frontend is currently being developed with local mock services so that the user experience can evolve independently while the production API, database, and security model are completed.

## Product Scope

| Domain | Purpose |
|---|---|
| Identity | Login, Sign Up, account status, and future Google OAuth |
| Choristers | Personal information, debts, announcements, attendance, documents, and music files |
| Administration | Member approvals, roles, documents, weekly dues, and reporting |
| Music | Songs, audio files, repertoire, and rehearsal resources |
| Attendance | Presence, absences, lateness, and probation records |
| Records | Meeting minutes, receipts, supporting documents, and audit history |
| Communication | Announcements, notifications, and operational updates |

## Official User Roles

### All Choristers

View debts, announcements, and attendance; access documents and music files.

### President / Admin

View the total number of members, upload documents, view all members debts, approve new members, assign and manage user roles, and set weekly dues.

### Custodian

Upload songs, audio files, and related music files.

### Provost

Manage and record attendance, upload debts related to absences and lateness, and manage members on probation.

### Secretary

Upload meeting minutes, receipts, and supporting documents.

### Electoral

The Electoral role is part of the official AVC role structure. Responsibilities will be documented when formally defined.

## Development Task Distribution

| Area | Contributors |
|---|---|
| Front-End | Christian Malonga — AI Engineer; Samson Kolade — Information Technology Engineer |
| Back-End | Kennedy Chibueze — Software Engineer |
| Database | Samuel OTOBO — Computer Engineer |

## Engineering Team

The AVC project team combines engineering, artificial-intelligence, design, architecture, information-systems, and project-management capabilities.

| Contributor | Professional background | Project responsibility |
|---|---|
| Christian Malonga | AI Engineer | AI Engineering and Front-End |
| Kennedy Chibueze | Software Engineer | Back-End Engineering |
| Samuel OTOBO | Computer Engineer | Database Engineering |
| Samson Kolade | Information Technology Engineer | Front-End Engineering |
| Kezzy | Architect | Designer |
| Christophe Kaza | Industrial Engineer | Designer |
| Marcelin Kalimira | Management Information Systems | Project Manager |

## Architecture

`	ext
React + TypeScript + Vite
        |
        | REST / JSON API
        v
Django + Django REST Framework
        |
        v
Database, permissions, files, audit, and integrations
`

### Frontend

React and TypeScript provide the interface. Vite powers development and builds. TanStack Router manages typed file-based routing. Tailwind CSS and reusable components provide visual consistency. React Hook Form, Framer Motion, and Lucide support forms, motion, and interaction details.

### Backend

Django is the designated backend. It will own authentication, models, validation, business rules, permissions, APIs, auditability, and secure server-side enforcement. Django REST Framework is the intended API layer. The frontend must never be treated as the authority for sensitive permissions or financial access.

## Application Flow

`	ext
Home -> Login or Sign Up -> Authentication -> Section Selection -> Role-aware experience
`

## Local Development

`ash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 8081
npm run build
`

The frontend runs locally at http://localhost:8081/. Django development will use a Python virtual environment, ackend/requirements.txt, migrations, environment variables, and python backend/manage.py runserver.

## Engineering Standards

Changes should preserve a successful build, keep authentication boundaries explicit, place business rules in Django, protect sensitive data with server-side permissions, and introduce features with validation, tests, accessibility review, and documentation. Environment secrets must remain outside source control.

## Security

Production readiness requires secure sessions, CSRF protection, role-based authorization, input validation, rate limiting, protected file access, audit logging, encrypted transport, secure environment variables, backups, and monitoring.

## Roadmap

Complete Django authentication and API integration; add Google OAuth; introduce persistent users and roles; implement membership, attendance, music, documents, announcements, finance, notifications, dashboards, automated tests, deployment, and observability.

## Status

AVC is an active full-stack foundation. Frontend authentication and Google sign-in are currently mock interactions. Django is the designated production backend.

## License

This project is developed for the AVC choir administration initiative. Licensing and production distribution terms should be formalized before public redistribution.



## AI and Intelligent Assistance

AVC will include an AI assistance layer designed to help members and administrators find information, understand workflows, and interact with the platform through natural language. The chatbot is not intended to replace choir leadership. It will act as a controlled assistant that improves discoverability, reduces repetitive questions, and guides users toward the correct official workflow.

### Planned Chatbot Capabilities

The chatbot may answer questions about announcements, attendance procedures, available documents, rehearsal information, music resources, dues guidance, account navigation, and general platform usage. It may also help users locate authorized information, explain a form, summarize a published announcement, or direct a request to the appropriate administrator.

### AI Architecture

`	ext
User message
    -> React chat interface
    -> Django API and authentication context
    -> Permission-aware orchestration layer
    -> Retrieval from approved AVC knowledge sources
    -> AI model response with citations or source references
    -> Auditable response returned to the user
`

The chatbot will be integrated through Django rather than connected directly from the browser to a model provider. Django will validate identity, enforce role permissions, apply rate limits, protect provider credentials, select approved context, record appropriate audit events, and return a controlled response to the React client.

### Grounding and Knowledge Sources

The assistant should use approved AVC content such as published announcements, official policies, schedules, documents, music metadata, and help content. Responses should be grounded in current source material whenever possible. If the required information is unavailable, the assistant should state that clearly and direct the user to a human administrator instead of inventing an answer.

### Privacy and Safety

The AI layer must not expose private member information, financial records, leadership documents, or role-restricted content. Retrieval must be permission-aware, prompts and provider credentials must remain server-side, sensitive fields must be minimized, and important administrative decisions must remain subject to human approval. Chat responses should be treated as assistance, not as an authoritative replacement for official records.

### AI Roadmap

The planned AI roadmap includes a secure FAQ assistant, document-aware search, announcement summarization, guided onboarding, attendance and rehearsal assistance, administrator support tools, feedback collection, evaluation datasets, prompt versioning, observability, refusal behavior, and human escalation workflows.

## API and Integration Direction

The Django backend will expose versioned endpoints for authentication, users, roles, sections, attendance, announcements, documents, music, finance, notifications, and AI assistance. API contracts should be documented before integration, validated on the server, and covered by automated tests. The frontend should communicate through a dedicated client layer rather than embedding business rules in route components.

## Collaboration Workflow

Contributors should create focused branches, keep commits small and descriptive, run the frontend build before opening a pull request, and explain the user or system behavior affected by a change. Pull requests should be reviewed before merging into main. Secrets, local logs, generated output, and temporary scripts must never be committed.

## Useful Links

- [AVC Repository](https://github.com/christian1-malonga/AVC)
- [Frontend directory](https://github.com/christian1-malonga/AVC/tree/main/frontend)
- [Issues](https://github.com/christian1-malonga/AVC/issues)
- [Pull requests](https://github.com/christian1-malonga/AVC/pulls)
- [GitHub Collaboration Guide](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/inviting-collaborators-to-a-personal-repository)






## AI Product Charter

The AVC AI layer is a controlled product capability designed to help members and administrators discover official information, understand workflows, and use the platform through natural language. It supports choir leadership; it does not replace human authority over sensitive decisions.

### Planned Chatbot Experience

The future chatbot will be available through a dedicated React conversation interface. Authenticated users will be able to ask questions about announcements, attendance procedures, documents, rehearsal information, music resources, dues guidance, account navigation, and platform usage. The assistant should provide concise answers, link to approved sources, express uncertainty, and escalate unresolved matters to an administrator.

### AI Interaction Model

`	ext
User message -> React chat interface
             -> Django authentication and API boundary
             -> Permission-aware AI orchestration
             -> Retrieval from approved AVC knowledge
             -> Model provider
             -> Response validation, sources, and audit event
             -> Controlled answer returned to the user
`

The browser must never contain provider secrets or call a model directly for protected operations. Django will validate identity, enforce role and object permissions, apply rate limits, select the minimum context required, call the approved model service, validate the response, and record appropriate audit events.

### Retrieval-Augmented Generation

Approved announcements, policies, schedules, documents, music metadata, and help content can be indexed with source, owner, visibility, publication date, and role-scope metadata. Retrieval must filter by authorization before any content reaches the model. Grounded responses should cite or link to the underlying source whenever possible.

### Safety and Privacy

The chatbot must not invent policies, expose private member information, reveal financial records, approve members, modify official records, assign roles, or replace leadership decisions. Prompts, credentials, system instructions, and evaluation data remain server-side. Logs should minimize personal data and follow retention and deletion requirements.

### AI Evaluation

Before production release, the assistant should be evaluated for factual grounding, source attribution, permission isolation, refusal quality, prompt-injection resistance, latency, availability, cost, and usefulness. Prompt versions, model versions, retrieval configurations, safety tests, feedback, and human-review decisions should be tracked.

### AI Roadmap

The roadmap includes a secure FAQ assistant, document-aware search, announcement summarization, guided onboarding, attendance assistance, administrator support tools, feedback collection, evaluation datasets, prompt versioning, observability, refusal behavior, and human escalation workflows.

## Professional Technical Links

- [AVC Repository](https://github.com/christian1-malonga/AVC)
- [Frontend Source](https://github.com/christian1-malonga/AVC/tree/main/frontend)
- [Issues](https://github.com/christian1-malonga/AVC/issues)
- [Pull Requests](https://github.com/christian1-malonga/AVC/pulls)
- [React Documentation](https://react.dev/learn)
- [Vite Documentation](https://vite.dev/guide/)
- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [OpenAI Platform Documentation](https://platform.openai.com/docs/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

