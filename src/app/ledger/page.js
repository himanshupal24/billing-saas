'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

export default function LedgerPage() {
  const [entries, setEntries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customerFilter, setCustomerFilter] = useState('ALL');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    type: 'CREDIT',
    amount: '',
    reference: '',
    date: new Date().toISOString().split('T')[0],
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [customerFilter]);

  const loadData = async () => {
    try {
      const [entriesRes, customersRes, businessRes] = await Promise.all([
        api.get(customerFilter !== 'ALL' ? `/api/ledger?customerId=${customerFilter}` : '/api/ledger'),
        api.get('/api/customers'),
        api.get('/api/business'),
      ]);
      setEntries(entriesRes.entries);
      setCustomers(customersRes.customers);
      setBusiness(businessRes.business);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load ledger entries',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/ledger', {
        ...formData,
        amount: parseFloat(formData.amount),
      });
      toast({
        title: 'Success',
        description: 'Ledger entry created successfully',
      });
      setDialogOpen(false);
      setFormData({
        customerId: '',
        type: 'CREDIT',
        amount: '',
        reference: '',
        date: new Date().toISOString().split('T')[0],
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create ledger entry',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireBusiness>
        <Layout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireBusiness>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Customer Ledger</h1>
              <p className="text-muted-foreground mt-1">Track all customer transactions</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Entry
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>Add Ledger Entry</DialogTitle>
                    <DialogDescription>
                      Record a credit or debit transaction.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="customer">Customer *</Label>
                      <Select
                        value={formData.customerId}
                        onValueChange={(value) => setFormData({ ...formData, customerId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer._id} value={customer._id}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Type *</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CREDIT">Credit (Payment Received)</SelectItem>
                          <SelectItem value="DEBIT">Debit (Amount Owed)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reference">Reference</Label>
                      <Input
                        id="reference"
                        value={formData.reference}
                        onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                        placeholder="Payment reference, check number, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Entry</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex items-center gap-4">
            <Select value={customerFilter} onValueChange={setCustomerFilter}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Filter by customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Customers</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer._id} value={customer._id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {entries.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No ledger entries yet</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="space-y-2">
                  {entries.map((entry) => (
                    <div
                      key={entry._id}
                      className="flex items-center justify-between p-4 border-b last:border-b-0"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">
                              {entry.customerId?.name || 'Unknown Customer'}
                            </p>
                            {entry.reference && (
                              <p className="text-sm text-muted-foreground">{entry.reference}</p>
                            )}
                            {entry.relatedInvoiceId && (
                              <p className="text-xs text-muted-foreground">
                                Invoice: {entry.relatedInvoiceId.invoiceNumber}
                              </p>
                            )}
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              entry.type === 'DEBIT'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {entry.type}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(entry.date)}</p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold text-lg ${
                            entry.type === 'DEBIT' ? 'text-destructive' : 'text-green-600'
                          }`}
                        >
                          {entry.type === 'DEBIT' ? '+' : '-'}
                          {formatCurrency(entry.amount, business?.currency || 'USD')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

