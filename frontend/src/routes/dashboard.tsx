import { createFileRoute, useNavigate } from '@tanstack/react-router';  
export const Route = createFileRoute('/dashboard')({ component: () => { const navigate = useNavigate(); navigate({ to: '/select-section', replace: true }); return null; } });
