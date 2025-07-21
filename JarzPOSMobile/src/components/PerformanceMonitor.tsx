import React, { useEffect, useRef } from 'react';

interface PerformanceMonitorProps {
  name: string;
  children: React.ReactNode;
}

export function PerformanceMonitor({ name, children }: PerformanceMonitorProps) {
  const renderStartTime = useRef<number>(Date.now());
  const componentMountTime = useRef<number>(0);

  useEffect(() => {
    componentMountTime.current = Date.now();
    const mountDuration = componentMountTime.current - renderStartTime.current;
    
    if (mountDuration > 100) { // Log if component takes more than 100ms to mount
      console.warn(`⚠️ [Performance] ${name} took ${mountDuration}ms to mount`);
    }
    
    return () => {
      const unmountTime = Date.now();
      const totalLifetime = unmountTime - componentMountTime.current;
      if (totalLifetime > 5000) { // Log if component was alive for more than 5 seconds
        console.log(`📊 [Performance] ${name} was active for ${totalLifetime}ms`);
      }
    };
  }, [name]);

  // Reset render start time on each render
  renderStartTime.current = Date.now();

  return <>{children}</>;
}
