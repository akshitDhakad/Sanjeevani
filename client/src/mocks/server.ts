/**
 * MSW Server Setup
 * Configures MSW for browser environment
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

// Start MSW in development
async function enableMocking() {
  if (import.meta.env.DEV) {
    try {
      await worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: {
          url: '/mockServiceWorker.js',
        },
      });
      console.log('✅ MSW worker started successfully');
    } catch (error) {
      console.warn('⚠️ MSW failed to start:', error);
      console.warn('⚠️ Make sure mockServiceWorker.js exists in the public directory');
    }
  }
}

enableMocking();

