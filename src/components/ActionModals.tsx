import { Rocket, UserPlus, X } from 'lucide-react';
import { useState } from 'react';
import type { ActivityItem, DeploymentNode, TeamMember } from '../types/dashboard';

interface DeployModalProps {
  open: boolean;
  onClose: () => void;
  onCreateDeployment: (
    service: string,
    environment: DeploymentNode['environment'],
    region: string,
    version: string
  ) => void;
}

export function NewDeploymentModal({
  open,
  onClose,
  onCreateDeployment,
}: DeployModalProps) {
  const [service, setService] = useState('edge-inference-worker');
  const [environment, setEnvironment] =
    useState<DeploymentNode['environment']>('Production');
  const [region, setRegion] = useState('US East · Virginia');
  const [version, setVersion] = useState('v4.19.0');

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!service.trim() || !version.trim()) return;
    onCreateDeployment(service.trim(), environment, region, version.trim());
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deploy-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-white/[0.12] glass-surface-elevated p-6">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300 border border-sky-400/25">
              <Rocket className="h-4 w-4" />
            </div>
            <h2 id="deploy-modal-title" className="text-lg font-semibold text-white">
              Launch Deployment
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/[0.06] hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="dep-service"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              Service Name
            </label>
            <input
              id="dep-service"
              type="text"
              required
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 text-sm text-white focus:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="dep-env"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Environment
              </label>
              <select
                id="dep-env"
                value={environment}
                onChange={(e) =>
                  setEnvironment(e.target.value as DeploymentNode['environment'])
                }
                className="h-10 w-full rounded-xl border border-white/[0.1] bg-[#0f131d] px-3 text-sm text-white focus:border-sky-400/50 focus:outline-none"
              >
                <option value="Production">Production</option>
                <option value="Canary">Canary</option>
                <option value="Staging">Staging</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="dep-version"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Release Tag
              </label>
              <input
                id="dep-version"
                type="text"
                required
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 font-mono text-sm text-white focus:border-sky-400/50 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="dep-region"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              Target Region
            </label>
            <select
              id="dep-region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/[0.1] bg-[#0f131d] px-3 text-sm text-white focus:border-sky-400/50 focus:outline-none"
            >
              <option value="US East · Virginia">US East · Virginia</option>
              <option value="EU Central · Frankfurt">EU Central · Frankfurt</option>
              <option value="AP Northeast · Tokyo">AP Northeast · Tokyo</option>
              <option value="US West · Oregon">US West · Oregon</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-white/[0.08] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/[0.06] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-sky-400 cursor-pointer"
            >
              Deploy Service
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  onInvite: (
    name: string,
    email: string,
    role: string,
    accessLevel: TeamMember['accessLevel']
  ) => void;
}

export function InviteMemberModal({ open, onClose, onInvite }: InviteModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Systems Reliability Engineer');
  const [accessLevel, setAccessLevel] =
    useState<TeamMember['accessLevel']>('Operator');

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onInvite(name.trim(), email.trim(), role.trim(), accessLevel);
    setName('');
    setEmail('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-white/[0.12] glass-surface-elevated p-6">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300 border border-indigo-400/25">
              <UserPlus className="h-4 w-4" />
            </div>
            <h2 id="invite-modal-title" className="text-lg font-semibold text-white">
              Invite Team Member
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/[0.06] hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="inv-name"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              Full Name
            </label>
            <input
              id="inv-name"
              type="text"
              required
              placeholder="Soren Lindqvist"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-400/50 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="inv-email"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              Work Email
            </label>
            <input
              id="inv-email"
              type="email"
              required
              placeholder="soren@kestrelops.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-400/50 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="inv-role"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Title
              </label>
              <input
                id="inv-role"
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 text-sm text-white focus:border-sky-400/50 focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="inv-access"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Access Level
              </label>
              <select
                id="inv-access"
                value={accessLevel}
                onChange={(e) =>
                  setAccessLevel(e.target.value as TeamMember['accessLevel'])
                }
                className="h-10 w-full rounded-xl border border-white/[0.1] bg-[#0f131d] px-3 text-sm text-white focus:border-sky-400/50 focus:outline-none"
              >
                <option value="Admin">Admin</option>
                <option value="Operator">Operator</option>
                <option value="Analyst">Analyst</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-white/[0.08] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/[0.06] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-sky-400 cursor-pointer"
            >
              Send Invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ActivityInspectorModalProps {
  activity: ActivityItem | null;
  onClose: () => void;
}

export function ActivityInspectorModal({
  activity,
  onClose,
}: ActivityInspectorModalProps) {
  if (!activity) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="activity-modal-title"
    >
      <div className="w-full max-w-lg rounded-2xl border border-white/[0.12] glass-surface-elevated p-6">
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div>
            <p className="text-xs font-mono text-sky-300">
              {activity.commitOrRef} · {activity.timestamp}
            </p>
            <h2
              id="activity-modal-title"
              className="mt-1 text-lg font-semibold text-white"
            >
              {activity.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close inspector"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/[0.06] hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-4 text-sm">
          <p className="text-slate-300 leading-relaxed">{activity.summary}</p>
          <div className="grid grid-cols-2 gap-4 border-t border-white/[0.08] pt-4 text-xs">
            <div>
              <span className="text-slate-500">Initiated by</span>
              <p className="mt-1 font-medium text-slate-100">{activity.actor}</p>
            </div>
            <div>
              <span className="text-slate-500">Availability Zone</span>
              <p className="mt-1 font-medium text-slate-100">{activity.region}</p>
            </div>
            <div>
              <span className="text-slate-500">Category</span>
              <p className="mt-1 font-medium capitalize text-slate-100">
                {activity.category}
              </p>
            </div>
            <div>
              <span className="text-slate-500">Verification Status</span>
              <p className="mt-1 font-medium text-emerald-300">
                {activity.status}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t border-white/[0.08] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/[0.12] bg-white/[0.06] px-4 py-2 text-xs font-medium text-white hover:bg-white/[0.1] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
