import { useEffect, useState } from 'react';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import Dashboard from './Dashboard';

export default function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  if (path === '/login') {
    return <LoginPage />;
  }

  if (path === '/dashboard') {
    return <Dashboard />;
  }

  return (
    <LandingPage />
  );
}
