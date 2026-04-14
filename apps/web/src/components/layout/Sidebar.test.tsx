import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Sidebar } from './Sidebar';

describe('<Sidebar />', () => {
  it('renders a labelled nav landmark with the primary links', () => {
    render(<Sidebar currentPath="/" />);

    const nav = screen.getByRole('navigation', { name: /primary/i });
    expect(nav).toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'Discover' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Gaps' })).toBeInTheDocument();
  });

  it('marks only the Discover link active when on the root path', () => {
    render(<Sidebar currentPath="/" />);

    expect(screen.getByRole('link', { name: 'Discover' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Gaps' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('marks the Gaps link active when on /gaps', () => {
    render(<Sidebar currentPath="/gaps" />);

    expect(screen.getByRole('link', { name: 'Gaps' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    // Discover uses exact matching — should NOT be active for /gaps.
    expect(screen.getByRole('link', { name: 'Discover' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('marks the Gaps link active for nested /gaps/* paths', () => {
    render(<Sidebar currentPath="/gaps/untested" />);

    expect(screen.getByRole('link', { name: 'Gaps' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});
