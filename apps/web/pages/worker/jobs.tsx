import React, { useState, useEffect } from 'react';
import { Button } from '../../src/design-system/components/Button';
import { Card } from '../../src/design-system/components/Card';
import { Heading, Text } from '../../src/design-system/components/Typography';
import { Icon } from '../../components/ui/Icons';
import { enhancedWorkerDashboardApi } from '../../services/enhancedWorkerDashboardApi';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../src/design-system/components/Modal';
import { useToasts } from '../../components/ui/ToastHost';
import PrivateRoute from '../../components/PrivateRoute';
import { SkeletonCard } from '../../src/design-system/components/Loading';

interface Job {
  id: string;
  title: string;
  customer: {
    name: string;
    rating: number;
    address: string;
    district: string;
  };
  payment: number;
  currency: string;
  estimatedTime: string;
  distance: string;
  binType: 'household' | 'commercial' | 'industrial';
  urgency: 'low' | 'medium' | 'high';
  description: string;
  scheduledTime: string;
  coordinates: { lat: number; lng: number };
  status: 'available' | 'accepted' | 'in_progress' | 'completed';
  requirements?: string[];
}

// Helpers
const parseDistanceKm = (distance: string) => {
  const n = parseFloat(distance);
  return Number.isFinite(n) ? n : 0;
};

const inferBinType = (wasteType: string): Job['binType'] => {
  const t = (wasteType || '').toLowerCase();
  if (t.includes('industrial')) return 'industrial';
  if (t.includes('commercial') || t.includes('office') || t.includes('business')) return 'commercial';
  return 'household';
};

export default function WorkerJobsPage() {
  const { push } = useToasts();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [declineModal, setDeclineModal] = useState<{ open: boolean; jobId: string | null; reason: string }>({ open: false, jobId: null, reason: '' });
  const [completeModal, setCompleteModal] = useState<{ open: boolean; jobId: string | null; weight: string; notes: string }>({ open: false, jobId: null, weight: '', notes: '' });
  const [filterType, setFilterType] = useState<'all' | 'household' | 'commercial' | 'industrial'>('all');
  const [sortBy, setSortBy] = useState<'payment' | 'distance' | 'time'>('payment');

  const refetchJobs = async () => {
    try {
      const { data } = await enhancedWorkerDashboardApi.getAvailablePickups();
      const mapped: Job[] = (data.available_pickups || []).map((p) => {
        const distanceKm = p.location.distance_km ?? null;
        const distanceStr = distanceKm !== null && distanceKm !== undefined ? `${distanceKm.toFixed(1)} km` : '—';
        const eta = distanceKm !== null && distanceKm !== undefined ? `${Math.max(10, Math.round(distanceKm * 12))} min` : '—';
        return {
          id: String(p.id),
          title: `${p.waste_type} Pickup`,
          customer: {
            name: p.owner_name,
            rating: 4.8,
            address: p.location.address,
            district: ''
          },
          payment: p.expected_fee,
          currency: 'XAF',
          estimatedTime: eta,
          distance: distanceStr,
          binType: inferBinType(p.waste_type),
          urgency: p.urgency === 'high' ? 'high' : 'medium',
          description: `Waste type: ${p.waste_type}${p.fill_level ? ` • Fill level: ${p.fill_level}%` : ''}`,
          scheduledTime: p.created_at,
          coordinates: { lat: p.location.latitude ?? 0, lng: p.location.longitude ?? 0 },
          status: 'available',
        } as Job;
      });
      setJobs(mapped);
    } catch (e: any) {
      setError(e?.message || 'Failed to load jobs');
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        if (mounted) await refetchJobs();
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load jobs');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const filteredJobs = jobs
    .filter(job => filterType === 'all' || job.binType === filterType)
    .sort((a, b) => {
      switch (sortBy) {
        case 'payment':
          return b.payment - a.payment;
        case 'distance':
          return parseFloat(a.distance) - parseFloat(b.distance);
        case 'time':
          return new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime();
        default:
          return 0;
      }
    });

  const handleAcceptJob = async (jobId: string) => {
    try {
      setAcceptingId(jobId);
      // optimistic: mark accepted locally
      const prev = jobs;
      setJobs(prevJobs => prevJobs.map(job => job.id === jobId ? { ...job, status: 'accepted' } : job));
      await enhancedWorkerDashboardApi.acceptPickup(Number(jobId));
      push({ type: 'success', message: 'Job accepted' });
      // refetch to reflect removal from available
      await refetchJobs();
    } catch (e: any) {
      setError(e?.message || 'Failed to accept job');
      push({ type: 'error', message: 'Failed to accept job' });
      // rollback
      setJobs(prevJobs => prevJobs.map(job => job.id === jobId ? { ...job, status: 'available' } : job));
    } finally {
      setAcceptingId(null);
    }
  };

  const handleDeclineJob = async (jobId: string) => {
    try {
      setDecliningId(jobId);
      const reason = declineModal.reason || 'Not available';
      // optimistic: remove locally
      setJobs(prev => prev.filter(j => j.id !== jobId));
      await enhancedWorkerDashboardApi.declinePickup(Number(jobId), reason);
      push({ type: 'success', message: 'Job declined' });
      await refetchJobs();
    } catch (e: any) {
      setError(e?.message || 'Failed to decline job');
      push({ type: 'error', message: 'Failed to decline job' });
      // refetch to restore
      await refetchJobs();
    } finally {
      setDecliningId(null);
      setDeclineModal({ open: false, jobId: null, reason: '' });
    }
  };

  const handleStartJob = async (jobId: string) => {
    try {
      setStartingId(jobId);
      // optimistic
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'in_progress' } : j));
      await enhancedWorkerDashboardApi.startPickup(Number(jobId));
      push({ type: 'success', message: 'Job started' });
      await refetchJobs();
    } catch (e: any) {
      setError(e?.message || 'Failed to start job');
      push({ type: 'error', message: 'Failed to start job' });
      // rollback
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'accepted' } : j));
    } finally {
      setStartingId(null);
    }
  };

  const handleCompleteJob = async (jobId: string) => {
    try {
      setCompletingId(jobId);
      const weight = completeModal.weight ? Number(completeModal.weight) : undefined;
      const notes = completeModal.notes || undefined;
      // optimistic
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'completed' } : j));
      await enhancedWorkerDashboardApi.completePickup(Number(jobId), { actual_weight_kg: weight, notes });
      push({ type: 'success', message: 'Job completed' });
      await refetchJobs();
    } catch (e: any) {
      setError(e?.message || 'Failed to complete job');
      push({ type: 'error', message: 'Failed to complete job' });
      // rollback
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'in_progress' } : j));
    } finally {
      setCompletingId(null);
      setCompleteModal({ open: false, jobId: null, weight: '', notes: '' });
    }
  };

  const openInMaps = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      default: return 'text-neutral-600 bg-neutral-100 dark:text-neutral-400 dark:bg-neutral-800';
    }
  };

  const getBinTypeIcon = (type: string) => {
    switch (type) {
      case 'household': return '🏠';
      case 'commercial': return '🏢';
      case 'industrial': return '🏭';
      default: return '📦';
    }
  };

  return (
    <PrivateRoute requiredRole="worker">
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Heading level={1} className="mb-2 text-neutral-900 dark:text-neutral-100">
            Available Jobs
          </Heading>
          <Text variant="body" className="text-neutral-600 dark:text-neutral-300">
            Find and accept waste collection jobs in your area
          </Text>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-between">
              <div>
                <Text variant="caption" className="text-emerald-600 dark:text-emerald-400 mb-1">
                  Available Jobs
                </Text>
                <Heading level={2} className="text-emerald-800 dark:text-emerald-200">
                  {jobs.filter(job => job.status === 'available').length}
                </Heading>
              </div>
              <Icon name="Trash" className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Text variant="caption" className="text-neutral-600 dark:text-neutral-400 mb-1">
                  Avg. Payment
                </Text>
                <Heading level={2} className="text-neutral-900 dark:text-neutral-100">
                  {jobs.length > 0 ? Math.round(jobs.reduce((sum, job) => sum + (job.payment || 0), 0) / jobs.length).toLocaleString() : 0} XAF
                </Heading>
              </div>
              <Icon name="CreditCard" className="w-8 h-8 text-neutral-600 dark:text-neutral-400" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Text variant="caption" className="text-neutral-600 dark:text-neutral-400 mb-1">
                  Total Distance
                </Text>
                <Heading level={2} className="text-neutral-900 dark:text-neutral-100">
                  {jobs.reduce((sum, job) => sum + parseDistanceKm(job.distance), 0).toFixed(1)} km
                </Heading>
              </div>
              <Icon name="Map" className="w-8 h-8 text-neutral-600 dark:text-neutral-400" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Text variant="caption" className="text-neutral-600 dark:text-neutral-400 mb-1">
                  Accepted Today
                </Text>
                <Heading level={2} className="text-neutral-900 dark:text-neutral-100">
                  {jobs.filter(job => job.status === 'accepted').length}
                </Heading>
              </div>
              <Icon name="CheckCircle" className="w-8 h-8 text-neutral-600 dark:text-neutral-400" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <Text variant="caption" className="text-neutral-600 dark:text-neutral-400 mr-2 flex items-center">
                <Icon name="Filter" className="w-4 h-4 mr-1" />
                Filter by type:
              </Text>
              {(['all', 'household', 'commercial', 'industrial'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filterType === type
                      ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                      : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
                  }`}
                >
                  {type === 'all' ? 'All Jobs' : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Text variant="caption" className="text-neutral-600 dark:text-neutral-400">
                Sort by:
              </Text>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'payment' | 'distance' | 'time')}
                className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              >
                <option value="payment">Highest Payment</option>
                <option value="distance">Nearest Distance</option>
                <option value="time">Earliest Time</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Error */}
        {error && (
          <Card className="p-4 mb-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <Text variant="body" className="text-red-700 dark:text-red-300">{error}</Text>
          </Card>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-4 mb-6">
            <SkeletonCard showAvatar lines={2} />
            <SkeletonCard showAvatar lines={2} />
            <SkeletonCard showAvatar lines={2} />
          </div>
        )}

        {/* Jobs List */}
        <div className="space-y-6">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Job Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getBinTypeIcon(job.binType)}</span>
                      <div>
                        <Heading level={3} className="text-neutral-900 dark:text-neutral-100 mb-1">
                          {job.title}
                        </Heading>
                        <div className="flex items-center gap-2">
                          <Text variant="caption" className="text-neutral-600 dark:text-neutral-400">
                            {job.customer.name}
                          </Text>
                          <div className="flex items-center gap-1">
                            <Icon name="Star" className="w-4 h-4 text-yellow-500 fill-current" />
                            <Text variant="caption" className="text-neutral-600 dark:text-neutral-400">
                              {job.customer.rating}
                            </Text>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(job.urgency)}`}>
                        {job.urgency.toUpperCase()}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
                        {job.binType.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <Text variant="body" className="text-neutral-600 dark:text-neutral-300 mb-4">
                    {job.description}
                  </Text>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Icon name="MapPin" className="w-4 h-4 text-neutral-500" />
                      <Text variant="caption" className="text-neutral-600 dark:text-neutral-400">
                        {job.distance}
                      </Text>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Clock" className="w-4 h-4 text-neutral-500" />
                      <Text variant="caption" className="text-neutral-600 dark:text-neutral-400">
                        {job.estimatedTime}
                      </Text>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="CreditCard" className="w-4 h-4 text-neutral-500" />
                      <Text variant="caption" className="text-neutral-600 dark:text-neutral-400">
                        {job.payment.toLocaleString()} {job.currency}
                      </Text>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Truck" className="w-4 h-4 text-neutral-500" />
                      <Text variant="caption" className="text-neutral-600 dark:text-neutral-400">
                        {new Date(job.scheduledTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </Text>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 mb-4">
                    <Icon name="MapPin" className="w-4 h-4 text-neutral-500 mt-0.5" />
                    <div>
                      <Text variant="caption" className="text-neutral-600 dark:text-neutral-400">
                        {job.customer.address}
                      </Text>
                      <Text variant="caption" className="text-neutral-500 dark:text-neutral-500">
                        {job.customer.district}
                      </Text>
                    </div>
                  </div>

                  {job.requirements && job.requirements.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Icon name="AlertCircle" className="w-4 h-4 text-amber-500 mt-0.5" />
                      <div>
                        <Text variant="caption" className="text-amber-600 dark:text-amber-400 font-medium mb-1">
                          Requirements:
                        </Text>
                        <div className="flex flex-wrap gap-2">
                          {job.requirements.map((req, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 rounded text-xs bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
                            >
                              {req}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 lg:w-56">
                  {job.status === 'available' && (
                    <>
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={() => handleAcceptJob(job.id)}
                        loading={acceptingId === job.id}
                        className="w-full"
                      >
                        Accept Job
                      </Button>
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => setDeclineModal({ open: true, jobId: job.id, reason: '' })}
                        loading={decliningId === job.id}
                        className="w-full"
                      >
                        Decline
                      </Button>
                      <Button
                        variant="outline"
                        size="md"
                        onClick={() => openInMaps(job.coordinates.lat, job.coordinates.lng)}
                        className="w-full"
                      >
                        View on Map
                      </Button>
                    </>
                  )}

                  {job.status === 'accepted' && (
                    <>
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300">
                        <Icon name="CheckCircle" className="w-4 h-4" />
                        <Text variant="caption" className="font-medium">Accepted</Text>
                      </div>
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => handleStartJob(job.id)}
                        loading={startingId === job.id}
                        className="w-full"
                      >
                        Start Job
                      </Button>
                      <Button
                        variant="outline"
                        size="md"
                        onClick={() => openInMaps(job.coordinates.lat, job.coordinates.lng)}
                        className="w-full"
                      >
                        View on Map
                      </Button>
                    </>
                  )}

                  {job.status === 'in_progress' && (
                    <>
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300">
                        <Icon name="Clock" className="w-4 h-4" />
                        <Text variant="caption" className="font-medium">In Progress</Text>
                      </div>
                      <Button
                        variant="success"
                        size="md"
                        onClick={() => setCompleteModal({ open: true, jobId: job.id, weight: '', notes: '' })}
                        loading={completingId === job.id}
                        className="w-full"
                      >
                        Complete Job
                      </Button>
                    </>
                  )}

                  {job.status === 'completed' && (
                    <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      <Icon name="CheckCircle" className="w-4 h-4" />
                      <Text variant="caption" className="font-medium">Completed</Text>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <Card className="p-12 text-center">
            <Icon name="Trash" className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <Heading level={3} className="text-neutral-600 dark:text-neutral-400 mb-2">
              No jobs found
            </Heading>
            <Text variant="body" className="text-neutral-500 dark:text-neutral-500">
              Try adjusting your filters or check back later for new opportunities.
            </Text>
          </Card>
        )}

        {/* Decline Modal */}
        <Modal isOpen={declineModal.open} onClose={() => setDeclineModal({ open: false, jobId: null, reason: '' })} size="sm">
          <ModalHeader>
            <Heading level={3} className="text-neutral-900 dark:text-neutral-100">Decline Job</Heading>
          </ModalHeader>
          <ModalBody>
            <Text variant="body" className="text-neutral-700 dark:text-neutral-300 mb-3">Please provide a reason (optional):</Text>
            <textarea
              value={declineModal.reason}
              onChange={(e) => setDeclineModal(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full min-h-[100px] p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              placeholder="e.g., Out of service area, schedule conflict, etc."
            />
          </ModalBody>
          <ModalFooter>
            <div className="flex justify-end gap-2 w-full">
              <Button variant="outline" onClick={() => setDeclineModal({ open: false, jobId: null, reason: '' })}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => declineModal.jobId && handleDeclineJob(declineModal.jobId)}
                loading={decliningId === declineModal.jobId}
              >
                Confirm Decline
              </Button>
            </div>
          </ModalFooter>
        </Modal>

        {/* Complete Modal */}
        <Modal isOpen={completeModal.open} onClose={() => setCompleteModal({ open: false, jobId: null, weight: '', notes: '' })} size="sm">
          <ModalHeader>
            <Heading level={3} className="text-neutral-900 dark:text-neutral-100">Complete Job</Heading>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-3">
              <div>
                <Text variant="label" className="mb-1 block">Actual Weight (kg)</Text>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={completeModal.weight}
                  onChange={(e) => setCompleteModal(prev => ({ ...prev, weight: e.target.value }))}
                  className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  placeholder="e.g., 12.5"
                />
              </div>
              <div>
                <Text variant="label" className="mb-1 block">Notes</Text>
                <textarea
                  value={completeModal.notes}
                  onChange={(e) => setCompleteModal(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full min-h-[100px] p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  placeholder="Optional notes..."
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="flex justify-end gap-2 w-full">
              <Button variant="outline" onClick={() => setCompleteModal({ open: false, jobId: null, weight: '', notes: '' })}>Cancel</Button>
              <Button
                variant="success"
                onClick={() => completeModal.jobId && handleCompleteJob(completeModal.jobId)}
                loading={completingId === completeModal.jobId}
              >
                Confirm Complete
              </Button>
            </div>
          </ModalFooter>
        </Modal>
      </div>
    </div>
    </PrivateRoute>
  );
}

// Modals
// Decline Confirmation Modal
// Rendering at end of component file ensures presence on page
export function JobsModals() {
  return null;
}