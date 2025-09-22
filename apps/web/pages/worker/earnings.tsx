import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, StatsCard } from '../../src/design-system/components/Card';
import { Heading, Text } from '../../src/design-system/components/Typography';
import { Button } from '../../src/design-system/components/Button';
import { Icons } from '../../src/design-system/components/Icons';
import { enhancedWorkerDashboardApi } from '../../services/enhancedWorkerDashboardApi';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../src/design-system/components/Modal';
import { useToasts } from '../../components/ui/ToastHost';
import PrivateRoute from '../../components/PrivateRoute';

const EarningsPage: React.FC = () => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ReturnType<typeof useState> | any>(null);
  const [requesting, setRequesting] = useState(false);
  const [isPayoutOpen, setIsPayoutOpen] = useState(false);
  const [method, setMethod] = useState<'mobile_money' | 'bank' | ''>('');
  const [details, setDetails] = useState<{ phone?: string; provider?: string; account_name?: string; account_number?: string; bank_name?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const { push } = useToasts();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await enhancedWorkerDashboardApi.getEarnings(period);
        if (mounted) setSummary(data);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load earnings');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [period]);

  const totals = useMemo(() => {
    if (!summary) return { total: 0, pending: 0, paid: 0 };
    return {
      total: summary.summary.total_earnings.xaf,
      pending: summary.summary.pending_earnings.xaf,
      paid: summary.summary.paid_earnings.xaf,
    };
  }, [summary]);

  type PaymentRow = { id: string; date: string; amount: number; method: string; status: string };
  const recentPayments: PaymentRow[] = useMemo(() => {
    if (!summary) return [];
    return (summary.transactions || []).map((t: any) => ({
      id: String(t.id),
      date: t.formatted_date,
      amount: t.amount_xaf,
      method: t.status === 'paid' ? 'Payout' : 'Earning',
      status: t.status,
    }));
  }, [summary]);

  type JobRow = { id: string; date: string; title: string; amount: number };
  const jobs: JobRow[] = useMemo(() => {
    if (!summary) return [];
    return (summary.transactions || []).slice(0, 5).map((t: any) => ({
      id: String(t.id),
      date: t.formatted_date,
      title: `${t.customer_name} - ${t.location}`,
      amount: t.amount_xaf,
    }));
  }, [summary]);

  const requestPayout = async () => {
    try {
      setRequesting(true);
      if (!method) { setFormError('Select a payout method'); return; }
      if (method === 'mobile_money') {
        if (!details.phone || !details.provider) { setFormError('Phone and provider are required'); return; }
      }
      if (method === 'bank') {
        if (!details.account_name || !details.account_number || !details.bank_name) { setFormError('Bank name, account name and number are required'); return; }
      }
      setFormError(null);
      await enhancedWorkerDashboardApi.requestPayout({ method, details });
      push({ type: 'success', message: 'Payout requested successfully' });
      // reload after request
      const { data } = await enhancedWorkerDashboardApi.getEarnings(period);
      setSummary(data);
      setIsPayoutOpen(false);
    } catch (e: any) {
      const msg = e?.message || 'Failed to request payout';
      setError(msg);
      push({ type: 'error', message: msg });
    } finally {
      setRequesting(false);
    }
  };

  return (
    <PrivateRoute requiredRole="worker">
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Heading level={1} className="mb-1 text-neutral-900 dark:text-neutral-100">Earnings</Heading>
          <Text variant="body" className="text-neutral-600 dark:text-neutral-300">Track your income and payouts</Text>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <Text variant="caption" className="text-neutral-600 dark:text-neutral-400">Period:</Text>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="all">All</option>
          </select>
        </div>

        {error && (
          <Card className="mb-4">
            <CardContent>
              <Text variant="body" className="text-red-600 dark:text-red-400">{error}</Text>
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card className="mb-4">
            <CardContent>
              <Text variant="body" className="text-neutral-600 dark:text-neutral-300">Loading earnings...</Text>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatsCard title="Total" value={`${totals.total.toLocaleString()} XAF`} />
          <StatsCard title="Paid" value={`${totals.paid.toLocaleString()} XAF`} />
          <StatsCard title="Pending" value={`${totals.pending.toLocaleString()} XAF`} />
          <StatsCard title="Can Request" value={summary?.can_request_payout ? 'Yes' : 'No'} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <Text variant="label">Recent Jobs</Text>
                <Button variant="outline" size="sm">View All</Button>
              </div>
                <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {jobs.map((job) => (
                  <div key={job.id} className="py-3 flex items-center justify-between">
                    <div>
                      <Text variant="body" className="text-neutral-900 dark:text-neutral-100">{job.title}</Text>
                      <Text variant="caption" className="text-neutral-600 dark:text-neutral-400">{job.date}</Text>
                    </div>
                    <div className="text-neutral-900 dark:text-neutral-100 font-medium">{job.amount.toLocaleString()} XAF</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <Text variant="label">Payouts</Text>
                <Button variant="primary" size="sm" leftIcon={<Icons.CreditCard className="h-4 w-4" />} onClick={() => setIsPayoutOpen(true)} disabled={!summary?.can_request_payout}>
                  Request Payout
                </Button>
              </div>
              <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {recentPayments.map((p) => (
                  <div key={p.id} className="py-3 flex items-center justify-between">
                    <div>
                      <Text variant="body" className="text-neutral-900 dark:text-neutral-100">{p.method}</Text>
                      <Text variant="caption" className="text-neutral-600 dark:text-neutral-400">{p.date}</Text>
                    </div>
                    <div className="text-right">
                      <div className="text-neutral-900 dark:text-neutral-100 font-medium">{p.amount.toLocaleString()} XAF</div>
                      <Text variant="caption" className={p.status === 'paid' ? 'text-emerald-600' : p.status === 'pending' ? 'text-amber-600' : 'text-neutral-600'}>{p.status}</Text>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {/* Payout Modal */}
          <Modal isOpen={isPayoutOpen} onClose={() => setIsPayoutOpen(false)} size="md">
            <ModalHeader>Request Payout</ModalHeader>
            <ModalBody>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm mb-1">Method</label>
                  <select
                    value={method}
                    onChange={(e) => { setMethod(e.target.value as any); setDetails({}); setFormError(null); }}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800"
                  >
                    <option value="">Select method</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>

                {method === 'mobile_money' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={details.phone || ''}
                        onChange={(e) => setDetails(d => ({ ...d, phone: e.target.value }))}
                        placeholder="e.g., 675123456"
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Provider</label>
                      <select
                        value={details.provider || ''}
                        onChange={(e) => setDetails(d => ({ ...d, provider: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800"
                      >
                        <option value="">Select provider</option>
                        <option value="MTN">MTN Mobile Money</option>
                        <option value="Orange">Orange Money</option>
                      </select>
                    </div>
                  </div>
                )}

                {method === 'bank' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={details.bank_name || ''}
                        onChange={(e) => setDetails(d => ({ ...d, bank_name: e.target.value }))}
                        placeholder="e.g., Afriland First Bank"
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Account Name</label>
                      <input
                        type="text"
                        value={details.account_name || ''}
                        onChange={(e) => setDetails(d => ({ ...d, account_name: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm mb-1">Account Number</label>
                      <input
                        type="text"
                        value={details.account_number || ''}
                        onChange={(e) => setDetails(d => ({ ...d, account_number: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800"
                      />
                    </div>
                  </div>
                )}

                {formError && <p className="text-sm text-red-600">{formError}</p>}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={() => setIsPayoutOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={requestPayout} loading={requesting}>Submit Request</Button>
            </ModalFooter>
          </Modal>
        </div>
      </div>
    </div>
    </PrivateRoute>
  );
};

export default EarningsPage;
