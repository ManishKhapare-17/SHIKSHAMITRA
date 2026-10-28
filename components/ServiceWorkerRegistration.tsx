'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.info('[SW] Registered:', reg.scope);
        })
        .catch((err) => {
          // SW failure must not break the app
          console.warn('[SW] Registration failed (app continues normally):', err);
        });
    }
  }, []);

  return null;
}
