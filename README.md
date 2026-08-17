# AVC | Amazing Voices Choir Management Platform

![Status](https://img.shields.io/badge/status-active%20development-1f6feb) ![Frontend](https://img.shields.io/badge/frontend-React%20%7C%20TypeScript-61dafb) ![Backend](https://img.shields.io/badge/backend-Django-092e20) ![License](https://img.shields.io/badge/license-project%20specific-lightgrey)

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
| Front-End | Christian, Samsax |
| Back-End | Kennedy |
| Database | Samuel OTOBO |

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
