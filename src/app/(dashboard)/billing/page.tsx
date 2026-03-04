'use client';

import React, { useState, useEffect } from 'react';
import { useBarn } from '@/contexts/BarnContext';
import { toast } from '@/lib/toast';
import { csrfFetch } from '@/lib/fetch';
import { formatLocalDate } from '@/lib/utils';
import {
  DollarSign,
  Users,
  FileText,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Send,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Loader2,
  Download,
  Mail,
  CreditCard,
  Building,
  RefreshCw,
  Link2,
  ExternalLink,
  Play,
  Pause,
  GraduationCap,
} from 'lucide-react';

type TabId = 'invoices' | 'unbilled' | 'recurring' | 'services';

// Removed 'clients' tab - clients are managed in the dedicated /clients page
const tabs: { id: TabId; label: string; icon: any }[] = [
  { id: 'invoices', label: 'Invoices', icon: FileText },
  { id: 'unbilled', label: 'Unbilled', icon: Clock },
  { id: 'recurring', label: 'Recurring', icon: RefreshCw },
  { id: 'services', label: 'Services', icon: DollarSign },
];

const statusColors: Record<string, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  SENT: 'bg-blue-100 text-blue-700',
  PAID: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-muted text-muted-foreground',
};

const serviceCategories = [
  'BOARD', 'TRAINING', 'LESSONS', 'FARRIER', 'VET', 'GROOMING', 
  'TRANSPORT', 'SHOW', 'SUPPLIES', 'OTHER'
];

export default function BillingPage() {
  const { currentBarn, isMember } = useBarn();
  const canEdit = isMember && currentBarn?.role !== 'CLIENT';
  const [activeTab, setActiveTab] = useState<TabId>('invoices');
  const [isLoading, setIsLoading] = useState(true);
  
  // Data states
  const [invoices, setInvoices] = useState<any[]>([]);
  const [recurringInvoices, setRecurringInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [horses, setHorses] = useState<any[]>([]);
  const [unbilledLessons, setUnbilledLessons] = useState<any[]>([]);
  
  // Modal states
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [selectedRecurring, setSelectedRecurring] = useState<any>(null);

  // Form states
  const [invoiceForm, setInvoiceForm] = useState({
    clientId: '',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [{ description: '', quantity: 1, unitPrice: 0, horseId: '', serviceId: '' }],
    notes: '',
  });

  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    category: 'OTHER',
    price: '',
    unit: 'each',
    taxable: false,
  });
  
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    method: 'CHECK',
    reference: '',
    notes: '',
  });

  const [recurringForm, setRecurringForm] = useState({
    clientId: '',
    name: '',
    frequency: 'MONTHLY',
    dayOfMonth: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    autoSend: false,
    items: [{ description: '', quantity: 1, unitPrice: 0, horseId: '', serviceId: '' }],
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [isCreatingPaymentLink, setIsCreatingPaymentLink] = useState<string | null>(null);

  useEffect(() => {
    if (currentBarn?.id) {
      fetchData();
    }
  }, [currentBarn?.id]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [invoicesRes, recurringRes, clientsRes, servicesRes, horsesRes, unbilledRes] = await Promise.all([
        fetch(`/api/barns/${currentBarn?.id}/invoices`),
        fetch(`/api/barns/${currentBarn?.id}/recurring-invoices`),
        fetch(`/api/barns/${currentBarn?.id}/clients`),
        fetch(`/api/barns/${currentBarn?.id}/services`),
        fetch(`/api/barns/${currentBarn?.id}/horses`),
        fetch(`/api/barns/${currentBarn?.id}/lessons?unbilled=true`),
      ]);

      if (invoicesRes.ok) {
        const data = await invoicesRes.json();
        setInvoices(data.data || []);
      }
      if (recurringRes.ok) {
        const data = await recurringRes.json();
        setRecurringInvoices(data.data || []);
      }
      if (clientsRes.ok) {
        const data = await clientsRes.json();
        setClients(data.data || []);
      }
      if (servicesRes.ok) {
        const data = await servicesRes.json();
        setServices(data.data || []);
      }
      if (horsesRes.ok) {
        const data = await horsesRes.json();
        setHorses(data.data || []);
      }
      if (unbilledRes.ok) {
        const data = await unbilledRes.json();
        setUnbilledLessons(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInvoice = async () => {
    if (!invoiceForm.clientId) {
      toast.warning('Missing client', 'Please select a client');
      return;
    }

    setIsSubmitting(true);
    try {
      const items = invoiceForm.items
        .filter(item => item.description && item.unitPrice > 0)
        .map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          horseId: item.horseId || null,
          serviceId: item.serviceId || null,
        }));

      const response = await csrfFetch(`/api/barns/${currentBarn?.id}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: invoiceForm.clientId,
          dueDate: invoiceForm.dueDate,
          items,
          notes: invoiceForm.notes,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create invoice');
      }

      setShowInvoiceModal(false);
      setInvoiceForm({
        clientId: '',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: [{ description: '', quantity: 1, unitPrice: 0, horseId: '', serviceId: '' }],
        notes: '',
      });
      fetchData();
    } catch (err) {
      toast.error('Failed to create invoice', err instanceof Error ? err.message : 'Please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateService = async () => {
    if (!serviceForm.name || !serviceForm.price) {
      toast.warning('Missing fields', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await csrfFetch(`/api/barns/${currentBarn?.id}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...serviceForm,
          price: parseFloat(serviceForm.price),
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create service');
      }

      setShowServiceModal(false);
      setServiceForm({
        name: '', description: '', category: 'OTHER',
        price: '', unit: 'each', taxable: false,
      });
      fetchData();
    } catch (err) {
      toast.error('Failed to create service', err instanceof Error ? err.message : 'Please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!paymentForm.amount || !selectedInvoice) {
      toast.warning('Missing amount', 'Please enter payment amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await csrfFetch(`/api/barns/${currentBarn?.id}/invoices/${selectedInvoice.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(paymentForm.amount),
          method: paymentForm.method,
          reference: paymentForm.reference,
          notes: paymentForm.notes,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to record payment');
      }

      setShowPaymentModal(false);
      setPaymentForm({ amount: '', method: 'CHECK', reference: '', notes: '' });
      setSelectedInvoice(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to record payment', err instanceof Error ? err.message : 'Please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateInvoiceStatus = async (invoiceId: string, status: string) => {
    try {
      const response = await csrfFetch(`/api/barns/${currentBarn?.id}/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
    }
  };

  // Download invoice PDF
  const handleDownloadPDF = async (invoice: any) => {
    setIsDownloading(invoice.id);
    try {
      const response = await fetch(`/api/barns/${currentBarn?.id}/invoices/${invoice.id}/pdf`);
      if (!response.ok) throw new Error('Failed to generate PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Download failed', 'Failed to download PDF');
    } finally {
      setIsDownloading(null);
    }
  };

  // Create Stripe payment link
  const handleCreatePaymentLink = async (invoice: any) => {
    setIsCreatingPaymentLink(invoice.id);
    try {
      const response = await csrfFetch(`/api/barns/${currentBarn?.id}/invoices/${invoice.id}/payment-link`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to create payment link');
      
      const data = await response.json();
      if (data.data.paymentLinkUrl) {
        // Copy to clipboard
        await navigator.clipboard.writeText(data.data.paymentLinkUrl);
        toast.success(
          'Payment link created',
          data.data.mode === 'demo' ? 'Link copied to clipboard (Demo mode)' : 'Link copied to clipboard'
        );
        fetchData();
      }
    } catch (error) {
      console.error('Error creating payment link:', error);
      toast.error('Failed to create payment link', 'Please try again');
    } finally {
      setIsCreatingPaymentLink(null);
    }
  };

  // Create recurring invoice
  const handleCreateRecurring = async () => {
    if (!recurringForm.clientId || !recurringForm.name) {
      toast.warning('Missing fields', 'Please select a client and enter a name');
      return;
    }

    const validItems = recurringForm.items.filter(item => item.description && item.unitPrice > 0);
    if (validItems.length === 0) {
      toast.warning('Missing items', 'Please add at least one item');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await csrfFetch(`/api/barns/${currentBarn?.id}/recurring-invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...recurringForm,
          items: validItems,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create recurring invoice');
      }

      setShowRecurringModal(false);
      setRecurringForm({
        clientId: '',
        name: '',
        frequency: 'MONTHLY',
        dayOfMonth: 1,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        autoSend: false,
        items: [{ description: '', quantity: 1, unitPrice: 0, horseId: '', serviceId: '' }],
        notes: '',
      });
      fetchData();
    } catch (err) {
      toast.error('Failed to create recurring invoice', err instanceof Error ? err.message : 'Please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate invoices from recurring
  const handleGenerateInvoices = async (recurringId?: string) => {
    setIsGenerating(true);
    try {
      const response = await csrfFetch(`/api/barns/${currentBarn?.id}/recurring-invoices/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recurringInvoiceId: recurringId,
          forceGenerate: !!recurringId,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate invoices');
      
      const data = await response.json();
      toast.success('Invoices generated', data.data.message || `Generated ${data.data.generated} invoice(s)`);
      fetchData();
    } catch (error) {
      console.error('Error generating invoices:', error);
      toast.error('Generation failed', 'Failed to generate invoices');
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle recurring invoice active status
  const handleToggleRecurring = async (recurring: any) => {
    try {
      const response = await csrfFetch(`/api/barns/${currentBarn?.id}/recurring-invoices/${recurring.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !recurring.isActive }),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error toggling recurring invoice:', error);
    }
  };

  // Export to QuickBooks
  const handleQuickBooksExport = async (exportType: string, format: string) => {
    try {
      const response = await fetch(
        `/api/barns/${currentBarn?.id}/exports/quickbooks?type=${exportType}&format=${format}`
      );
      
      if (!response.ok) throw new Error('Failed to generate export');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentBarn?.name || 'barnkeep'}-${exportType}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setShowExportModal(false);
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Export failed', 'Failed to export data');
    }
  };

  const addRecurringItem = () => {
    setRecurringForm(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, horseId: '', serviceId: '' }],
    }));
  };

  const updateRecurringItem = (index: number, field: string, value: any) => {
    setRecurringForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? { ...item, [field]: value } : item),
    }));
  };

  const removeRecurringItem = (index: number) => {
    setRecurringForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const addInvoiceItem = () => {
    setInvoiceForm(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, horseId: '', serviceId: '' }],
    }));
  };

  const updateInvoiceItem = (index: number, field: string, value: any) => {
    setInvoiceForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i !== index) return item;
        
        // If selecting a service, auto-fill description and price
        if (field === 'serviceId' && value) {
          const service = services.find(s => s.id === value);
          if (service) {
            return {
              ...item,
              serviceId: value,
              description: service.name,
              unitPrice: service.price,
            };
          }
        }
        
        return { ...item, [field]: value };
      }),
    }));
  };

  const removeInvoiceItem = (index: number) => {
    setInvoiceForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const calculateInvoiceTotal = () => {
    return invoiceForm.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  // Calculate stats
  const stats = {
    totalOutstanding: invoices
      .filter(i => i.status === 'SENT' || i.status === 'OVERDUE')
      .reduce((sum, i) => sum + (i.total - i.amountPaid), 0),
    overdueCount: invoices.filter(i => i.status === 'OVERDUE').length,
    paidThisMonth: invoices
      .filter(i => i.status === 'PAID' && new Date(i.paidAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .reduce((sum, i) => sum + i.total, 0),
    totalClients: clients.length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing</h1>
          <p className="text-muted-foreground">Manage invoices, clients, and services</p>
        </div>
        <div className="flex gap-2">
          {/* QuickBooks Export */}
          <button 
            onClick={() => setShowExportModal(true)} 
            className="btn-secondary btn-md"
            title="Export to QuickBooks"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          
          {canEdit && activeTab === 'invoices' && (
            <button onClick={() => setShowInvoiceModal(true)} className="btn-primary btn-md">
              <Plus className="w-4 h-4" />
              New Invoice
            </button>
          )}
          {canEdit && activeTab === 'recurring' && (
            <button onClick={() => setShowRecurringModal(true)} className="btn-primary btn-md">
              <Plus className="w-4 h-4" />
              New Recurring
            </button>
          )}
          {canEdit && activeTab === 'services' && (
            <button onClick={() => setShowServiceModal(true)} className="btn-primary btn-md">
              <Plus className="w-4 h-4" />
              Add Service
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-sm text-muted-foreground">Outstanding</p>
          <p className="text-2xl font-bold text-foreground">${stats.totalOutstanding.toFixed(2)}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-muted-foreground">Overdue</p>
          <p className="text-2xl font-bold text-red-600">{stats.overdueCount}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-muted-foreground">Paid (30 days)</p>
          <p className="text-2xl font-bold text-green-600">${stats.paidThisMonth.toFixed(2)}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-muted-foreground">Total Clients</p>
          <p className="text-2xl font-bold text-foreground">{stats.totalClients}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-1">
          {tabs
            .filter(tab => canEdit || tab.id === 'invoices')
            .map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all
                ${activeTab === id 
                  ? 'border-amber-500 text-amber-600' 
                  : 'border-transparent text-muted-foreground hover:text-muted-foreground'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'invoices' && (
        <div className="card divide-y divide-border">
          {invoices.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">{canEdit ? 'No invoices yet' : 'No invoices found'}</p>
              {canEdit && (
                <button onClick={() => setShowInvoiceModal(true)} className="btn-primary btn-sm mt-4">
                  Create First Invoice
                </button>
              )}
            </div>
          ) : (
            invoices.map(invoice => (
              <div key={invoice.id} className="p-4 flex items-center gap-4 hover:bg-accent">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{invoice.invoiceNumber}</p>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[invoice.status] || 'bg-muted text-muted-foreground'}`}>
                      {invoice.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {invoice.client.firstName} {invoice.client.lastName} • Due {formatLocalDate(invoice.dueDate)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">${invoice.total.toFixed(2)}</p>
                  {invoice.amountPaid > 0 && invoice.amountPaid < invoice.total && (
                    <p className="text-sm text-muted-foreground">Paid: ${invoice.amountPaid.toFixed(2)}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {/* Download PDF */}
                  <button
                    onClick={() => handleDownloadPDF(invoice)}
                    disabled={isDownloading === invoice.id}
                    className="p-2 rounded-lg hover:bg-accent text-muted-foreground"
                    title="Download PDF"
                  >
                    {isDownloading === invoice.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </button>
                  
                  {/* Payment Link */}
                  {invoice.status !== 'PAID' && invoice.status !== 'DRAFT' && (
                    <button
                      onClick={() => handleCreatePaymentLink(invoice)}
                      disabled={isCreatingPaymentLink === invoice.id}
                      className="p-2 rounded-lg hover:bg-accent text-purple-600"
                      title={invoice.stripePaymentLinkUrl ? 'Copy Payment Link' : 'Create Payment Link'}
                    >
                      {isCreatingPaymentLink === invoice.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Link2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  
                  {/* Open payment link in new tab */}
                  {invoice.stripePaymentLinkUrl && (
                    <a
                      href={invoice.stripePaymentLinkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-accent text-blue-600"
                      title="Open Payment Link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  
                  {invoice.status === 'DRAFT' && (
                    <button
                      onClick={() => handleUpdateInvoiceStatus(invoice.id, 'SENT')}
                      className="p-2 rounded-lg hover:bg-accent text-blue-600"
                      title="Send Invoice"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                  {(invoice.status === 'SENT' || invoice.status === 'OVERDUE') && (
                    <button
                      onClick={() => {
                        setSelectedInvoice(invoice);
                        setPaymentForm({ ...paymentForm, amount: (invoice.total - invoice.amountPaid).toFixed(2) });
                        setShowPaymentModal(true);
                      }}
                      className="p-2 rounded-lg hover:bg-accent text-green-600"
                      title="Record Payment"
                    >
                      <CreditCard className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'unbilled' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {unbilledLessons.length} unbilled lesson{unbilledLessons.length !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Completed lessons that haven't been added to an invoice
              </p>
            </div>
          </div>

          <div className="card divide-y divide-border">
            {unbilledLessons.length === 0 ? (
              <div className="p-8 text-center">
                <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No unbilled lessons</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Completed lessons will appear here for billing
                </p>
              </div>
            ) : (
              <>
                {/* Group by client */}
                {Object.entries(
                  unbilledLessons.reduce((acc: any, lesson: any) => {
                    const clientKey = lesson.client?.id || 'no-client';
                    if (!acc[clientKey]) {
                      acc[clientKey] = {
                        client: lesson.client,
                        lessons: [],
                        total: 0,
                      };
                    }
                    acc[clientKey].lessons.push(lesson);
                    acc[clientKey].total += lesson.price || 0;
                    return acc;
                  }, {})
                ).map(([clientKey, group]: [string, any]) => (
                  <div key={clientKey} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {group.client ? `${group.client.firstName} ${group.client.lastName}` : 'No Client Assigned'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {group.lessons.length} lesson{group.lessons.length !== 1 ? 's' : ''} • ${group.total.toFixed(2)} total
                          </p>
                        </div>
                      </div>
                      {group.client && (
                        <button
                          onClick={() => {
                            // Pre-populate invoice form with lessons
                            setInvoiceForm({
                              clientId: group.client.id,
                              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                              items: group.lessons.map((lesson: any) => ({
                                description: `${lesson.type} Lesson - ${formatLocalDate(lesson.scheduledDate)}${lesson.horse ? ` (${lesson.horse.barnName})` : ''}`,
                                quantity: 1,
                                unitPrice: lesson.price || 0,
                                horseId: lesson.horse?.id || '',
                                serviceId: '',
                                lessonId: lesson.id,
                              })),
                              notes: '',
                            });
                            setShowInvoiceModal(true);
                          }}
                          className="btn-primary btn-sm"
                        >
                          <Plus className="w-4 h-4" />
                          Create Invoice
                        </button>
                      )}
                    </div>
                    <div className="pl-13 space-y-2">
                      {group.lessons.map((lesson: any) => (
                        <div key={lesson.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                          <div>
                            <p className="text-sm text-foreground">
                              {lesson.type} Lesson
                              {lesson.horse && <span className="text-muted-foreground"> with {lesson.horse.barnName}</span>}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatLocalDate(lesson.scheduledDate)} • {lesson.duration} min
                              {lesson.discipline && ` • ${lesson.discipline}`}
                            </p>
                          </div>
                          <p className="font-medium text-foreground">
                            ${(lesson.price || 0).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'recurring' && (
        <div className="space-y-4">
          {/* Recurring Invoices Header */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {recurringInvoices.filter(r => r.isActive).length} active recurring invoices
            </p>
            <button
              onClick={() => handleGenerateInvoices()}
              disabled={isGenerating}
              className="btn-secondary btn-sm flex items-center gap-2"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Generate Due Invoices
            </button>
          </div>

          <div className="card divide-y divide-border">
            {recurringInvoices.length === 0 ? (
              <div className="p-8 text-center">
                <RefreshCw className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No recurring invoices yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Set up automatic monthly billing for board and services
                </p>
                <button onClick={() => setShowRecurringModal(true)} className="btn-primary btn-sm mt-4">
                  Create Recurring Invoice
                </button>
              </div>
            ) : (
              recurringInvoices.map(recurring => (
                <div key={recurring.id} className="p-4 flex items-center gap-4 hover:bg-accent">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    recurring.isActive ? 'bg-green-100' : 'bg-muted'
                  }`}>
                    <RefreshCw className={`w-5 h-5 ${
                      recurring.isActive ? 'text-green-600' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{recurring.name}</p>
                      <span className={recurring.isActive ? 'badge-success' : 'badge-neutral'}>
                        {recurring.isActive ? 'Active' : 'Paused'}
                      </span>
                      <span className="badge-neutral">{recurring.frequency}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {recurring.client.firstName} {recurring.client.lastName} • 
                      Next: {formatLocalDate(recurring.nextRunDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      ${recurring.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {recurring._count?.generatedInvoices || 0} generated
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleGenerateInvoices(recurring.id)}
                      disabled={isGenerating}
                      className="p-2 rounded-lg hover:bg-accent text-blue-600"
                      title="Generate Invoice Now"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleRecurring(recurring)}
                      className={`p-2 rounded-lg hover:bg-accent ${
                        recurring.isActive ? 'text-amber-600' : 'text-green-600'
                      }`}
                      title={recurring.isActive ? 'Pause' : 'Resume'}
                    >
                      {recurring.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'services' && (
        <div className="card divide-y divide-border">
          {services.length === 0 ? (
            <div className="p-8 text-center">
              <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No services defined</p>
              <button onClick={() => setShowServiceModal(true)} className="btn-primary btn-sm mt-4">
                Add First Service
              </button>
            </div>
          ) : (
            services.map(service => (
              <div key={service.id} className="p-4 flex items-center gap-4 hover:bg-accent">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{service.name}</p>
                  <p className="text-sm text-muted-foreground">{service.category.replace(/_/g, ' ')}</p>
                </div>
                <p className="font-semibold text-foreground">
                  ${service.price.toFixed(2)}/{service.unit}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">New Invoice</h3>
                <button onClick={() => setShowInvoiceModal(false)} className="p-1 rounded hover:bg-accent">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Client *</label>
                  <select
                    value={invoiceForm.clientId}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, clientId: e.target.value }))}
                    className="input w-full"
                  >
                    <option value="">Select client...</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.firstName} {client.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Due Date</label>
                  <input
                    type="date"
                    value={invoiceForm.dueDate}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="input w-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-muted-foreground">Line Items</label>
                  <button onClick={addInvoiceItem} className="text-sm text-amber-600 hover:text-amber-700">
                    + Add Item
                  </button>
                </div>
                <div className="space-y-3">
                  {invoiceForm.items.map((item, index) => (
                    <div key={index} className="p-3 rounded-xl bg-background space-y-2">
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-4">
                          <select
                            value={item.serviceId}
                            onChange={(e) => updateInvoiceItem(index, 'serviceId', e.target.value)}
                            className="input w-full text-sm"
                          >
                            <option value="">Select service...</option>
                            {services.map(s => (
                              <option key={s.id} value={s.id}>{s.name} (${s.price})</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-4">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                            className="input w-full text-sm"
                            placeholder="Description"
                          />
                        </div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateInvoiceItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="input w-full text-sm"
                            min="1"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateInvoiceItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="input w-full text-sm"
                            step="0.01"
                            placeholder="Price"
                          />
                        </div>
                        <div className="col-span-1 flex items-center justify-center">
                          {invoiceForm.items.length > 1 && (
                            <button onClick={() => removeInvoiceItem(index)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <select
                        value={item.horseId}
                        onChange={(e) => updateInvoiceItem(index, 'horseId', e.target.value)}
                        className="input w-full text-sm"
                      >
                        <option value="">No specific horse</option>
                        {horses.map(h => (
                          <option key={h.id} value={h.id}>{h.barnName}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end p-3 bg-muted rounded-xl">
                <p className="text-lg font-semibold">Total: ${calculateInvoiceTotal().toFixed(2)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Notes</label>
                <textarea
                  value={invoiceForm.notes}
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="input w-full"
                  rows={2}
                />
              </div>
            </div>
            <div className="p-6 border-t border-border flex gap-3">
              <button onClick={() => setShowInvoiceModal(false)} className="btn-secondary flex-1" disabled={isSubmitting}>
                Cancel
              </button>
              <button onClick={handleCreateInvoice} className="btn-primary flex-1" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Add Service</h3>
                <button onClick={() => setShowServiceModal(false)} className="p-1 rounded hover:bg-accent">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Service Name *</label>
                <input
                  type="text"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, name: e.target.value }))}
                  className="input w-full"
                  placeholder="e.g., Monthly Board, Private Lesson"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Category</label>
                <select
                  value={serviceForm.category}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, category: e.target.value }))}
                  className="input w-full"
                >
                  {serviceCategories.map(cat => (
                    <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Price *</label>
                  <input
                    type="number"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, price: e.target.value }))}
                    className="input w-full"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Unit</label>
                  <select
                    value={serviceForm.unit}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, unit: e.target.value }))}
                    className="input w-full"
                  >
                    <option value="each">each</option>
                    <option value="hour">hour</option>
                    <option value="day">day</option>
                    <option value="month">month</option>
                    <option value="session">session</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                <textarea
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                  className="input w-full"
                  rows={2}
                />
              </div>
            </div>
            <div className="p-6 border-t border-border flex gap-3">
              <button onClick={() => setShowServiceModal(false)} className="btn-secondary flex-1" disabled={isSubmitting}>
                Cancel
              </button>
              <button onClick={handleCreateService} className="btn-primary flex-1" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Service'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Record Payment</h3>
                <button onClick={() => setShowPaymentModal(false)} className="p-1 rounded hover:bg-accent">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Invoice {selectedInvoice.invoiceNumber} • Balance: ${(selectedInvoice.total - selectedInvoice.amountPaid).toFixed(2)}
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Amount *</label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="input w-full"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Payment Method</label>
                <select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, method: e.target.value }))}
                  className="input w-full"
                >
                  <option value="CHECK">Check</option>
                  <option value="CASH">Cash</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="ACH">Bank Transfer (ACH)</option>
                  <option value="VENMO">Venmo</option>
                  <option value="ZELLE">Zelle</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Reference #</label>
                <input
                  type="text"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, reference: e.target.value }))}
                  className="input w-full"
                  placeholder="Check number, transaction ID, etc."
                />
              </div>
            </div>
            <div className="p-6 border-t border-border flex gap-3">
              <button onClick={() => setShowPaymentModal(false)} className="btn-secondary flex-1" disabled={isSubmitting}>
                Cancel
              </button>
              <button onClick={handleRecordPayment} className="btn-primary flex-1" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Record Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recurring Invoice Modal */}
      {showRecurringModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-semibold">Create Recurring Invoice</h3>
              <button onClick={() => setShowRecurringModal(false)} className="p-1 rounded hover:bg-accent">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Client *</label>
                  <select
                    value={recurringForm.clientId}
                    onChange={(e) => setRecurringForm(prev => ({ ...prev, clientId: e.target.value }))}
                    className="input w-full"
                  >
                    <option value="">Select client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.firstName} {client.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Name *</label>
                  <input
                    type="text"
                    value={recurringForm.name}
                    onChange={(e) => setRecurringForm(prev => ({ ...prev, name: e.target.value }))}
                    className="input w-full"
                    placeholder="e.g., Monthly Board - Thunder"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Frequency</label>
                  <select
                    value={recurringForm.frequency}
                    onChange={(e) => setRecurringForm(prev => ({ ...prev, frequency: e.target.value }))}
                    className="input w-full"
                  >
                    <option value="WEEKLY">Weekly</option>
                    <option value="BIWEEKLY">Bi-weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Day of Month</label>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    value={recurringForm.dayOfMonth}
                    onChange={(e) => setRecurringForm(prev => ({ ...prev, dayOfMonth: parseInt(e.target.value) || 1 }))}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Start Date</label>
                  <input
                    type="date"
                    value={recurringForm.startDate}
                    onChange={(e) => setRecurringForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="input w-full"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoSend"
                  checked={recurringForm.autoSend}
                  onChange={(e) => setRecurringForm(prev => ({ ...prev, autoSend: e.target.checked }))}
                  className="rounded border-border"
                />
                <label htmlFor="autoSend" className="text-sm text-muted-foreground">
                  Automatically send invoice when generated
                </label>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-muted-foreground">Line Items</label>
                  <button
                    type="button"
                    onClick={addRecurringItem}
                    className="text-sm text-amber-600 hover:text-amber-700"
                  >
                    + Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {recurringForm.items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <select
                        value={item.serviceId}
                        onChange={(e) => {
                          const service = services.find(s => s.id === e.target.value);
                          updateRecurringItem(index, 'serviceId', e.target.value);
                          if (service) {
                            updateRecurringItem(index, 'description', service.name);
                            updateRecurringItem(index, 'unitPrice', service.price);
                          }
                        }}
                        className="input w-32"
                      >
                        <option value="">Service</option>
                        {services.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateRecurringItem(index, 'description', e.target.value)}
                        placeholder="Description"
                        className="input flex-1"
                      />
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateRecurringItem(index, 'quantity', parseFloat(e.target.value) || 1)}
                        className="input w-20"
                        min="1"
                      />
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateRecurringItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        placeholder="Price"
                        className="input w-24"
                        min="0"
                        step="0.01"
                      />
                      <button
                        type="button"
                        onClick={() => removeRecurringItem(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Notes</label>
                <textarea
                  value={recurringForm.notes}
                  onChange={(e) => setRecurringForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="input w-full"
                  rows={2}
                  placeholder="Notes to include on generated invoices"
                />
              </div>
            </div>
            <div className="p-6 border-t border-border flex gap-3">
              <button onClick={() => setShowRecurringModal(false)} className="btn-secondary flex-1" disabled={isSubmitting}>
                Cancel
              </button>
              <button onClick={handleCreateRecurring} className="btn-primary flex-1" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Recurring Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-semibold">Export to QuickBooks</h3>
              <button onClick={() => setShowExportModal(false)} className="p-1 rounded hover:bg-accent">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Export your data for import into QuickBooks Desktop or QuickBooks Online.
              </p>
              
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">IIF Format (QuickBooks Desktop)</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleQuickBooksExport('invoices', 'iif')}
                    className="btn-secondary btn-sm text-left flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Invoices
                  </button>
                  <button
                    onClick={() => handleQuickBooksExport('payments', 'iif')}
                    className="btn-secondary btn-sm text-left flex items-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    Payments
                  </button>
                  <button
                    onClick={() => handleQuickBooksExport('customers', 'iif')}
                    className="btn-secondary btn-sm text-left flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Customers
                  </button>
                  <button
                    onClick={() => handleQuickBooksExport('all', 'iif')}
                    className="btn-secondary btn-sm text-left flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    All Data
                  </button>
                </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-border">
                <p className="text-sm font-medium text-muted-foreground">CSV Format (QuickBooks Online)</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleQuickBooksExport('invoices', 'csv')}
                    className="btn-secondary btn-sm text-left flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Invoices
                  </button>
                  <button
                    onClick={() => handleQuickBooksExport('payments', 'csv')}
                    className="btn-secondary btn-sm text-left flex items-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    Payments
                  </button>
                  <button
                    onClick={() => handleQuickBooksExport('customers', 'csv')}
                    className="btn-secondary btn-sm text-left flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Customers
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border">
              <button onClick={() => setShowExportModal(false)} className="btn-secondary w-full">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
