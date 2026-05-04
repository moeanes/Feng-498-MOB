import { Link } from 'react-router-dom';
import { Server, Activity, Shield, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="size-full bg-neutral-950 text-white overflow-auto">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="min-h-screen flex items-center justify-center px-8"
      >
        <div className="max-w-4xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 mb-8">
              <Server className="w-12 h-12 text-blue-500" />
              <h1 className="text-6xl">System Monitor</h1>
            </div>

            <p className="text-xl text-neutral-400 mb-12 max-w-2xl mx-auto">
              Real-time infrastructure monitoring for your entire fleet. Track CPU, memory, disk, and network metrics across all your servers.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-8 py-4 transition-colors"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24"
          >
            <div className="bg-neutral-900 border border-neutral-800 p-8">
              <Activity className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="text-lg mb-2">Real-Time Metrics</h3>
              <p className="text-sm text-neutral-400">
                Monitor CPU, RAM, disk usage, and network traffic with live updates every 3 seconds.
              </p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-8">
              <Zap className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="text-lg mb-2">Multi-Machine View</h3>
              <p className="text-sm text-neutral-400">
                Track all your servers simultaneously with instant status indicators and detailed charts.
              </p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-8">
              <Shield className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="text-lg mb-2">Smart Alerts</h3>
              <p className="text-sm text-neutral-400">
                Get visual warnings when resources reach critical thresholds before issues occur.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
