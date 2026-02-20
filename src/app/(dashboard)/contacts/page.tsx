'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useBarn } from '@/contexts/BarnContext';
import {
  Plus,
  Search,
  Mail,
  Phone,
  X,
  Loader2,
  AlertCircle,
  BookUser,
  Pencil,
  Trash2,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface Horse {
  horse: {
    id: string;
    barnName: string;
    profilePhotoUrl?: string;
  };
  isPrimary: boolean;
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
  horses: Horse[];
  createdAt: string;
}

interface AvailableHorse {
  id: string;
  barnName: string;
  profilePhotoUrl?: string;
}

const ROLE_SUGGESTIONS = [
  'Farrier',
  'Veterinarian',
  'Boarder',
  'Trainer',
  'Owner',
  'Barn Manager',
  'Feed Supplier',
  'Equine Dentist',
  'Barn Staff',
];

function parseRole(notes?: string): { role: string; additionalNotes: string } {
  if (!notes) return { role: '', additionalNotes: '' };
  const firstNewline = notes.indexOf('\n');
  if (firstNewline === -1) return { role: notes, additionalNotes: '' };
  return {
    role: notes.substring(0, firstNewline),
    additionalNotes: notes.substring(firstNewline + 1),
  };
}

function combineRoleAndNotes(role: string, additionalNotes: string): string {
  const r = role.trim();
  const n = additionalNotes.trim();
  if (r && n) return `${r}\n${n}`;
  return r || n;
}

export default function ContactsPage() {
  const { currentBarn } = useBarn();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [horses, setHorses] = useState<AvailableHorse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
    if (currentBarn?.id) {
      fetchContacts();
      fetchHorses();
    }
  }, [currentBarn?.id]);

  const fetchContacts = async () => {
    try {
      const response = await fetch(`/api/barns/${currentBarn?.id}/clients`);
      const result = await response.json();
      if (response.ok) {
        const data = result.data || [];
        setContacts(data);
        if (selectedContact) {
          const updated = data.find((c: Contact) => c.id === selectedContact.id);
          if (updated) setSelectedContact(updated);
        }
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHorses = async () => {
    try {
      const response = await fetch(`/api/barns/${currentBarn?.id}/horses`);
      const result = await response.json();
      if (response.ok) {
        setHorses(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching horses:', error);
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const searchLower = searchQuery.toLowerCase();
    const { role } = parseRole(contact.notes);
    return (
      contact.firstName.toLowerCase().includes(searchLower) ||
      contact.lastName.toLowerCase().includes(searchLower) ||
      (contact.email?.toLowerCase().includes(searchLower) ?? false) ||
      (contact.phone?.includes(searchLower) ?? false) ||
      role.toLowerCase().includes(searchLower) ||
      contact.horses.some(h => h.horse.barnName.toLowerCase().includes(searchLower))
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
          <p className="text-muted-foreground">Your farm&apos;s contact book</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary btn-md"
        >
          <Plus className="w-5 h-5" />
          Add Contact
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name, role, phone, email, or horse..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input w-full pl-10"
        />
      </div>

      {/* Contact Grid */}
      {filteredContacts.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <BookUser className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchQuery ? 'No contacts found' : 'No contacts yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? 'Try adjusting your search'
              : 'Add your farrier, vet, boarders, and other contacts'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary btn-md"
            >
              <Plus className="w-5 h-5" />
              Add Contact
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact) => {
            const { role } = parseRole(contact.notes);
            return (
              <button
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className="bg-card rounded-xl border border-border p-4 text-left hover:border-primary/40 hover:shadow-sm transition-all"
              >
                {/* Name & Role */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-primary">
                      {contact.firstName[0]}{contact.lastName[0]}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">
                      {contact.firstName} {contact.lastName}
                    </p>
                    {role && (
                      <p className="text-sm text-muted-foreground truncate">{role}</p>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-1.5 mb-3">
                  {contact.phone && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2 truncate">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                      {contact.phone}
                    </p>
                  )}
                  {contact.email && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                      {contact.email}
                    </p>
                  )}
                </div>

                {/* Linked Horses */}
                {contact.horses.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {contact.horses.map((h) => (
                      <span
                        key={h.horse.id}
                        className="inline-flex items-center px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full"
                      >
                        {h.horse.barnName}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddModal && (
        <AddContactModal
          barnId={currentBarn?.id || ''}
          horses={horses}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchContacts();
          }}
        />
      )}

      {/* Contact Details Modal */}
      {selectedContact && (
        <ContactDetailsModal
          contact={selectedContact}
          barnId={currentBarn?.id || ''}
          horses={horses}
          onClose={() => setSelectedContact(null)}
          onUpdate={fetchContacts}
        />
      )}
    </div>
  );
}

// Role autocomplete input
function RoleInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState(ROLE_SUGGESTIONS);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) {
      setFilteredSuggestions(
        ROLE_SUGGESTIONS.filter(s => s.toLowerCase().includes(value.toLowerCase()))
      );
    } else {
      setFilteredSuggestions(ROLE_SUGGESTIONS);
    }
  }, [value]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        className="input w-full"
        placeholder="e.g. Farrier, Vet, Boarder"
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-lg shadow-lg border border-border z-10 max-h-40 overflow-y-auto">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(suggestion);
                setShowSuggestions(false);
                inputRef.current?.blur();
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted text-foreground"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Add Contact Modal
function AddContactModal({
  barnId,
  horses,
  onClose,
  onSuccess,
}: {
  barnId: string;
  horses: AvailableHorse[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    role: '',
    phone: '',
    email: '',
    horseIds: [] as string[],
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/barns/${barnId}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          horseIds: formData.horseIds,
          notes: combineRoleAndNotes(formData.role, formData.notes),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to add contact');
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add contact');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleHorse = (horseId: string) => {
    setFormData(prev => ({
      ...prev,
      horseIds: prev.horseIds.includes(horseId)
        ? prev.horseIds.filter(id => id !== horseId)
        : [...prev.horseIds, horseId],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Add Contact</h2>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="input w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Role / Title
            </label>
            <RoleInput
              value={formData.role}
              onChange={(val) => setFormData({ ...formData, role: val })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input w-full"
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input w-full"
              placeholder="Optional"
            />
          </div>

          {/* Assign Horses */}
          {horses.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Linked Horses
              </label>
              <div className="flex flex-wrap gap-2">
                {horses.map((horse) => (
                  <button
                    key={horse.id}
                    type="button"
                    onClick={() => toggleHorse(horse.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      formData.horseIds.includes(horse.id)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    {horse.barnName}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="input w-full"
              placeholder="Any additional notes..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary btn-md flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary btn-md flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Contact'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Contact Details Modal
function ContactDetailsModal({
  contact,
  barnId,
  horses,
  onClose,
  onUpdate,
}: {
  contact: Contact;
  barnId: string;
  horses: AvailableHorse[];
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const { role, additionalNotes } = parseRole(contact.notes);

  const [formData, setFormData] = useState({
    firstName: contact.firstName,
    lastName: contact.lastName,
    role: role,
    phone: contact.phone || '',
    email: contact.email || '',
    horseIds: contact.horses.map(h => h.horse.id),
    notes: additionalNotes,
  });

  // Reset form when contact changes
  useEffect(() => {
    const parsed = parseRole(contact.notes);
    setFormData({
      firstName: contact.firstName,
      lastName: contact.lastName,
      role: parsed.role,
      phone: contact.phone || '',
      email: contact.email || '',
      horseIds: contact.horses.map(h => h.horse.id),
      notes: parsed.additionalNotes,
    });
  }, [contact]);

  const handleSave = async () => {
    setIsSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/barns/${barnId}/clients`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: contact.id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          horseIds: formData.horseIds,
          notes: combineRoleAndNotes(formData.role, formData.notes),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update contact');
      }
      setIsEditing(false);
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update contact');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/barns/${barnId}/clients?id=${contact.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to delete contact');
      }
      onClose();
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete contact');
      setIsDeleting(false);
    }
  };

  const toggleHorse = (horseId: string) => {
    setFormData(prev => ({
      ...prev,
      horseIds: prev.horseIds.includes(horseId)
        ? prev.horseIds.filter(id => id !== horseId)
        : [...prev.horseIds, horseId],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {isEditing ? 'Edit Contact' : 'Contact Details'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {isEditing ? (
            /* Edit Mode */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Role / Title
                </label>
                <RoleInput
                  value={formData.role}
                  onChange={(val) => setFormData({ ...formData, role: val })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input w-full"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input w-full"
                />
              </div>

              {horses.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Linked Horses
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {horses.map((horse) => (
                      <button
                        key={horse.id}
                        type="button"
                        onClick={() => toggleHorse(horse.id)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          formData.horseIds.includes(horse.id)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-accent'
                        }`}
                      >
                        {horse.barnName}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="input w-full"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary btn-md flex-1"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving || !formData.firstName || !formData.lastName}
                  className="btn-primary btn-md flex-1"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <>
              {/* Name & Role */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-semibold text-primary">
                    {contact.firstName[0]}{contact.lastName[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {contact.firstName} {contact.lastName}
                  </h3>
                  {role && (
                    <p className="text-muted-foreground">{role}</p>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-background hover:bg-muted transition-colors"
                  >
                    <Phone className="w-4 h-4 text-primary" />
                    <span className="text-foreground">{contact.phone}</span>
                  </a>
                )}
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-background hover:bg-muted transition-colors"
                  >
                    <Mail className="w-4 h-4 text-primary" />
                    <span className="text-foreground">{contact.email}</span>
                  </a>
                )}
                {!contact.phone && !contact.email && (
                  <p className="text-sm text-muted-foreground italic">No contact info on file</p>
                )}
              </div>

              {/* Horses */}
              {contact.horses.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Linked Horses</h4>
                  <div className="flex flex-wrap gap-2">
                    {contact.horses.map((h) => (
                      <span
                        key={h.horse.id}
                        className="inline-flex items-center px-3 py-1 bg-muted text-foreground text-sm rounded-full"
                      >
                        {h.horse.barnName}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {additionalNotes && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Notes</h4>
                  <p className="text-sm text-muted-foreground bg-background p-3 rounded-lg whitespace-pre-wrap">
                    {additionalNotes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-secondary btn-md flex-1"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                  className="btn-secondary btn-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        title="Delete contact?"
        description={`${contact.firstName} ${contact.lastName} will be permanently removed from your contacts. This cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
      />
    </div>
  );
}
