import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { App } from './App';
import { createAppRouter } from './router';

describe('<App />', () => {
  it('renders the Discovery Explorer placeholder', async () => {
    const router = createAppRouter({ memory: true });
    render(<App router={router} />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /discovery explorer/i, level: 1 }),
      ).toBeInTheDocument();
    });
  });
});
