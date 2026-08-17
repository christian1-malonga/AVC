# AVC - Amazing Voices Choir Administration

> A focused frontend foundation for the digital administration of St. Barnabas Amazing Voices Choir.

## Overview

AVC is a focused web application foundation designed to give choir members and leadership a clear, professional entry point into a future digital administration platform. The current release concentrates on the essential onboarding experience: Login, Sign Up, mock Google sign-in, and authenticated section selection.

This deliberately focused architecture keeps the frontend usable while backend services are being defined. Mock boundaries make the application easy to test today and provide explicit integration points for future authentication, authorization, and choir-management services.

## Product Vision

Choir administration requires more than schedules and attendance. It requires a dependable environment where members understand their next step and leadership can progressively introduce the tools needed to serve the choir. AVC is designed to grow into a complete platform for membership, attendance, music and repertoire, communication, documents, finance, notifications, reporting, and leadership workflows.

## Current Experience

The home route directs unauthenticated visitors to Login. Login and Sign Up share a consistent flow with regular forms, a clearly separated OR option, a clickable Continue with Google mock button, and navigation to the complementary authentication page. After successful local authentication or account creation, users continue to the Section Selection page.

## Technology

The frontend is built with React and TypeScript, powered by Vite and TanStack Router. Tailwind CSS provides the styling foundation, while reusable UI components keep the interface consistent. React Hook Form, Framer Motion, Lucide icons, and a local authentication context support the current experience.

## Application Flow

`	ext
Home -> Login -> Successful authentication -> Section Selection
Home -> Sign Up -> Account creation -> Section Selection
`

## Local Development

From the frontend directory:

`ash
npm install
npm run dev -- --host 0.0.0.0 --port 8081
`

The application is available at http://localhost:8081/. Create a production build with 
pm run build.

## Roadmap

Future iterations may introduce real authentication, Google OAuth, secure sessions, member profiles, section permissions, attendance, rehearsals, repertoire, documents, announcements, finance, notifications, and leadership dashboards.

## Status

This is an active frontend foundation, not a final production deployment. Authentication and Google sign-in are currently mock interactions. Production readiness requires backend integration, secure credential handling, authorization rules, automated tests, accessibility review, deployment configuration, and monitoring.

## License

This project is provided for the AVC choir administration initiative. Licensing and production distribution terms should be formalized before public redistribution.
