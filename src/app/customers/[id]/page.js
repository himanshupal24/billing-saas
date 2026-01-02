'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowLeft, Plus, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ledgerDialogOpen, setLedgerDialogOpen] = useState(false);
  const [ledgerForm, setLedgerForm] = useState({
    type: 'CREDIT',
    amount: '',
    reference: '',
    date: new Date().toISOString().split('T')[0],
  });
  const { toast } = useToast();

  useEffect(() => {
    loadCustomer();
  }, [params.id]);

  const loadCustomer = async () => {
    try {
      const [customerResponse, businessResponse] = await Promise.all([
        api.get(`/api/customers/${params.id}`),
        api.get('/api/business'),
      ]);
      setData({ ...customerResponse, business: businessResponse.business });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load customer',
        variant: 'destructive',
      });
      router.push('/customers');
    } finally {
      setLoading(false);
    }
  };

  const handleLedgerSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/ledger', {
        customerId: params.id,
        ...ledgerForm,
        amount: parseFloat(ledgerForm.amount),
      });
      toast({
        title: 'Success',
        description: 'Ledger entry created successfully',
      });
      setLedgerDialogOpen(false);
      setLedgerForm({
        type: 'CREDIT',
        amount: '',
        reference: '',
        date: new Date().toISOString().split('T')[0],
      });
      loadCustomer();
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

  if (!data) {
    return null;
  }

  const { customer, invoices, ledgerEntries, business } = data;
  const displayCurrency = business?.currency || 'USD';

  return (
    <ProtectedRoute requireBusiness>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{customer.name}</h1>
              <p className="text-muted-foreground mt-1">Customer details and transaction history</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {customer.email && (
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{customer.email}</p>
                  </div>
                )}
                {customer.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{customer.phone}</p>
                  </div>
                )}
                {customer.address && (
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{customer.address}</p>
                  </div>
                )}
                <div className="pt-3 border-t">
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(customer.currentBalance, displayCurrency)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Quick Actions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/invoices/new?customerId=${customer.id}`}>
                  <Button className="w-full" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Create Invoice
                  </Button>
                </Link>
                <Dialog open={ledgerDialogOpen} onOpenChange={setLedgerDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Ledger Entry
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleLedgerSubmit}>
                      <DialogHeader>
                        <DialogTitle>Add Ledger Entry</DialogTitle>
                        <DialogDescription>
                          Record a credit or debit transaction for this customer.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="type">Type *</Label>
                          <Select
                            value={ledgerForm.type}
                            onValueChange={(value) => setLedgerForm({ ...ledgerForm, type: value })}
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
                            value={ledgerForm.amount}
                            onChange={(e) => setLedgerForm({ ...ledgerForm, amount: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reference">Reference</Label>
                          <Input
                            id="reference"
                            value={ledgerForm.reference}
                            onChange={(e) => setLedgerForm({ ...ledgerForm, reference: e.target.value })}
                            placeholder="Payment reference, check number, etc."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="date">Date *</Label>
                          <Input
                            id="date"
                            type="date"
                            value={ledgerForm.date}
                            onChange={(e) => setLedgerForm({ ...ledgerForm, date: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setLedgerDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Add Entry</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ledger History</CardTitle>
            </CardHeader>
            <CardContent>
              {ledgerEntries.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No ledger entries yet</p>
              ) : (
                <div className="space-y-2">
                  {ledgerEntries.map((entry) => (
                    <div
                      key={entry._id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {entry.type === 'DEBIT' ? 'Debit' : 'Credit'}
                          {entry.relatedInvoiceId && (
                            <span className="text-sm text-muted-foreground ml-2">
                              (Invoice {entry.relatedInvoiceId.invoiceNumber})
                            </span>
                          )}
                        </p>
                        {entry.reference && (
                          <p className="text-sm text-muted-foreground">{entry.reference}</p>
                        )}
                        <p className="text-xs text-muted-foreground">{formatDate(entry.date)}</p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold ${
                            entry.type === 'DEBIT' ? 'text-destructive' : 'text-green-600'
                          }`}
                        >
                          {entry.type === 'DEBIT' ? '+' : '-'}
                          {formatCurrency(entry.amount, displayCurrency)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No invoices yet</p>
              ) : (
                <div className="space-y-2">
                  {invoices.map((invoice) => (
                    <Link
                      key={invoice._id}
                      href={`/invoices/${invoice._id}`}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div>
                        <p className="font-medium">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(invoice.createdAt)} • {invoice.status}
                        </p>
                      </div>
                      <p className="font-medium">{formatCurrency(invoice.totalAmount, displayCurrency)}</p>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

