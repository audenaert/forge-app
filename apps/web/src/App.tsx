import { RouterProvider } from '@tanstack/react-router';
import { router as defaultRouter, createAppRouter } from './router';

interface AppProps {
  /**
   * Allows tests to inject a memory-history router so they don't touch
   * window.location.
   */
  router?: ReturnType<typeof createAppRouter>;
}

export function App({ router: routerOverride }: AppProps = {}) {
  return <RouterProvider router={routerOverride ?? defaultRouter} />;
}
