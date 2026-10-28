'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      if (process.env.NODE_ENV === 'production') {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.info('[SW] Registered:', reg.scope);
          })
          .catch((err) => {
            // SW failure must not break the app
            console.warn('[SW] Registration failed (app continues normally):', err);
          });
      } else {
        // In development mode, unregister any active service worker so it does not intercept Turbopack HMR or dev chunks
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) {
            void reg.unregister();
          }
        });
      }
    }
  }, []);

  return null;
}
