import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ArtifactBody } from './ArtifactBody';

describe('ArtifactBody', () => {
  it('renders a multi-paragraph body as separate paragraphs', () => {
    render(
      <ArtifactBody body={'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.'} />,
    );
    const container = screen.getByTestId('artifact-body');
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs.length).toBe(3);
    expect(paragraphs[0]?.textContent).toBe('First paragraph.');
    expect(paragraphs[2]?.textContent).toBe('Third paragraph.');
  });

  it('renders ordered and unordered lists', () => {
    render(
      <ArtifactBody
        body={'- item one\n- item two\n- item three\n\n1. first\n2. second'}
      />,
    );
    const container = screen.getByTestId('artifact-body');
    expect(container.querySelectorAll('ul li').length).toBe(3);
    expect(container.querySelectorAll('ol li').length).toBe(2);
  });

  it('renders GFM tables (via remark-gfm)', () => {
    render(
      <ArtifactBody
        body={'| h1 | h2 |\n| --- | --- |\n| a | b |\n| c | d |'}
      />,
    );
    const container = screen.getByTestId('artifact-body');
    const table = container.querySelector('table');
    expect(table).not.toBeNull();
    expect(table?.querySelectorAll('th').length).toBe(2);
    expect(table?.querySelectorAll('tbody tr').length).toBe(2);
  });

  it('renders fenced code blocks', () => {
    render(
      <ArtifactBody body={'```\nconst x = 1;\n```'} />,
    );
    const container = screen.getByTestId('artifact-body');
    const code = container.querySelector('pre code');
    expect(code?.textContent?.trim()).toBe('const x = 1;');
  });

  it('renders markdown links as anchors', () => {
    render(
      <ArtifactBody body={'See [the spec](https://example.test/spec).'} />,
    );
    const anchor = screen.getByRole('link', { name: 'the spec' });
    expect(anchor).toHaveAttribute('href', 'https://example.test/spec');
  });

  it('does not render raw HTML — angle brackets become literal text', () => {
    render(
      <ArtifactBody body={'Here is <script>alert(1)</script> embedded.'} />,
    );
    const container = screen.getByTestId('artifact-body');
    // react-markdown escapes raw HTML by default; no script tag should appear.
    expect(container.querySelector('script')).toBeNull();
    expect(container.textContent).toContain('<script>');
  });

  it('renders a placeholder when body is empty or null', () => {
    const { rerender } = render(<ArtifactBody body={null} />);
    expect(screen.getByTestId('artifact-body-empty')).toBeInTheDocument();
    rerender(<ArtifactBody body="   " />);
    expect(screen.getByTestId('artifact-body-empty')).toBeInTheDocument();
  });
});
