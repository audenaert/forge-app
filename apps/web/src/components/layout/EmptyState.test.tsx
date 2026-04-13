import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { EmptyState } from './EmptyState';

describe('<EmptyState />', () => {
  it('renders title and description', () => {
    render(
      <EmptyState
        title="Nothing here yet"
        description={<p>Create your first objective to get started.</p>}
      />,
    );

    expect(
      screen.getByRole('heading', { name: /nothing here yet/i, level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/create your first objective/i),
    ).toBeInTheDocument();
  });

  it('renders the optional action slot when provided', () => {
    render(
      <EmptyState
        title="Empty"
        description="A description."
        action={<button type="button">Create something</button>}
      />,
    );

    expect(
      screen.getByRole('button', { name: /create something/i }),
    ).toBeInTheDocument();
  });

  it('does not render an action wrapper when no action is provided', () => {
    render(<EmptyState title="Empty" description="nothing" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
