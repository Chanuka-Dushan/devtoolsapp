"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  Zap,
  Lock,
  Search,
  RefreshCw,
  Crown,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowUpDown,
  CreditCard,
  RotateCcw,
  UserCheck,
  UserX,
  FileText,
  Clock,
  Eye,
  X,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: "USER" | "PRO" | "ADMIN" | "SUPER_ADMIN";
  subscriptionStatus: string;
  usageCount: number;
  freeTierLimit: number;
  isPro: boolean;
  paymentNotes?: string | null;
  lastLoginAt?: string | null;
  lastIpAddress?: string | null;
  createdAt: string;
  totalToolUsages: number;
  recentUsages: Array<{
    id: string;
    toolSlug: string;
    createdAt: string;
    metadata: any;
  }>;
}

interface PlatformStats {
  totalUsers: number;
  proUsers: number;
  superAdmins: number;
  freeTierMaxed: number;
  totalUsagesCount: number;
}

export function SuperAdminView({ adminEmail }: { adminEmail: string }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "PRO" | "FREE_USED" | "FREE_AVAILABLE" | "SUPER_ADMIN">("ALL");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [selectedUserForLogs, setSelectedUserForLogs] = useState<AdminUser | null>(null);
  const [paymentNoteModalUser, setPaymentNoteModalUser] = useState<AdminUser | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users?q=${encodeURIComponent(searchQuery)}&plan=${activeTab}`);
      if (!res.ok) {
        throw new Error("Failed to fetch admin users");
      }
      const data = await res.json();
      setUsers(data.users || []);
      setStats(data.stats || null);
    } catch (err: any) {
      console.error(err);
      setToastMessage({ type: "error", text: err.message || "Failed to load users" });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeTab]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const updateUser = async (userId: string, data: Partial<AdminUser>) => {
    try {
      setActionLoadingId(userId);
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...data }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Update failed");
      }

      showToast(resData.message || "User updated successfully");
      await fetchUsers();
    } catch (err: any) {
      showToast(err.message || "Action failed", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // 1-Click: Mark Payment as Done / Upgrade to PRO
  const handleUpgradeToPro = (user: AdminUser) => {
    updateUser(user.id, {
      role: "PRO",
      isPro: true,
      subscriptionStatus: "PRO",
      paymentNotes: user.paymentNotes || "Manual Super Admin Pro Activation (Payment Done)",
    });
  };

  // 1-Click: Downgrade user back to Free
  const handleDowngradeToFree = (user: AdminUser) => {
    updateUser(user.id, {
      role: "USER",
      isPro: false,
      subscriptionStatus: "FREE",
    });
  };

  // 1-Click: Reset Free Tier Trial (usageCount = 0)
  const handleResetFreeTrial = (user: AdminUser) => {
    updateUser(user.id, {
      usageCount: 0,
    });
  };

  // Toggle Super Admin role
  const handleToggleSuperAdmin = (user: AdminUser) => {
    const nextRole = user.role === "SUPER_ADMIN" ? "USER" : "SUPER_ADMIN";
    updateUser(user.id, {
      role: nextRole,
      isPro: nextRole === "SUPER_ADMIN",
      subscriptionStatus: nextRole === "SUPER_ADMIN" ? "PRO" : user.subscriptionStatus,
    });
  };

  // Save payment note
  const handleSavePaymentNote = async () => {
    if (!paymentNoteModalUser) return;
    await updateUser(paymentNoteModalUser.id, {
      paymentNotes: noteInput,
    });
    setPaymentNoteModalUser(null);
  };

  return (
    <div className="min-h-screen bg-surface-elevated/40 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-xl animate-slide-in ${
            toastMessage.type === "success"
              ? "bg-emerald-950 text-emerald-200 border-emerald-800"
              : "bg-rose-950 text-rose-200 border-rose-800"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-400" />
          )}
          <span className="text-xs font-semibold">{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-white/60 hover:text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Header bar */}
      <div className="bg-surface border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    Super Admin Dashboard
                    <Badge variant="warning" className="text-[10px] font-mono uppercase tracking-wider">
                      Live
                    </Badge>
                  </h1>
                  <p className="text-xs text-muted">
                    Logged in as <span className="font-semibold text-foreground">{adminEmail}</span> • Managing user subscriptions & usage
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchUsers()}
                className="flex items-center gap-1.5"
                disabled={loading}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </Button>

              <Link href="/tools/video-caption-generator">
                <Button variant="primary" size="sm" className="flex items-center gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>View Subtitle Generator</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* Metric Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-surface border border-border shadow-sm">
              <div className="flex items-center justify-between text-muted mb-2">
                <span className="text-xs font-medium">Total Users</span>
                <Users className="h-4 w-4 text-brand-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
                {stats.totalUsers}
              </div>
              <p className="text-[11px] text-muted mt-1">Registered Google/Dev accounts</p>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-brand-500/30 shadow-sm shadow-brand-500/5">
              <div className="flex items-center justify-between text-muted mb-2">
                <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">Pro Subscribers</span>
                <Sparkles className="h-4 w-4 text-brand-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-brand-600 dark:text-brand-400">
                {stats.proUsers}
              </div>
              <p className="text-[11px] text-muted mt-1">Payment Done / Unlimited Access</p>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-rose-500/30 shadow-sm shadow-rose-500/5">
              <div className="flex items-center justify-between text-muted mb-2">
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">1/1 Free Tier Used</span>
                <Lock className="h-4 w-4 text-rose-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400">
                {stats.freeTierMaxed}
              </div>
              <p className="text-[11px] text-muted mt-1">Upgrade Prompt Shown (Hot Leads)</p>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border shadow-sm">
              <div className="flex items-center justify-between text-muted mb-2">
                <span className="text-xs font-medium">Total Usages</span>
                <Zap className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
                {stats.totalUsagesCount}
              </div>
              <p className="text-[11px] text-muted mt-1">Recorded executions</p>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-amber-500/30 shadow-sm shadow-amber-500/5 col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between text-muted mb-2">
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Super Admins</span>
                <Crown className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                {stats.superAdmins}
              </div>
              <p className="text-[11px] text-muted mt-1">Full control permissions</p>
            </div>
          </div>
        )}

        {/* Filter Tabs & Search */}
        <div className="p-4 rounded-2xl bg-surface border border-border shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
              {[
                { id: "ALL", label: "All Users" },
                { id: "PRO", label: "Pro Members" },
                { id: "FREE_USED", label: "Free (Limit Reached)" },
                { id: "FREE_AVAILABLE", label: "Free (Credit Ready)" },
                { id: "SUPER_ADMIN", label: "Super Admins" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "bg-brand-600 text-white shadow-sm"
                      : "bg-surface-elevated text-muted hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Search email, name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-border bg-surface-elevated focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-2xl bg-surface border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-elevated border-b border-border text-muted uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Subtitle Credit (1 Free)</th>
                  <th className="py-3 px-4">Subscription</th>
                  <th className="py-3 px-4">Payment Note</th>
                  <th className="py-3 px-4">Registered</th>
                  <th className="py-3 px-4 text-right">Super Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading && users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted">
                      Loading users from database...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted">
                      No users match the search criteria.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const isLimitReached = !u.isPro && u.usageCount >= u.freeTierLimit;
                    const isActionLoading = actionLoadingId === u.id;

                    return (
                      <tr key={u.id} className="hover:bg-surface-elevated/50 transition-colors">
                        {/* User Identity */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {u.image ? (
                              <img
                                src={u.image}
                                alt={u.name || "User"}
                                className="h-8 w-8 rounded-full object-cover border border-border shrink-0"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {u.name?.[0]?.toUpperCase() || u.email[0]?.toUpperCase() || "U"}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground truncate">
                                {u.name || "Developer"}
                              </p>
                              <p className="text-[11px] text-muted truncate">{u.email}</p>
                              <p className="text-[10px] font-mono text-muted/70 truncate">{u.id}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {u.role === "SUPER_ADMIN" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                              <Crown className="h-3 w-3" />
                              SUPER ADMIN
                            </span>
                          ) : u.role === "PRO" || u.isPro ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-500/15 text-brand-600 dark:text-brand-400 border border-brand-500/30">
                              <Sparkles className="h-3 w-3" />
                              PRO
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-surface-elevated text-muted border border-border">
                              USER (Free)
                            </span>
                          )}
                        </td>

                        {/* Subtitle Free Tier Usage Meter */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {u.isPro ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Unlimited (Pro)
                            </span>
                          ) : isLimitReached ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                              <Lock className="h-3 w-3" />
                              {u.usageCount} / {u.freeTierLimit} (Used - Blocked)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                              <Zap className="h-3 w-3" />
                              {u.usageCount} / {u.freeTierLimit} (Available)
                            </span>
                          )}
                        </td>

                        {/* Subscription Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              u.subscriptionStatus === "PRO"
                                ? "bg-brand-500/15 text-brand-600 dark:text-brand-400"
                                : "bg-slate-500/15 text-slate-500"
                            }`}
                          >
                            {u.subscriptionStatus}
                          </span>
                        </td>

                        {/* Payment Note */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => {
                              setPaymentNoteModalUser(u);
                              setNoteInput(u.paymentNotes || "");
                            }}
                            className="text-[11px] text-muted hover:text-foreground text-left max-w-[150px] truncate block hover:underline"
                            title={u.paymentNotes || "Click to add payment note"}
                          >
                            {u.paymentNotes || <span className="italic text-muted/60">+ Add note</span>}
                          </button>
                        </td>

                        {/* Registered */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-muted text-[11px]">
                          {new Date(u.createdAt).toLocaleDateString()}
                          {u.totalToolUsages > 0 && (
                            <button
                              onClick={() => setSelectedUserForLogs(u)}
                              className="block text-[10px] text-brand-600 dark:text-brand-400 hover:underline mt-0.5"
                            >
                              {u.totalToolUsages} total usages (View)
                            </button>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Pro Upgrade / Downgrade Toggle */}
                            {!u.isPro ? (
                              <Button
                                size="sm"
                                variant="primary"
                                className="h-7 text-[11px] px-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white"
                                onClick={() => handleUpgradeToPro(u)}
                                disabled={isActionLoading}
                                title="Mark payment as done and give unlimited access"
                              >
                                <Sparkles className="h-3 w-3 mr-1" />
                                Payment Done (Upgrade Pro)
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[11px] px-2 text-rose-500 hover:bg-rose-500/10"
                                onClick={() => handleDowngradeToFree(u)}
                                disabled={isActionLoading}
                                title="Revert to Free Tier"
                              >
                                Revert Free
                              </Button>
                            )}

                            {/* Reset free trial usage */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-[11px] px-2"
                              onClick={() => handleResetFreeTrial(u)}
                              disabled={isActionLoading}
                              title="Reset usageCount to 0 (Give another free trial)"
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Reset Trial
                            </Button>

                            {/* Toggle Super Admin */}
                            <Button
                              size="sm"
                              variant="outline"
                              className={`h-7 text-[11px] px-2 ${
                                u.role === "SUPER_ADMIN" ? "text-amber-500" : "text-muted"
                              }`}
                              onClick={() => handleToggleSuperAdmin(u)}
                              disabled={isActionLoading}
                              title={u.role === "SUPER_ADMIN" ? "Remove Super Admin" : "Make Super Admin"}
                            >
                              <Crown className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tool Usage Logs Modal */}
      {selectedUserForLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-surface border border-border shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Tool Usage Logs: {selectedUserForLogs.email}
                </h3>
                <p className="text-xs text-muted">
                  Total executions: {selectedUserForLogs.totalToolUsages}
                </p>
              </div>
              <button
                onClick={() => setSelectedUserForLogs(null)}
                className="p-1 rounded-lg hover:bg-surface-elevated text-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {selectedUserForLogs.recentUsages.length === 0 ? (
                <p className="text-xs text-muted text-center py-6">No usage logs recorded yet.</p>
              ) : (
                selectedUserForLogs.recentUsages.map((log) => (
                  <div key={log.id} className="p-2.5 rounded-xl bg-surface-elevated border border-border text-xs flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{log.toolSlug}</p>
                      <p className="text-[10px] text-muted">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {log.metadata?.ip && (
                      <span className="text-[10px] font-mono text-muted">
                        IP: {log.metadata.ip}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setSelectedUserForLogs(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Note Modal */}
      {paymentNoteModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-surface border border-border shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground">
                Payment / Subscription Note
              </h3>
              <button
                onClick={() => setPaymentNoteModalUser(null)}
                className="p-1 rounded-lg hover:bg-surface-elevated text-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <p className="text-xs text-muted mb-2">
                User: <span className="font-semibold text-foreground">{paymentNoteModalUser.email}</span>
              </p>
              <textarea
                rows={3}
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="e.g. Paid $49 via Bank Transfer on 2026-11-16. Reference #TXN-90231"
                className="w-full p-2.5 text-xs rounded-xl border border-border bg-surface-elevated focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => setPaymentNoteModalUser(null)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={handleSavePaymentNote}>
                Save Note
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
