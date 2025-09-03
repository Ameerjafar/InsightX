'use client';

import ProtectedRoute from '../component/ProtectedRoute';
import { Dashboard } from '../component/Dashboard';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
