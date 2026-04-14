import { useRouterState } from '@tanstack/react-router';

interface NavItem {
  label: string;
  href: string;
  /**
   * If true, the item is active only when the pathname exactly matches.
   * Defaults to false (prefix match) so `/tree/objective/123` still
   * highlights the Tree link.
   */
  exact?: boolean;
}

/*
 * Navigation entries for the discovery explorer shell. Rendered as plain
 * anchors rather than typed TanStack Router `Link`s so that not-yet-
 * registered route targets don't fail type-checking. Migrating to `Link`
 * is a one-line change per item when those routes land.
 */
const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/', exact: true },
  { label: 'Tree', href: '/tree' },
  { label: 'Gaps', href: '/assumptions' },
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
                data-active={active ? 'true' : undefined}
                className="etak-nav-link block rounded-sm px-3 py-2 text-sm"
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
