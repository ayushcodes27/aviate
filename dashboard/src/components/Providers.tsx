'use client';

import { DashboardProvider } from './DashboardContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <DashboardProvider>{children}</DashboardProvider>;
}
