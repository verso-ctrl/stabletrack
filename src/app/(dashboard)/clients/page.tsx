'use client';

import React, { useState, useEffect } from 'react';
import { useBarn } from '@/contexts/BarnContext';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  MoreVertical,
  DollarSign,
  X,
  Loader2,
  AlertCircle,
  Check,
  User,
  Copy,
} from 'lucide-react';

interface Horse {
  horse: {
    id: string;
    barnName: string;
    profilePhotoUrl?: string;
  };
  isPrimary: boolean;
}

interface Client {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  portalEnabled: boolean;
  portalToken?: string;
  notes?: string;
  horses: Horse[];
  balance: number;
  _count: {
    invoices: number;
  };
  createdAt: string;
}

interface AvailableHorse {
  id: string;
  barnName: string;
  profilePhotoUrl?: string;
}

export default function ClientsPage() {
  const { currentBarn } = useBarn();
  const [clients, setClients] = useState<Client[]>([]);
  const [horses, setHorses] = useState<AvailableHorse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    if (currentBarn?.id) {
      fetchClients();
      fetchHorses();
    }
  }, [currentBarn?.id]);

  const fetchClients = async () => {
    try {
      const response = await fetch(`/api/barns/${currentBarn?.id}/clients`);
      const result = await response.json();
      if (response.ok) {
        setClients(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
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

  const filteredClients = clients.filter(client => {
    const searchLower = searchQuery.toLowerCase();
    return (
      client.firstName.toLowerCase().includes(searchLower) ||
      client.lastName.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower) ||
      client.horses.some(h => h.horse.barnName.toLowerCase().includes(searchLower))
    );
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Clients</h1>
          <p className="text-stone-500">Manage horse owners and billing</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Client
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
        <input
          type="text"
          placeholder="Search clients by name, email, or horse..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{clients.length}</p>
              <p className="text-sm text-stone-500">Total Clients</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">
                {clients.filter(c => c.portalEnabled).length}
              </p>
              <p className="text-sm text-stone-500">Portal Enabled</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">
                {formatCurrency(clients.reduce((sum, c) => sum + c.balance, 0))}
              </p>
              <p className="text-sm text-stone-500">Outstanding Balance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Client List */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <Users className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-stone-900 mb-2">
            {searchQuery ? 'No clients found' : 'No clients yet'}
          </h3>
          <p className="text-stone-500 mb-4">
            {searchQuery
              ? 'Try adjusting your search'
              : 'Add your first client to start managing owners and billing'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Client
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-stone-600">Client</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-stone-600">Contact</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-stone-600">Horses</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-stone-600">Balance</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-stone-600">Portal</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-stone-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center">
                          <User className="w-5 h-5 text-stone-500" />
                        </div>
                        <div>
                          <p className="font-medium text-stone-900">
                            {client.firstName} {client.lastName}
                          </p>
                          <p className="text-sm text-stone-500">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {client.phone && (
                          <p className="text-sm text-stone-600 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {client.phone}
                          </p>
                        )}
                        {client.city && client.state && (
                          <p className="text-sm text-stone-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {client.city}, {client.state}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {client.horses.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {client.horses.map((h) => (
                            <span
                              key={h.horse.id}
                              className="inline-flex items-center px-2 py-1 bg-stone-100 text-stone-700 text-xs rounded-full"
                            >
                              {h.horse.barnName}
                              {h.isPrimary && <span className="ml-1 text-amber-500">★</span>}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-stone-400">No horses assigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${client.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(client.balance)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {client.portalEnabled ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          <Check className="w-3 h-3" />
                          Enabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 bg-stone-100 text-stone-500 text-xs rounded-full">
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedClient(client)}
                        className="p-2 hover:bg-stone-100 rounded-lg text-stone-500 hover:text-stone-700"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <AddClientModal
          barnId={currentBarn?.id || ''}
          horses={horses}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchClients();
          }}
        />
      )}

      {/* Client Details Modal */}
      {selectedClient && (
        <ClientDetailsModal
          client={selectedClient}
          barnId={currentBarn?.id || ''}
          onClose={() => setSelectedClient(null)}
          onUpdate={fetchClients}
        />
      )}
    </div>
  );
}

// Add Client Modal Component
function AddClientModal({
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
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    portalEnabled: false,
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
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create client');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create client');
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
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-stone-200">
          <h2 className="text-lg font-semibold text-stone-900">Add New Client</h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-3">
              <label className="block text-sm font-medium text-stone-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-stone-700 mb-1">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                maxLength={2}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-1">ZIP</label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Assign Horses */}
          {horses.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Assign Horses
              </label>
              <div className="flex flex-wrap gap-2">
                {horses.map((horse) => (
                  <button
                    key={horse.id}
                    type="button"
                    onClick={() => toggleHorse(horse.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      formData.horseIds.includes(horse.id)
                        ? 'bg-amber-500 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {horse.barnName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Portal Access */}
          <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
            <input
              type="checkbox"
              id="portalEnabled"
              checked={formData.portalEnabled}
              onChange={(e) => setFormData({ ...formData, portalEnabled: e.target.checked })}
              className="w-4 h-4 text-amber-500 focus:ring-amber-500 border-stone-300 rounded"
            />
            <label htmlFor="portalEnabled" className="text-sm">
              <span className="font-medium text-stone-900">Enable Client Portal</span>
              <p className="text-stone-500">Allow client to view horses, invoices, and events online</p>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Any additional notes about this client..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Add Client'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Client Details Modal
function ClientDetailsModal({
  client,
  barnId,
  onClose,
  onUpdate,
}: {
  client: Client;
  barnId: string;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const portalUrl = client.portalToken
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/portal?token=${client.portalToken}`
    : null;

  const copyPortalLink = () => {
    if (portalUrl) {
      navigator.clipboard.writeText(portalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-stone-200">
          <h2 className="text-lg font-semibold text-stone-900">Client Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Client Info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-stone-200 flex items-center justify-center">
              <User className="w-8 h-8 text-stone-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-stone-900">
                {client.firstName} {client.lastName}
              </h3>
              <p className="text-stone-500">{client.email}</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            {client.phone && (
              <div className="flex items-center gap-2 text-stone-600">
                <Phone className="w-4 h-4" />
                <a href={`tel:${client.phone}`} className="hover:text-amber-600">
                  {client.phone}
                </a>
              </div>
            )}
            {client.address && (
              <div className="flex items-start gap-2 text-stone-600">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>
                  {client.address}
                  {client.city && `, ${client.city}`}
                  {client.state && `, ${client.state}`}
                  {client.zipCode && ` ${client.zipCode}`}
                </span>
              </div>
            )}
          </div>

          {/* Horses */}
          {client.horses.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-stone-700 mb-2">Assigned Horses</h4>
              <div className="flex flex-wrap gap-2">
                {client.horses.map((h) => (
                  <span
                    key={h.horse.id}
                    className="inline-flex items-center px-3 py-1 bg-stone-100 text-stone-700 text-sm rounded-full"
                  >
                    {h.horse.barnName}
                    {h.isPrimary && <span className="ml-1 text-amber-500">★</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-stone-50 rounded-lg">
              <p className="text-sm text-stone-500">Outstanding Balance</p>
              <p className={`text-lg font-semibold ${client.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ${client.balance.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-stone-50 rounded-lg">
              <p className="text-sm text-stone-500">Total Invoices</p>
              <p className="text-lg font-semibold text-stone-900">{client._count.invoices}</p>
            </div>
          </div>

          {/* Portal Link */}
          {client.portalEnabled && portalUrl && (
            <div className="p-3 bg-amber-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-amber-900">Client Portal Link</span>
                <button
                  onClick={copyPortalLink}
                  className="text-sm text-amber-700 hover:text-amber-800 flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-amber-700 break-all">{portalUrl}</p>
            </div>
          )}

          {/* Notes */}
          {client.notes && (
            <div>
              <h4 className="text-sm font-medium text-stone-700 mb-1">Notes</h4>
              <p className="text-sm text-stone-600 bg-stone-50 p-3 rounded-lg">{client.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 font-medium"
            >
              Close
            </button>
            <a
              href={`mailto:${client.email}`}
              className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium text-center flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Email Client
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
