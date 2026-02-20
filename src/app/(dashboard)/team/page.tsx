'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useBarn } from '@/contexts/BarnContext';
import { toast } from '@/lib/toast';
import { csrfFetch } from '@/lib/fetch';
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  Copy,
  Check,
  Search,
  Crown,
  UserCog,
  User,
  X,
  Loader2,
  AlertCircle,
  Trash2,
  ChevronDown,
  Clock,
  CheckCircle,
  XCircle,
  Bell,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface TeamMember {
  id: string;
  role: string;
  status: string;
  joinedAt: string;
  approvedAt?: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    phone: string | null;
  };
}

const ROLES = [
  { id: 'OWNER', name: 'Owner', icon: Crown, color: 'bg-amber-100 text-amber-700', description: 'Full access to all features and settings' },
  { id: 'MANAGER', name: 'Manager', icon: UserCog, color: 'bg-blue-100 text-blue-700', description: 'Manage horses, events, team, billing, and clients' },
  { id: 'CARETAKER', name: 'Caretaker', icon: User, color: 'bg-green-100 text-green-700', description: 'Horse care, health records, events, and tasks' },
];

export default function TeamPage() {
  const { currentBarn } = useBarn();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [approveRole, setApproveRole] = useState('CARETAKER');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    variant: 'danger' | 'warning' | 'default';
    confirmLabel: string;
    onConfirm: () => void;
  }>({ open: false, title: '', description: '', variant: 'default', confirmLabel: 'Confirm', onConfirm: () => {} });

  useEffect(() => {
    if (currentBarn?.id) {
      fetchMembers();
    }
  }, [currentBarn?.id]);

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/barns/${currentBarn?.id}/members`);
      const result = await response.json();
      if (response.ok) {
        setMembers(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const approveMember = async (memberId: string, role: string) => {
    setIsUpdating(true);
    setError('');
    
    try {
      const response = await csrfFetch(`/api/barns/${currentBarn?.id}/members`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, role, action: 'approve' }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to approve member');
      }

      fetchMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve member');
    } finally {
      setIsUpdating(false);
    }
  };

  const rejectMember = (memberId: string) => {
    setConfirmDialog({
      open: true,
      title: 'Reject join request?',
      description: 'This person will not be added to your barn. They can request to join again later.',
      variant: 'danger',
      confirmLabel: 'Reject',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, open: false }));
        setIsUpdating(true);
        try {
          const response = await csrfFetch(`/api/barns/${currentBarn?.id}/members`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ memberId, action: 'reject' }),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || 'Failed to reject member');
          }

          fetchMembers();
        } catch (err) {
          toast.error('Rejection failed', err instanceof Error ? err.message : 'Failed to reject member');
        } finally {
          setIsUpdating(false);
        }
      },
    });
  };

  const updateMemberRole = async (memberId: string, newRole: string) => {
    setIsUpdating(true);
    setError('');
    
    try {
      const response = await csrfFetch(`/api/barns/${currentBarn?.id}/members`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, role: newRole }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update role');
      }

      setMembers(members.map(m => 
        m.id === memberId ? { ...m, role: newRole } : m
      ));
      setShowRoleModal(false);
      setSelectedMember(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setIsUpdating(false);
    }
  };

  const removeMember = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    const memberName = member ? getMemberName(member) : 'this member';
    setConfirmDialog({
      open: true,
      title: `Remove ${memberName}?`,
      description: `${memberName} will lose access to this barn and all its data. This action cannot be undone.`,
      variant: 'danger',
      confirmLabel: 'Remove',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, open: false }));
        try {
          const response = await csrfFetch(`/api/barns/${currentBarn?.id}/members?memberId=${memberId}`, {
            method: 'DELETE',
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || 'Failed to remove member');
          }

          setMembers(members.filter(m => m.id !== memberId));
          setShowRoleModal(false);
          setSelectedMember(null);
          toast.success('Member removed');
        } catch (err) {
          toast.error('Removal failed', err instanceof Error ? err.message : 'Failed to remove member');
        }
      },
    });
  };

  const pendingMembers = members.filter(m => m.status === 'PENDING');
  const activeMembers = members.filter(m => m.status === 'ACTIVE');

  const filteredActiveMembers = activeMembers.filter((member) => {
    const fullName = `${member.user.firstName || ''} ${member.user.lastName || ''}`.toLowerCase();
    const email = member.user.email.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  const copyInviteCode = () => {
    navigator.clipboard.writeText(currentBarn?.inviteCode || '');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getRoleInfo = (roleId: string) => {
    return ROLES.find(r => r.id === roleId) || ROLES[2];
  };

  const getMemberName = (member: TeamMember) => {
    if (member.user.firstName || member.user.lastName) {
      return `${member.user.firstName || ''} ${member.user.lastName || ''}`.trim();
    }
    return member.user.email.split('@')[0];
  };

  if (!currentBarn) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please select a barn first</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team</h1>
          <p className="text-muted-foreground mt-1">Manage barn members and permissions</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {/* Pending Approvals */}
      {pendingMembers.length > 0 && (
        <div className="card p-6 border-amber-200 bg-amber-50">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-amber-600" />
            <h2 className="font-semibold text-amber-900">
              Pending Approval ({pendingMembers.length})
            </h2>
          </div>
          <div className="space-y-3">
            {pendingMembers.map((member) => (
              <div
                key={member.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-card rounded-xl border border-amber-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{getMemberName(member)}</p>
                    <p className="text-sm text-muted-foreground">{member.user.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Requested {new Date(member.joinedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={approveRole}
                    onChange={(e) => setApproveRole(e.target.value)}
                    className="input text-sm py-2"
                  >
                    {ROLES.filter(r => r.id !== 'OWNER').map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => approveMember(member.id, approveRole)}
                    disabled={isUpdating}
                    className="btn-primary flex items-center gap-1 py-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => rejectMember(member.id)}
                    disabled={isUpdating}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 border border-red-200"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Code Card */}
      <div className="card p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-foreground">Barn Invite Code</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Share this code with people you want to invite. You'll need to approve their request.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <code className="px-4 py-2 bg-card rounded-lg font-mono text-lg font-semibold text-amber-700 border border-amber-200">
              {currentBarn.inviteCode}
            </code>
            <button
              onClick={copyInviteCode}
              className="p-2 rounded-lg bg-card border border-amber-200 text-amber-700 hover:bg-amber-50 transition-all"
            >
              {copiedCode ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search team members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input pl-12 w-full max-w-md"
        />
      </div>

      {/* Active Team Members */}
      <div>
        <h2 className="font-semibold text-foreground mb-4">
          Active Members ({activeMembers.length})
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActiveMembers.map((member) => {
            const roleInfo = getRoleInfo(member.role);
            const RoleIcon = roleInfo.icon;
            
            return (
              <div key={member.id} className="card p-6 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {member.user.avatarUrl ? (
                        <Image src={member.user.avatarUrl} alt="" fill className="object-cover" unoptimized />
                      ) : (
                        <span className="text-muted-foreground text-lg font-medium">
                          {(member.user.firstName?.[0] || member.user.email[0]).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{getMemberName(member)}</h3>
                      <button
                        onClick={() => {
                          setSelectedMember(member);
                          setShowRoleModal(true);
                        }}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${roleInfo.color} hover:opacity-80 transition-opacity`}
                      >
                        <RoleIcon className="w-3 h-3" />
                        {roleInfo.name}
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    {member.user.email}
                  </div>
                  {member.user.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      {member.user.phone}
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Joined {new Date(member.approvedAt || member.joinedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {filteredActiveMembers.length === 0 && (
          <div className="card p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="font-medium text-muted-foreground">
              {searchQuery ? 'No team members found' : 'No team members yet'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery ? 'Try a different search term.' : 'Invite someone to help manage your barn.'}
            </p>
          </div>
        )}
      </div>

      {/* Role Permissions Info */}
      <div className="card p-6">
        <h3 className="font-semibold text-foreground mb-4">Role Permissions</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ROLES.map((role) => {
            const RoleIcon = role.icon;
            
            return (
              <div key={role.id} className="p-4 rounded-xl bg-background">
                <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-lg text-sm font-medium ${role.color} mb-2`}>
                  <RoleIcon className="w-4 h-4" />
                  {role.name}
                </div>
                <p className="text-sm text-muted-foreground">{role.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Role Change Modal */}
      {showRoleModal && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Change Role</h3>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedMember(null);
                  setError('');
                }}
                className="p-2 hover:bg-accent rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Change role for{' '}
              <span className="font-medium">{getMemberName(selectedMember)}</span>
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="space-y-2 mb-6">
              {ROLES.map((role) => {
                const RoleIcon = role.icon;
                const isSelected = selectedMember.role === role.id;
                
                return (
                  <button
                    key={role.id}
                    onClick={() => !isSelected && updateMemberRole(selectedMember.id, role.id)}
                    disabled={isUpdating}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-border hover:border-border hover:bg-accent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${role.color}`}>
                        <RoleIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{role.name}</p>
                        <p className="text-xs text-muted-foreground">{role.description}</p>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-amber-500" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Remove Member Button */}
            <button
              onClick={() => removeMember(selectedMember.id)}
              className="w-full p-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center gap-2 font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Remove from Barn
            </button>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteModal
          barnId={currentBarn.id}
          inviteCode={currentBarn.inviteCode}
          onClose={() => setShowInviteModal(false)}
          onInvited={fetchMembers}
        />
      )}

      <ConfirmDialog
        open={confirmDialog.open}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        confirmLabel={confirmDialog.confirmLabel}
      />
    </div>
  );
}

function InviteModal({
  barnId,
  inviteCode,
  onClose,
  onInvited,
}: {
  barnId: string;
  inviteCode: string;
  onClose: () => void;
  onInvited: () => void;
}) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('CARETAKER');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await csrfFetch(`/api/barns/${barnId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, lastName, role }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to invite member');
      }

      onInvited();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite member');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Invite Team Member</h3>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share Code Option */}
        <div className="mb-6 p-4 bg-background rounded-xl">
          <p className="text-sm font-medium text-muted-foreground mb-2">Option 1: Share Invite Code</p>
          <p className="text-xs text-muted-foreground mb-3">
            They'll request to join and you can approve with a role:
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-4 py-2 bg-card rounded-lg font-mono text-lg font-semibold text-center border border-border">
              {inviteCode}
            </code>
            <button onClick={copyInviteCode} className="btn-secondary p-2">
              {copiedCode ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Direct Invite Option */}
        <form onSubmit={handleInvite}>
          <p className="text-sm font-medium text-muted-foreground mb-3">Option 2: Add Directly (No Approval)</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full"
                placeholder="member@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input w-full"
              >
                {ROLES.filter(r => r.id !== 'OWNER').map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} - {r.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Add Member
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
