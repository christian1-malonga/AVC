import { useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard')({
  component: () => {
    const navigate = useNavigate();
    navigate({ to: '/select-section', replace: true });
    return null;
  },
});

function Dashboard() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('jwt', token);
    }
  }, []);

  return <h1>Welcome to Dashboard</h1>;
}
