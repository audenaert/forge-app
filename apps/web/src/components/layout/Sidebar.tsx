import { useRouterState } from '@tanstack/react-router';

interface NavItem {
  label: string;
  href: string;
  /**
   * If true, the item is active only when the pathname exactly matches.
   * Defaults to false (prefix match) so `/gaps/untested` still
   * highlights the Gaps link.
   */
  exact?: boolean;
}

/*
 * Navigation entries for the discovery explorer shell.
 *
 * M1a scope is deliberately minimal: Discover is the root of the
 * discovery explorer (currently a placeholder EmptyState), and Gaps
 * is the planned untested-assumptions view. Both targets become real
 * routes in later M1b stories. We render plain anchors rather than
 * typed TanStack Router `Link`s because typed routing would reject
 * the not-yet-registered targets. Migrating to `Link` is a one-line
 * change per item when those routes land.
 */
const NAV_ITEMS: NavItem[] = [
  { label: 'Discover', href: '/', exact: true },
  { label: 'Gaps', href: '/gaps' },
];

interface SidebarProps {
  /**
   * The pathname to match against nav items when computing active state.
   * Kept as a plain prop so the component is trivially testable without a
   * router context. App-level mounting uses <RoutedSidebar />, which reads
   * the pathname from TanStack Router and forwards it.
   */
  currentPath: string;
}

function isActive(itemHref: string, currentPath: string, exact?: boolean) {
  if (exact) return currentPath === itemHref;
  return currentPath === itemHref || currentPath.startsWith(`${itemHref}/`);
}

export function Sidebar({ currentPath }: SidebarProps) {
  return (
    <nav aria-label="Primary" className="flex h-full flex-col px-3 py-5">
      <div
        className="mb-6 px-2 text-[11px] font-semibold uppercase"
        style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}
      >
        Etak
      </div>
      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, currentPath, item.exact);
          return (
            <li key={item.href}>
              <a
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className="block rounded-sm px-3 py-2 text-sm"
                style={{
                  // Active: ocean text + subtle ocean background tint (8%
                  // opacity per the design system "Navigation" section).
                  // Inactive: secondary text weight — gravitationally
                  // lighter than page anchors.
                  color: active
                    ? 'var(--color-ocean)'
                    : 'var(--text-secondary)',
                  backgroundColor: active
                    ? 'color-mix(in srgb, var(--color-ocean) 8%, transparent)'
                    : 'transparent',
                  fontWeight: active ? 600 : 500,
                  transition:
                    'background-color 120ms cubic-bezier(0.16, 1, 0.3, 1), color 120ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/*
 * Router-connected variant. Reads the current pathname from TanStack
 * Router and passes it to <Sidebar />. This is what the AppShell mounts
 * in production; the raw <Sidebar /> is what component tests exercise.
 */
export function RoutedSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return <Sidebar currentPath={pathname} />;
}
