import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useApiConfig } from '../api/ApiConfigContext.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { SidebarProvider, SidebarInset, SidebarTrigger } from './ui/sidebar.jsx';
import { Separator } from './ui/separator.jsx';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb.jsx';
import Modal from './ui/Modal.jsx';
import { Button, IconButton } from './ui/Button.jsx';
import { Input, Label } from './ui/Field.jsx';
import AppSidebar from './AppSidebar.jsx';
import { ChevronLeftIcon, HeadsetIcon, MoonIcon, RefreshIcon, SettingsIcon, SunIcon } from './icons.jsx';

const BREADCRUMBS = [
  { match: /^\/dashboard/, trail: [{ label: 'Dashboard' }] },
  { match: /^\/vendors/, trail: [{ label: 'Workspace' }, { label: 'Vendors' }] },
  { match: /^\/properties\/[^/]+/, trail: [{ label: 'Properties', to: '/properties' }, { label: 'Property detail' }] },
  { match: /^\/properties/, trail: [{ label: 'Workspace' }, { label: 'Properties' }] },
  { match: /^\/negotiators/, trail: [{ label: 'Workspace' }, { label: 'Negotiators' }] },
];

function useBreadcrumb() {
  const { pathname } = useLocation();
  const found = BREADCRUMBS.find((b) => b.match.test(pathname));
  return found?.trail || [{ label: 'Workspace' }, { label: 'Overview' }];
}

export default function Layout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { dark, toggleDark } = useTheme();
  const trail = useBreadcrumb();

  return (
    <SidebarProvider>
      <AppSidebar onOpenSettings={() => setSettingsOpen(true)} />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background px-4">
          <div className="flex min-w-0 items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mx-1 h-4" />
            <IconButton className="hidden lg:inline-flex" onClick={() => navigate(-1)} aria-label="Go back">
              <ChevronLeftIcon className="h-4 w-4" strokeWidth={1.5} />
            </IconButton>
            <Breadcrumb>
              <BreadcrumbList>
                {trail.map((crumb, i) => (
                  <span key={crumb.label} className="flex items-center gap-1.5">
                    {i > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {i === trail.length - 1 || !crumb.to ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={crumb.to}>{crumb.label}</BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </span>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <IconButton onClick={toggleDark} aria-label="Toggle dark mode" title={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
              {dark ? <SunIcon className="h-4 w-4" strokeWidth={1.5} /> : <MoonIcon className="h-4 w-4" strokeWidth={1.5} />}
            </IconButton>
            <IconButton onClick={() => queryClient.invalidateQueries()} aria-label="Refresh data" title="Refresh data">
              <RefreshIcon className="h-4 w-4" strokeWidth={1.5} />
            </IconButton>
            <IconButton onClick={() => setSettingsOpen(true)} aria-label="Connection settings" title="Connection settings">
              <SettingsIcon className="h-4 w-4" strokeWidth={1.5} />
            </IconButton>
            <IconButton asChild aria-label="API docs" title="API docs">
              <a href="http://localhost:3002/api/docs" target="_blank" rel="noreferrer">
                <HeadsetIcon className="h-4 w-4" strokeWidth={1.5} />
              </a>
            </IconButton>
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </SidebarInset>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </SidebarProvider>
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
        <p className="text-xs text-muted-foreground">
          Point this at the local emulator ({defaultBaseUrl}) or a shared dev instance.
          The value is remembered on this device.
        </p>
      </div>
    </Modal>
  );
}
