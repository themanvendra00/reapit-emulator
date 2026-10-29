import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthContext.jsx';
import { useApiConfig } from '../api/ApiConfigContext.jsx';
import { useApiClient } from '../api/useApiClient.js';
import { useTheme } from '../theme/ThemeContext.jsx';
import Modal from './ui/Modal.jsx';
import Button from './ui/Button.jsx';
import Avatar from './ui/Avatar.jsx';
import { Input, Label } from './ui/Field.jsx';
import {
  BadgeIcon,
  ChevronLeftIcon,
  HeadsetIcon,
  HomeIcon,
  MoonIcon,
  RefreshIcon,
  SearchIcon,
  SettingsIcon,
  SunIcon,
  UsersIcon,
} from './icons.jsx';

const NAV_SECTIONS = [
  {
    label: 'Workspace',
    items: [
      { to: '/vendors', label: 'Vendors', icon: UsersIcon },
      { to: '/properties', label: 'Properties', icon: HomeIcon },
      { to: '/negotiators', label: 'Negotiators', icon: BadgeIcon },
    ],
  },
];

const BREADCRUMBS = [
  { match: /^\/vendors/, trail: ['Workspace', 'Vendors'] },
  { match: /^\/properties\/[^/]+/, trail: ['Properties', 'Property detail'] },
  { match: /^\/properties/, trail: ['Workspace', 'Properties'] },
  { match: /^\/negotiators/, trail: ['Workspace', 'Negotiators'] },
];

function useBreadcrumb() {
  const { pathname } = useLocation();
  const found = BREADCRUMBS.find((b) => b.match.test(pathname));
  return found?.trail || ['Workspace', 'Overview'];
}

export default function Layout() {
  const { user, logout } = useAuth();
  const { baseUrl } = useApiConfig();
  const api = useApiClient();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(true);
  const { dark, toggleDark } = useTheme();
  const trail = useBreadcrumb();

  const health = useQuery({
    queryKey: ['health', baseUrl],
    queryFn: () => api.get('/vendors/?pageSize=1'),
    retry: 0,
    refetchInterval: 30_000,
  });

  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
          className={`z-50 flex w-64 shrink-0 flex-col overflow-y-auto border-r border-line bg-surface transition-transform duration-200 lg:static lg:h-full lg:translate-x-0 ${
            sidebarOpen ? 'fixed inset-y-0 left-0 translate-x-0' : 'fixed inset-y-0 left-0 -translate-x-full lg:flex'
          }`}
        >
          <div className="px-5 pt-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
                R
              </span>
              <span className="text-[18px] font-semibold text-ink">Reapit Console</span>
            </div>

            <div className="mt-5 flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3 focus-within:border-ink focus-within:ring-[3px] focus-within:ring-ink/10">
              <SearchIcon className="h-4 w-4 shrink-0 text-inkmuted" strokeWidth={1.5} />
              <input
                placeholder="Search…"
                className="w-full bg-transparent text-sm text-ink placeholder:text-inkmuted focus:outline-none"
                readOnly
              />
              <kbd className="shrink-0 rounded-md border border-line px-1.5 py-0.5 text-[10px] font-medium text-inkmuted">
                ⌘K
              </kbd>
            </div>
          </div>

          <nav className="mt-6 flex-1 space-y-6 px-3 pb-4">
            {NAV_SECTIONS.map((section) => (
              <div key={section.label}>
                <div className="flex items-center justify-between px-2 pb-2">
                  <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-inkmuted">
                    {section.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => setWorkspaceOpen((o) => !o)}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white transition-transform"
                    style={{ transform: workspaceOpen ? undefined : 'rotate(-90deg)' }}
                    aria-label="Toggle workspace section"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 1l4 4 4-4" />
                    </svg>
                  </button>
                </div>
                {workspaceOpen && (
                  <div className="space-y-0.5">
                    {section.items.map(({ to, label, icon: Icon }) => (
                      <NavLink
                        key={to}
                        to={to}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                          `flex h-10 items-center gap-3 rounded-xl border px-3 text-sm font-medium transition-colors ${
                            isActive
                              ? 'border-line bg-surface text-ink shadow-flat'
                              : 'border-transparent text-inkmuted hover:bg-mist hover:text-ink'
                          }`
                        }
                      >
                        <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
                        {label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="mt-auto border-t border-line p-3">
            <button
              onClick={() => setSettingsOpen(true)}
              className="w-full rounded-2xl bg-mist p-3 text-left hover:bg-line/40"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    health.isError
                      ? 'bg-danger'
                      : health.isFetching
                        ? 'bg-warning'
                        : 'bg-success'
                  }`}
                />
                <span className="truncate text-xs font-medium text-ink">{baseUrl}</span>
              </div>
              <p className="mt-1 text-[11px] text-inkmuted">
                {health.isError ? 'Not reachable — tap to change' : 'Emulator connected'}
              </p>
            </button>

            <div className="flex items-center justify-between gap-2 px-1 pt-3">
              <div className="flex min-w-0 items-center gap-2">
                <Avatar name={user?.email} size="sm" />
                <span className="truncate text-xs font-medium text-ink">{user?.email}</span>
              </div>
              <button
                onClick={logout}
                className="shrink-0 text-xs font-semibold text-inkmuted hover:text-ink"
              >
                Sign out
              </button>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-line bg-surface px-5">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-inkmuted hover:bg-mist hover:text-ink lg:hidden"
                aria-label="Open navigation"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <button
                onClick={() => navigate(-1)}
                className="hidden h-9 w-9 items-center justify-center rounded-full border border-line text-inkmuted hover:bg-mist hover:text-ink lg:inline-flex"
                aria-label="Go back"
              >
                <ChevronLeftIcon className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <nav className="truncate text-[13px] text-inkmuted">
                {trail.map((crumb, i) => (
                  <span key={crumb}>
                    {i > 0 && <span className="mx-1.5">/</span>}
                    <span className={i === trail.length - 1 ? 'font-medium text-ink' : ''}>
                      {crumb}
                    </span>
                  </span>
                ))}
              </nav>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                onClick={toggleDark}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-inkmuted hover:bg-mist hover:text-ink"
                aria-label="Toggle dark mode"
                title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {dark ? <SunIcon className="h-4 w-4" strokeWidth={1.5} /> : <MoonIcon className="h-4 w-4" strokeWidth={1.5} />}
              </button>
              <button
                onClick={() => queryClient.invalidateQueries()}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-inkmuted hover:bg-mist hover:text-ink"
                aria-label="Refresh data"
                title="Refresh data"
              >
                <RefreshIcon className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => setSettingsOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-inkmuted hover:bg-mist hover:text-ink"
                aria-label="Connection settings"
                title="Connection settings"
              >
                <SettingsIcon className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <a
                href="http://localhost:3002/api/docs"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-inkmuted hover:bg-mist hover:text-ink"
                aria-label="API docs"
                title="API docs"
              >
                <HeadsetIcon className="h-4 w-4" strokeWidth={1.5} />
              </a>
            </div>
          </header>

          <main className="min-w-0 flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

function SettingsModal({ open, onClose }) {
  const { baseUrl, setBaseUrl, defaultBaseUrl } = useApiConfig();
  const [value, setValue] = useState(baseUrl);

  const handleSave = () => {
    setBaseUrl(value);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Emulator connection"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <Label htmlFor="baseUrl">API base URL</Label>
          <Input
            id="baseUrl"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={defaultBaseUrl}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
        </div>
        <p className="text-xs text-inkmuted">
          Point this at the local emulator ({defaultBaseUrl}) or a shared dev instance.
          The value is remembered on this device.
        </p>
      </div>
    </Modal>
  );
}
