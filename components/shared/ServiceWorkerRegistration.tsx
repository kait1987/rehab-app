'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((registration) => {
            console.log('✅ Service Worker 등록 성공:', registration);
          })
          .catch((error) => {
            console.error('❌ Service Worker 등록 실패:', error);
          });
      });
    }
  }, []);

  return null;
}

