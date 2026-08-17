# AVC - Amazing Voices Choir Management Platform

> A professional digital administration platform for St. Barnabas Amazing Voices Choir.

## Vision

AVC brings choir administration, communication, and coordination into one dependable digital environment. The platform is designed for members, section leaders, choir officers, and administrators. Its goal is to reduce fragmented information and give the choir a clear foundation for membership, attendance, rehearsals, repertoire, announcements, documents, finance, notifications, reporting, and leadership workflows.

## Current Experience

The current frontend provides Home, Login, Sign Up, and Section Selection. Visitors are directed to Login, successful authentication continues to Section Selection, and Login and Sign Up share the same flow with regular forms, OR, a clickable mock Continue with Google button, and navigation between the two pages.

## Product Modules

Planned modules include member profiles, voice-section management, role-based approvals, attendance and check-in, events and rehearsals, music and repertoire, announcements, documents and media, finance and receipts, notifications, voice notes, leadership dashboards, and operational reports.

## Roles

Members access personal and section information. Section Leaders coordinate voice sections. Secretaries manage records and communication. Music Leadership manages repertoire and rehearsal resources. Treasurers manage authorized financial records. Presidents and Administrators manage approvals, permissions, governance, and reporting.

## Architecture

The application uses a decoupled full-stack architecture: React, TypeScript, Vite, TanStack Router, Tailwind CSS, React Hook Form, Framer Motion, and reusable UI components on the frontend; Django and Django REST Framework on the backend. Django is responsible for authentication, database models, business rules, permissions, APIs, auditability, and secure server-side validation.

`	ext
React + TypeScript + Vite -> Django REST API -> Database and secure services
`

The frontend currently runs with local mock services while the Django backend is implemented and connected. Future integrations include Google OAuth, email delivery, secure file storage, calendar services, and reporting.

## Security

Production security requires protected sessions, CSRF protection, server-side authorization, role-based permissions, validation, rate limiting, secure file access, audit logging, protected environment variables, encrypted transport, and tested backup procedures. The frontend is never the authority for sensitive permissions or financial access.

## Development

Frontend: cd frontend, 
pm install, 
pm run dev -- --host 0.0.0.0 --port 8081. Build with 
pm run build. The local frontend is available at http://localhost:8081/.

Django development will use a Python virtual environment, ackend/requirements.txt, migrations, environment variables, and python backend/manage.py runserver.

## Roadmap

The roadmap covers Django authentication, Google OAuth, persistent users and roles, member and section management, attendance, events, repertoire, documents, announcements, notifications, finance, leadership dashboards, automated tests, accessibility review, deployment, monitoring, and backups.

## Status

AVC is an active full-stack foundation. Frontend authentication and Google sign-in are currently mock interactions; Django is the designated production backend.

## License

This project is developed for the AVC choir administration initiative. Licensing and production distribution terms should be formalized before public redistribution.
