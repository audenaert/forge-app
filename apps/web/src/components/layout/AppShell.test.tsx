import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AppShell } from './AppShell';

describe('<AppShell />', () => {
  it('renders sidebar and main regions', () => {
    render(
      <AppShell sidebar={<div>sidebar content</div>}>
        <div>main content</div>
      </AppShell>,
    );

    expect(screen.getByTestId('app-shell')).toBeInTheDocument();
    expect(screen.getByTestId('app-shell-sidebar')).toHaveTextContent(
      'sidebar content',
    );
    expect(screen.getByTestId('app-shell-main')).toHaveTextContent(
      'main content',
    );
  });

  it('omits the tree rail region when no treeRail prop is provided', () => {
    render(
      <AppShell sidebar={<div>sidebar</div>}>
        <div>main</div>
      </AppShell>,
    );

    expect(screen.queryByTestId('app-shell-tree-rail')).not.toBeInTheDocument();
  });

  it('renders the tree rail region when a treeRail node is provided', () => {
    render(
      <AppShell
        sidebar={<div>sidebar</div>}
        treeRail={<div>tree rail content</div>}
      >
        <div>main</div>
      </AppShell>,
    );

    expect(screen.getByTestId('app-shell-tree-rail')).toHaveTextContent(
      'tree rail content',
    );
  });
});
