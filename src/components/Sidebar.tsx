import {
  Activity,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Layers,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { PROFILE_AVATAR_URL } from '../data/dashboardData';
import type { NavSection } from '../types/dashboard';

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: Array<{
  id: NavSection;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'deployments', label: 'Deployments', icon: Layers },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({
  activeSection,
  onSelectSection,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const [avatarFailed, setAvatarFailed] = useState(false);

  const handleNavClick = (section: NavSection) => {
    onSelectSection(section);
    onCloseMobile();
  };

  const sidebarContent = (isMobile: boolean) => {
    const isCompact = !isMobile && collapsed;

    return (
      <div className="flex h-full flex-col justify-between p-3.5">
        {/* Top Brand & Collapse Control */}
        <div className="space-y-6">
          <div
            className={`flex items-center ${
              isCompact ? 'justify-center' : 'justify-between px-1.5'
            } h-10`}
          >
            <button
              type="button"
              onClick={() => handleNavClick('overview')}
              className="flex items-center gap-3 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-lg"
            >
              {/* Geometric 3D Isometric Brand Emblem */}
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sky-400/30 bg-gradient-to-br from-sky-500/20 via-indigo-500/15 to-transparent shadow-[0_0_24px_-4px_rgba(56,189,248,0.45)]">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M12 2.5L20.5 7.25V16.75L12 21.5L3.5 16.75V7.25L12 2.5Z"
                    stroke="#38bdf8"
                    strokeWidth="1.75"
                  />
                  <path
                    d="M12 2.5V12M12 12L20.5 7.25M12 12L3.5 7.25M12 12V21.5"
                    stroke="#818cf8"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              {!isCompact && (
                <span className="font-display text-lg font-semibold tracking-tight text-white whitespace-nowrap shrink-0">
                  Kestrel
                </span>
              )}
            </button>

            {isMobile ? (
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close navigation menu"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              !isCompact && (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  aria-label="Collapse sidebar"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )
            )}
          </div>

          {isCompact && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label="Expand sidebar"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-slate-400 transition-colors hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Primary Navigation */}
          <nav aria-label="Primary Sidebar Navigation" className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  title={isCompact ? item.label : undefined}
                  aria-current={isActive ? 'page' : undefined}
                  className={`group relative flex w-full items-center ${
                    isCompact ? 'justify-center px-2' : 'gap-3 px-3.5'
                  } h-11 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-500/20 via-sky-500/10 to-transparent text-white border border-sky-400/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]'
                      : 'text-slate-400 border border-transparent hover:bg-white/[0.04] hover:text-slate-100'
                  }`}
                >
                  <Icon
                    className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                      isActive
                        ? 'text-sky-300'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  {!isCompact && (
                    <span className="whitespace-nowrap truncate">
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile / User Section */}
        <div className="border-t border-white/[0.08] pt-3.5">
          <button
            type="button"
            onClick={() => handleNavClick('settings')}
            title={isCompact ? 'Elena Vance · Settings' : undefined}
            className={`flex w-full items-center ${
              isCompact ? 'justify-center p-1.5' : 'gap-3 p-2'
            } rounded-xl transition-colors hover:bg-white/[0.05] text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400`}
          >
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-white/[0.14] bg-gradient-to-br from-sky-500/30 to-indigo-500/30 flex items-center justify-center">
              {!avatarFailed ? (
                <img
                  src={PROFILE_AVATAR_URL}
                  alt="Elena Vance"
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarFailed(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs font-semibold text-white">EV</span>
              )}
            </div>
            {!isCompact && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-100 truncate">
                  Elena Vance
                </p>
                <p className="text-xs text-slate-400 truncate">
                  VP Platform Ops
                </p>
              </div>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Collapsible Sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 border-r border-white/[0.07] bg-[#090b11]/80 backdrop-blur-2xl transition-[width] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] z-20 ${
          collapsed ? 'w-[76px]' : 'w-[252px]'
        }`}
      >
        <div className="sticky top-0 h-screen">{sidebarContent(false)}</div>
      </aside>

      {/* Mobile / Tablet Slide-Over Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            aria-hidden="true"
          />
          <aside className="relative z-10 w-[272px] max-w-[85vw] h-full border-r border-white/[0.1] bg-[#0a0c12]/95 backdrop-blur-2xl shadow-2xl">
            {sidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}
