import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { App } from './App';
import { createAppRouter } from './router';

describe('<App />', () => {
  it('renders the Discovery Explorer placeholder inside the AppShell', async () => {
    const router = createAppRouter({ memory: true });
    render(<App router={router} />);

    // The AppShell + sidebar should be present.
    await waitFor(() => {
      expect(screen.getByTestId('app-shell')).toBeInTheDocument();
    });
    expect(screen.getByTestId('app-shell-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('app-shell-main')).toBeInTheDocument();

    // The Primary nav landmark is labelled.
    expect(screen.getByRole('navigation', { name: /primary/i })).toBeInTheDocument();

    // The EmptyState placeholder is rendered as the `/` route content.
    expect(
      screen.getByRole('heading', { name: /discovery explorer/i, level: 2 }),
    ).toBeInTheDocument();

    // And the Dashboard nav link is marked as the active route.
    const dashboardLink = screen.getByRole('link', { name: 'Dashboard' });
    expect(dashboardLink).toHaveAttribute('aria-current', 'page');
  });
});
