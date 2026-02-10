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
  CreditCard,
  Trash2,
  Shield,
  Building,
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
  // Payment method fields
  stripePaymentMethodId?: string;
  paymentMethodType?: string;
  paymentMethodLast4?: string;
  paymentMethodBrand?: string;
  paymentConsentGiven?: boolean;
  paymentConsentDate?: string;
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
        const data = result.data || [];
        setClients(data);
        // Update selectedClient if it's open so modal reflects changes
        if (selectedClient) {
          const updated = data.find((c: Client) => c.id === selectedClient.id);
          if (updated) setSelectedClient(updated);
        }
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
          <h1 className="text-2xl font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground">Manage horse owners and billing</p>
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search clients by name, email, or horse..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{clients.length}</p>
              <p className="text-sm text-muted-foreground">Total Clients</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {clients.filter(c => c.portalEnabled).length}
              </p>
              <p className="text-sm text-muted-foreground">Portal Enabled</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(clients.reduce((sum, c) => sum + c.balance, 0))}
              </p>
              <p className="text-sm text-muted-foreground">Outstanding Balance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Client List */}
      {filteredClients.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchQuery ? 'No clients found' : 'No clients yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
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
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Client</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Contact</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Horses</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Balance</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Portal</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-accent">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {client.firstName} {client.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {client.phone && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {client.phone}
                          </p>
                        )}
                        {client.city && client.state && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
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
                              className="inline-flex items-center px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full"
                            >
                              {h.horse.barnName}
                              {h.isPrimary && <span className="ml-1 text-amber-500">★</span>}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No horses assigned</span>
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
                        <span className="inline-flex items-center px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedClient(client)}
                        className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-muted-foreground"
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
      <div className="bg-card rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Add New Client</h2>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg">
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
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-3">
              <label className="block text-sm font-medium text-muted-foreground mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-muted-foreground mb-1">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                maxLength={2}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-muted-foreground mb-1">ZIP</label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Assign Horses */}
          {horses.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
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
                        : 'bg-muted text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    {horse.barnName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Portal Access */}
          <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
            <input
              type="checkbox"
              id="portalEnabled"
              checked={formData.portalEnabled}
              onChange={(e) => setFormData({ ...formData, portalEnabled: e.target.checked })}
              className="w-4 h-4 text-amber-500 focus:ring-amber-500 border-border rounded"
            />
            <label htmlFor="portalEnabled" className="text-sm">
              <span className="font-medium text-foreground">Enable Client Portal</span>
              <p className="text-muted-foreground">Allow client to view horses, invoices, and events online</p>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Any additional notes about this client..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-accent font-medium"
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
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentRemoving, setPaymentRemoving] = useState(false);
  const [showRemovePaymentConfirm, setShowRemovePaymentConfirm] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentForm, setPaymentForm] = useState({
    type: 'card' as 'card' | 'us_bank_account',
    cardNumber: '',
    last4: '',
    brand: '',
    consentGiven: false,
  });

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

  const hasPaymentMethod = !!client.stripePaymentMethodId;

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');
    setPaymentSaving(true);

    try {
      if (!paymentForm.consentGiven) {
        throw new Error('Client consent is required to store payment information');
      }

      // Extract last 4 digits and brand from the mock card/bank number
      let last4 = paymentForm.last4;
      let brand = paymentForm.brand;

      if (paymentForm.type === 'card') {
        // Auto-detect last4 from card number input
        const digits = paymentForm.cardNumber.replace(/\D/g, '');
        if (digits.length < 4) {
          throw new Error('Please enter a valid card number');
        }
        last4 = digits.slice(-4);
        // Detect brand from first digit
        const first = digits[0];
        if (first === '4') brand = 'Visa';
        else if (first === '5') brand = 'Mastercard';
        else if (first === '3') brand = 'Amex';
        else if (first === '6') brand = 'Discover';
        else brand = 'Card';
      } else {
        const digits = paymentForm.cardNumber.replace(/\D/g, '');
        if (digits.length < 4) {
          throw new Error('Please enter a valid account number');
        }
        last4 = digits.slice(-4);
        brand = 'Bank Account';
      }

      // In test mode, generate a mock Stripe payment method ID
      const mockPaymentMethodId = `pm_test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      const response = await fetch(
        `/api/barns/${barnId}/clients/${client.id}/payment-method`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentMethodId: mockPaymentMethodId,
            paymentMethodType: paymentForm.type,
            paymentMethodLast4: last4,
            paymentMethodBrand: brand,
            consentGiven: paymentForm.consentGiven,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save payment method');
      }

      setShowPaymentForm(false);
      setPaymentForm({ type: 'card', cardNumber: '', last4: '', brand: '', consentGiven: false });
      onUpdate();
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Failed to save payment method');
    } finally {
      setPaymentSaving(false);
    }
  };

  const handleRemovePaymentClick = () => {
    setShowRemovePaymentConfirm(true);
  };

  const handleRemovePayment = async () => {
    setShowRemovePaymentConfirm(false);
    setPaymentRemoving(true);

    try {
      const response = await fetch(
        `/api/barns/${barnId}/clients/${client.id}/payment-method`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to remove payment method');
      }

      onUpdate();
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Failed to remove payment method');
    } finally {
      setPaymentRemoving(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (paymentForm.type === 'card') {
      // Format as groups of 4
      const groups = digits.match(/.{1,4}/g);
      return groups ? groups.join(' ') : digits;
    }
    return digits;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Client Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Client Info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                {client.firstName} {client.lastName}
              </h3>
              <p className="text-muted-foreground">{client.email}</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            {client.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <a href={`tel:${client.phone}`} className="hover:text-amber-600">
                  {client.phone}
                </a>
              </div>
            )}
            {client.address && (
              <div className="flex items-start gap-2 text-muted-foreground">
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
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Assigned Horses</h4>
              <div className="flex flex-wrap gap-2">
                {client.horses.map((h) => (
                  <span
                    key={h.horse.id}
                    className="inline-flex items-center px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full"
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
            <div className="p-3 bg-background rounded-lg">
              <p className="text-sm text-muted-foreground">Outstanding Balance</p>
              <p className={`text-lg font-semibold ${client.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ${client.balance.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-background rounded-lg">
              <p className="text-sm text-muted-foreground">Total Invoices</p>
              <p className="text-lg font-semibold text-foreground">{client._count.invoices}</p>
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-3 bg-background">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <h4 className="text-sm font-medium text-foreground">Payment Method</h4>
              </div>
              {hasPaymentMethod && !showPaymentForm && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowPaymentForm(true)}
                    className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                  >
                    Update
                  </button>
                  <span className="text-muted-foreground">|</span>
                  <button
                    onClick={handleRemovePaymentClick}
                    disabled={paymentRemoving}
                    className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                  >
                    {paymentRemoving ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div className="p-3">
              {paymentError && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  {paymentError}
                </div>
              )}

              {hasPaymentMethod && !showPaymentForm ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    {client.paymentMethodType === 'card' ? (
                      <CreditCard className="w-8 h-8 text-muted-foreground" />
                    ) : (
                      <Building className="w-8 h-8 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium text-foreground">
                        {client.paymentMethodBrand || (client.paymentMethodType === 'card' ? 'Card' : 'Bank Account')}
                        {' '}ending in {client.paymentMethodLast4}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {client.paymentMethodType === 'card' ? 'Credit/Debit Card' : 'ACH Bank Account'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <Shield className="w-3 h-3" />
                    <span>
                      Consent given
                      {client.paymentConsentDate && (
                        <> on {new Date(client.paymentConsentDate).toLocaleDateString()}</>
                      )}
                    </span>
                  </div>
                </div>
              ) : !showPaymentForm ? (
                <div className="text-center py-2">
                  <p className="text-sm text-muted-foreground mb-2">No payment method on file</p>
                  <button
                    onClick={() => setShowPaymentForm(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add Payment Method
                  </button>
                </div>
              ) : null}

              {/* Add/Update Payment Method Form */}
              {showPaymentForm && (
                <form onSubmit={handleAddPayment} className="space-y-3">
                  {/* Payment Type */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Payment Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentForm(prev => ({ ...prev, type: 'card', cardNumber: '', brand: '' }))}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-sm ${
                          paymentForm.type === 'card'
                            ? 'border-amber-500 bg-amber-50 text-amber-700'
                            : 'border-border text-muted-foreground hover:bg-accent'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentForm(prev => ({ ...prev, type: 'us_bank_account', cardNumber: '', brand: '' }))}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-sm ${
                          paymentForm.type === 'us_bank_account'
                            ? 'border-amber-500 bg-amber-50 text-amber-700'
                            : 'border-border text-muted-foreground hover:bg-accent'
                        }`}
                      >
                        <Building className="w-4 h-4" />
                        Bank Account
                      </button>
                    </div>
                  </div>

                  {/* Card/Account Number */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      {paymentForm.type === 'card' ? 'Card Number' : 'Account Number'}
                    </label>
                    <input
                      type="text"
                      value={formatCardNumber(paymentForm.cardNumber)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        setPaymentForm(prev => ({ ...prev, cardNumber: raw }));
                      }}
                      placeholder={paymentForm.type === 'card' ? '4242 4242 4242 4242' : '000123456789'}
                      maxLength={paymentForm.type === 'card' ? 19 : 17}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {paymentForm.type === 'card'
                        ? 'Test mode: use 4242424242424242 for Visa'
                        : 'Test mode: enter any account number'}
                    </p>
                  </div>

                  {/* Consent Checkbox */}
                  <div className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border">
                    <input
                      type="checkbox"
                      id="paymentConsent"
                      checked={paymentForm.consentGiven}
                      onChange={(e) =>
                        setPaymentForm(prev => ({ ...prev, consentGiven: e.target.checked }))
                      }
                      className="w-4 h-4 mt-0.5 text-amber-500 focus:ring-amber-500 border-border rounded"
                      required
                    />
                    <label htmlFor="paymentConsent" className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Client has authorized storing payment information on file.</span>
                      {' '}Payment details are tokenized and securely stored via Stripe. Raw card or account numbers are never saved.
                    </label>
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPaymentForm(false);
                        setPaymentError('');
                        setPaymentForm({ type: 'card', cardNumber: '', last4: '', brand: '', consentGiven: false });
                      }}
                      className="flex-1 px-3 py-1.5 border border-border rounded-lg text-sm text-muted-foreground hover:bg-accent"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={paymentSaving || !paymentForm.consentGiven}
                      className="flex-1 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {paymentSaving ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Shield className="w-3 h-3" />
                          {hasPaymentMethod ? 'Update' : 'Save'} Payment Method
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
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
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Notes</h4>
              <p className="text-sm text-muted-foreground bg-background p-3 rounded-lg">{client.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-accent font-medium"
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

      <ConfirmDialog
        open={showRemovePaymentConfirm}
        onConfirm={handleRemovePayment}
        onCancel={() => setShowRemovePaymentConfirm(false)}
        title="Remove payment method?"
        description="This payment method will be removed from the client's account. This cannot be undone."
        variant="danger"
        confirmLabel="Remove"
      />
    </div>
  );
}
