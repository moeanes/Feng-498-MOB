import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Server, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock authentication - in production this would call an API
    if (username && password) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="size-full bg-neutral-950 text-white overflow-auto">
      <div className="min-h-screen flex items-center justify-center px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
              <Server className="w-8 h-8 text-blue-500" />
              <span className="text-2xl">System Monitor</span>
            </Link>
            <h1 className="text-3xl mb-2">Sign In</h1>
            <p className="text-sm text-neutral-400">Access your infrastructure dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 p-8">
            <div className="mb-6">
              <label htmlFor="username" className="block text-sm text-neutral-400 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 px-10 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div className="mb-8">
              <label htmlFor="password" className="block text-sm text-neutral-400 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 px-10 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 transition-colors"
            >
              Sign In
            </button>

            <div className="mt-6 text-center text-sm text-neutral-500">
              Demo credentials: any username and password
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-neutral-400 hover:text-white transition-colors">
              ← Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
