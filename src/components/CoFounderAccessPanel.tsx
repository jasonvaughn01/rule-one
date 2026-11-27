import React, { useState } from 'react';
import { Check, Copy, LogIn, LogOut, ShieldCheck, Trash2, UserPlus } from 'lucide-react';
import {
  PRIMARY_FOUNDER_EMAIL,
  SHARED_APP_URL,
} from '../lib/firebase';

export interface CoFounderRecord {
  id: string;
  email: string;
  displayName: string;
  role: 'cofounder' | 'admin';
  addedByEmail: string;
}

interface CoFounderAccessPanelProps {
  currentUserEmail: string | null;
  currentUserName: string | null;
  isAuthorizedAdmin: boolean;
  authLoading: boolean;
  cloudSynced: boolean;
  cofounders: CoFounderRecord[];
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onAddCoFounder: (email: string, displayName: string, role: 'cofounder' | 'admin') => Promise<void>;
  onRemoveCoFounder: (member: CoFounderRecord) => Promise<void>;
}

export function CoFounderAccessPanel({
  currentUserEmail,
  currentUserName,
  isAuthorizedAdmin,
  authLoading,
  cloudSynced,
  cofounders,
  onSignIn,
  onSignOut,
  onAddCoFounder,
  onRemoveCoFounder,
}: CoFounderAccessPanelProps) {
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'cofounder' | 'admin'>('cofounder');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(SHARED_APP_URL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setFeedback({ text: `Share link: ${SHARED_APP_URL}`, ok: true });
    }
  };

  const handleSignInClick = async () => {
    setBusy(true);
    setFeedback(null);
    try {
      await onSignIn();
    } catch (err) {
      setFeedback({
        text: err instanceof Error ? err.message : 'Google Sign-In was cancelled or blocked.',
        ok: false,
      });
    } finally {
      setBusy(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedEmail = newEmail.trim().toLowerCase();
    const cleanedName = newName.trim().slice(0, 80);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedEmail) || cleanedEmail.length > 120) {
      setFeedback({ text: 'Enter a valid Google email address (max 120 chars).', ok: false });
      return;
    }
    if (!cleanedName) {
      setFeedback({ text: 'Enter a display name or gamertag.', ok: false });
      return;
    }
    if (cleanedEmail === PRIMARY_FOUNDER_EMAIL) {
      setFeedback({ text: 'Primary founder already holds full permanent access.', ok: false });
      return;
    }
    if (cofounders.some((c) => c.email.toLowerCase() === cleanedEmail)) {
      setFeedback({ text: `${cleanedEmail} already has active Co-Founder/Admin access.`, ok: false });
      return;
    }
    if (cofounders.length >= 15) {
      setFeedback({ text: 'Maximum limit of 15 Co-Founders/Admins reached.', ok: false });
      return;
    }

    setBusy(true);
    setFeedback(null);
    try {
      await onAddCoFounder(cleanedEmail, cleanedName, newRole);
      setNewEmail('');
      setNewName('');
      setFeedback({
        text: `Granted full ${newRole === 'cofounder' ? 'Co-Founder' : 'Admin'} access to ${cleanedEmail}.`,
        ok: true,
      });
    } catch (err) {
      setFeedback({
        text: err instanceof Error ? err.message : 'Unable to add co-founder.',
        ok: false,
      });
    } finally {
      setBusy(false);
    }
  };

  const handleRemoveClick = async (member: CoFounderRecord) => {
    setBusy(true);
    setFeedback(null);
    try {
      await onRemoveCoFounder(member);
      setFeedback({ text: `Revoked access for ${member.email}.`, ok: true });
    } catch (err) {
      setFeedback({
        text: err instanceof Error ? err.message : 'Unable to remove member.',
        ok: false,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="bg-[#111319] border border-[#22252E] rounded-lg p-6 lg:p-8 space-y-6">
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#22252E]">
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#C9A86A]">
            Live Cloud Permissions · Founder &amp; Co-Founder RBAC
          </p>
          <h2 className="font-display text-xl font-semibold text-[#F3F1EC]">
            Co-Founder &amp; Admin Team Access
          </h2>
          <p className="text-xs text-[#9C9A94] max-w-2xl">
            Sign in with Google to sync shared MW4 S&amp;D playbooks, match settlements, and add or
            revoke Co-Founder / Admin accounts in real time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {authLoading ? (
            <span className="text-xs font-mono text-[#8C8982]">Checking account...</span>
          ) : currentUserEmail ? (
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-left sm:text-right">
                <p className="text-xs font-medium text-[#F3F1EC]">
                  {currentUserName || currentUserEmail}
                </p>
                <p className="text-[11px] font-mono text-[#9C9A94]">
                  {currentUserEmail} ·{' '}
                  <span className={isAuthorizedAdmin ? 'text-[#4ADE80]' : 'text-[#F59E0B]'}>
                    {isAuthorizedAdmin
                      ? currentUserEmail.toLowerCase() === PRIMARY_FOUNDER_EMAIL
                        ? 'Primary Founder'
                        : 'Co-Founder (Full Admin)'
                      : 'Read-Only Guest'}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => void onSignOut()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#F3F1EC] bg-[#181B23] hover:bg-[#222632] border border-[#2B2F3A] rounded-md transition-colors whitespace-nowrap"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                Sign Out
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleSignInClick()}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#090A0D] bg-[#C9A86A] hover:bg-[#D7B97E] disabled:opacity-50 rounded-md transition-colors whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
              Sign In with Google
            </button>
          )}
        </div>
      </div>

      {/* Direct Co-Founder Connect Link */}
      <div className="bg-[#0D0F14] border border-[#22252E] rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[#F3F1EC]">
            Direct Co-Founder Connection Link
          </p>
          <p className="font-mono text-xs text-[#C9A86A] truncate mt-0.5">{SHARED_APP_URL}</p>
        </div>
        <button
          type="button"
          onClick={() => void handleCopyLink()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#F3F1EC] bg-[#181B23] hover:bg-[#222632] border border-[#2B2F3A] rounded-md transition-colors whitespace-nowrap shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#4ADE80]" aria-hidden="true" />
              Link Copied
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" aria-hidden="true" />
              Copy Link
            </>
          )}
        </button>
      </div>

      {/* Authorized Roster List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#F3F1EC]">
            Authorized Founders &amp; Co-Founders
          </h3>
          <span className="text-xs font-mono text-[#8C8982] tabular-nums">
            {cloudSynced ? 'Cloud Sync Active' : 'Sign in to sync & edit'} · {1 + cofounders.length} Active
          </span>
        </div>

        <div className="divide-y divide-[#1D2028] border border-[#22252E] rounded-md bg-[#0E1016]">
          {/* Primary Founder row */}
          <div className="px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#F3F1EC]">
                Jason Vaughn <span className="text-xs text-[#C9A86A] font-normal">· Primary Founder</span>
              </p>
              <p className="font-mono text-xs text-[#8C8982] truncate">{PRIMARY_FOUNDER_EMAIL}</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-mono text-[#4ADE80]">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              Permanent Owner
            </span>
          </div>

          {/* Co-Founders & Admins */}
          {cofounders.map((member) => (
            <div
              key={member.id}
              className="px-4 py-3.5 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#F3F1EC]">
                  {member.displayName}{' '}
                  <span className="text-xs text-[#C9A86A] font-normal">
                    · {member.role === 'cofounder' ? 'Co-Founder (Full Admin)' : 'Tactical Admin'}
                  </span>
                </p>
                <p className="font-mono text-xs text-[#8C8982] truncate">
                  {member.email} · Added by {member.addedByEmail}
                </p>
              </div>

              {isAuthorizedAdmin && cloudSynced && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleRemoveClick(member)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#F87171] hover:bg-[#F87171]/10 border border-[#F87171]/30 rounded-md transition-colors whitespace-nowrap shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  Remove Access
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Co-Founder / Admin Form */}
      {isAuthorizedAdmin && cloudSynced ? (
        <form onSubmit={(e) => void handleAddSubmit(e)} className="pt-4 border-t border-[#22252E] space-y-4">
          <p className="text-xs font-medium text-[#F3F1EC]">Add New Co-Founder or Admin</p>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Google email address (e.g. partner@gmail.com)"
              aria-label="Co-founder Google email"
              maxLength={120}
              required
              className="md:col-span-5 px-3 py-2 text-xs bg-[#0D0F14] border border-[#252934] rounded-md text-[#F3F1EC] placeholder:text-[#6E6C66] focus:border-[#C9A86A] focus:outline-none"
            />
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name or Gamertag"
              aria-label="Co-founder display name"
              maxLength={80}
              required
              className="md:col-span-3 px-3 py-2 text-xs bg-[#0D0F14] border border-[#252934] rounded-md text-[#F3F1EC] placeholder:text-[#6E6C66] focus:border-[#C9A86A] focus:outline-none"
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as 'cofounder' | 'admin')}
              aria-label="Admin role"
              className="md:col-span-2 px-3 py-2 text-xs bg-[#0D0F14] border border-[#252934] rounded-md text-[#F3F1EC] focus:border-[#C9A86A] focus:outline-none"
            >
              <option value="cofounder">Co-Founder</option>
              <option value="admin">Tactical Admin</option>
            </select>
            <button
              type="submit"
              disabled={busy}
              className="md:col-span-2 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#090A0D] bg-[#C9A86A] hover:bg-[#D7B97E] disabled:opacity-40 rounded-md transition-colors whitespace-nowrap"
            >
              <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
              Add Admin
            </button>
          </div>
        </form>
      ) : (
        <p className="text-xs text-[#8C8982] pt-2 border-t border-[#22252E]">
          Sign in with Google as <span className="font-mono text-[#F3F1EC]">{PRIMARY_FOUNDER_EMAIL}</span> or{' '}
          <span className="font-mono text-[#F3F1EC]">FPSxFUBARxGSG@gmail.com</span> to add or remove
          Co-Founders and sync shared MW4 S&amp;D playbooks live.
        </p>
      )}

      {feedback && (
        <p className={`text-xs font-medium ${feedback.ok ? 'text-[#4ADE80]' : 'text-[#F87171]'}`}>
          {feedback.text}
        </p>
      )}
    </section>
  );
}
