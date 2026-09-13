'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Density = 'comfortable' | 'compact';

interface DashboardContextType {
  density: Density;
  setDensity: (density: Density) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [density, setDensityState] = useState<Density>('comfortable');

  useEffect(() => {
    const saved = localStorage.getItem('aviate-density');
    if (saved === 'compact') {
      setDensityState('compact');
    }
  }, []);

  const setDensity = (newDensity: Density) => {
    setDensityState(newDensity);
    localStorage.setItem('aviate-density', newDensity);
  };

  return (
    <DashboardContext.Provider value={{ density, setDensity }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardContext() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  return context;
}
