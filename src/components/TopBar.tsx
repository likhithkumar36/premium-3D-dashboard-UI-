import {
  Bell,
  Check,
  Menu,
  Search,
  Settings,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { PROFILE_AVATAR_URL } from '../data/dashboardData';
import type { NavSection, NotificationItem } from '../types/dashboard';

interface TopBarProps {
  activeSection: NavSection;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onToggleNotificationRead: (id: string) => void;
  onOpenMobileMenu: () => void;
  onNavigate: (section: NavSection) => void;
}

const SECTION_TITLES: Record<NavSection, string> = {
  overview: 'Operations Overview',
  analytics: 'Deep Analytics',
  deployments: 'Cluster Deployments',
  activity: 'Audit & Activity Log',
  team: 'Workspace Team',
  settings: 'Control Preferences',
};

export function TopBar({
  activeSection,
  searchQuery,
  onSearchChange,
  notifications,
  onMarkAllRead,
  onToggleNotificationRead,
  onOpenMobileMenu,
  onNavigate,
}: TopBarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const notifContainerRef = useRef<HTMLDivElement | null>(null);
  const profileContainerRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const onOutsideClick = (e: MouseEvent) => {
      if (
        notifContainerRef.current &&
        !notifContainerRef.current.contains(e.target as Node)
      ) {
        setNotifOpen(false);
      }
      if (
        profileContainerRef.current &&
        !profileContainerRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#080a10]/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile Drawer Trigger + Section Context */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-slate-300 hover:text-white lg:hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2 text-sm min-w-0">
            <span className="text-slate-500">Workspace</span>
            <span className="text-slate-600">/</span>
            <span className="font-medium text-slate-100 truncate">
              {SECTION_TITLES[activeSection]}
            </span>
          </div>
        </div>

        {/* Center: Working Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
          <input
            ref={searchRef}
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter nodes, regions, or events..."
            aria-label="Filter dashboard nodes, regions, or events"
            className="h-10 w-full rounded-xl border border-white/[0.09] bg-white/[0.04] pl-10 pr-16 text-sm text-slate-100 placeholder:text-slate-500 transition-all duration-150 focus:border-sky-400/50 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-sky-400/20"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-slate-400 sm:inline-block">
              ⌘K
            </kbd>
          )}
        </div>

        {/* Right: Notifications, Settings, Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Notifications Popover */}
          <div ref={notifContainerRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setNotifOpen((prev) => !prev);
                setProfileOpen(false);
              }}
              aria-label={`Notifications (${unreadCount} unread)`}
              aria-expanded={notifOpen}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-slate-300 transition-colors hover:border-white/[0.16] hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-sky-500 px-1 font-mono text-[10px] font-semibold text-slate-950">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-2xl border border-white/[0.12] glass-surface-elevated p-4 z-50">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <span className="text-sm font-semibold text-white">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={onMarkAllRead}
                      className="inline-flex items-center gap-1 text-xs font-medium text-sky-300 hover:text-sky-200 cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="mt-2 divide-y divide-white/[0.06] max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => onToggleNotificationRead(n.id)}
                      className={`w-full py-3 text-left transition-colors hover:bg-white/[0.03] px-2 -mx-2 rounded-xl cursor-pointer ${
                        n.read ? 'opacity-65' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-100">
                          {n.title}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500 shrink-0">
                          {n.timestamp}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                        {n.detail}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Settings Trigger */}
          <button
            type="button"
            onClick={() => onNavigate('settings')}
            aria-label="Open preferences and settings"
            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
              activeSection === 'settings'
                ? 'border-sky-400/40 bg-sky-500/15 text-sky-200'
                : 'border-white/[0.08] bg-white/[0.04] text-slate-300 hover:border-white/[0.16] hover:text-white'
            }`}
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* Profile Menu */}
          <div ref={profileContainerRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileOpen((prev) => !prev);
                setNotifOpen(false);
              }}
              aria-label="Account menu"
              aria-expanded={profileOpen}
              className="flex h-10 items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] pl-1.5 pr-3 transition-colors hover:border-white/[0.16] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              <div className="h-7 w-7 overflow-hidden rounded-lg bg-sky-500/20 flex items-center justify-center">
                {!avatarFailed ? (
                  <img
                    src={PROFILE_AVATAR_URL}
                    alt="Elena Vance"
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarFailed(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-[11px] font-semibold text-white">EV</span>
                )}
              </div>
              <span className="hidden md:inline text-xs font-medium text-slate-200 whitespace-nowrap">
                Elena Vance
              </span>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2.5 w-60 rounded-2xl border border-white/[0.12] glass-surface-elevated p-3 z-50">
                <div className="border-b border-white/[0.08] pb-3 px-1">
                  <p className="text-sm font-semibold text-white">Elena Vance</p>
                  <p className="text-xs text-slate-400 truncate">
                    elena.vance@kestrelops.io
                  </p>
                </div>
                <div className="mt-2 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate('team');
                      setProfileOpen(false);
                    }}
                    className="flex w-full items-center rounded-xl px-2.5 py-2 text-xs font-medium text-slate-300 hover:bg-white/[0.06] hover:text-white cursor-pointer"
                  >
                    Team & Permissions
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate('settings');
                      setProfileOpen(false);
                    }}
                    className="flex w-full items-center rounded-xl px-2.5 py-2 text-xs font-medium text-slate-300 hover:bg-white/[0.06] hover:text-white cursor-pointer"
                  >
                    Display & 3D Preferences
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
