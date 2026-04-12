import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Sidebar } from './Sidebar';

describe('<Sidebar />', () => {
  it('renders a labelled nav landmark with all three primary links', () => {
    render(<Sidebar currentPath="/" />);

    const nav = screen.getByRole('navigation', { name: /primary/i });
    expect(nav).toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tree' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Gaps' })).toBeInTheDocument();
  });

  it('marks only the Dashboard link active when on the root path', () => {
    render(<Sidebar currentPath="/" />);

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Tree' })).not.toHaveAttribute(
      'aria-current',
    );
    expect(screen.getByRole('link', { name: 'Gaps' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('marks the Tree link active when on a /tree/* path', () => {
    render(<Sidebar currentPath="/tree/objective/123" />);

    expect(screen.getByRole('link', { name: 'Tree' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    // Dashboard uses exact matching — should NOT be active for /tree/*
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('marks the Gaps link active when on /assumptions', () => {
    render(<Sidebar currentPath="/assumptions" />);

    expect(screen.getByRole('link', { name: 'Gaps' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});
