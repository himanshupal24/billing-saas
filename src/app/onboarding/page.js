'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function OnboardingPage() {
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [taxType, setTaxType] = useState('NONE');
  const [taxRate, setTaxRate] = useState('0');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { checkAuth } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/api/business/onboarding', {
        name,
        currency,
        taxType,
        taxRate: taxType !== 'NONE' ? parseFloat(taxRate) : 0,
      });

      // Refresh user data to get updated hasBusiness status
      await checkAuth();

      toast({
        title: 'Setup Complete',
        description: 'Your business has been configured successfully! One demo customer account has been created.',
      });

      router.push('/dashboard');
    } catch (error) {
      toast({
        title: 'Setup Failed',
        description: error.message || 'Failed to complete setup',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-background p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Welcome! Let&apos;s setup your business</CardTitle>
            <CardDescription>
              This will only take a minute. We&apos;ll create one demo customer account to get you started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Business Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="My Business"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency *</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                    <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxType">Tax Type *</Label>
                <Select value={taxType} onValueChange={setTaxType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tax type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">None</SelectItem>
                    <SelectItem value="GST">GST (Goods and Services Tax)</SelectItem>
                    <SelectItem value="VAT">VAT (Value Added Tax)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {taxType !== 'NONE' && (
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%) *</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="18"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    required={taxType !== 'NONE'}
                  />
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Setting up...' : 'Complete Setup'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}

