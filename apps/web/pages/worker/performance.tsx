import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, StatsCard } from '../../src/design-system/components/Card';
import { Heading, Text } from '../../src/design-system/components/Typography';
import { Icons } from '../../src/design-system/components/Icons';
import { enhancedWorkerDashboardApi } from '../../services/enhancedWorkerDashboardApi';
import PrivateRoute from '../../components/PrivateRoute';

const PerformancePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<any | null>(null);
  const [completed, setCompleted] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [ov, comp] = await Promise.all([
          enhancedWorkerDashboardApi.getOverview(),
          enhancedWorkerDashboardApi.getCompletedPickups(10),
        ]);
        if (!mounted) return;
        setOverview(ov.data);
        setCompleted(comp.data.completed_pickups || []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load performance');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const metrics = useMemo(() => {
    if (!overview) {
      return { completionRate: 0, onTimeRate: 0, customerRating: 0, jobsCompleted: 0 };
    }
    return {
      completionRate: Math.round(((overview.quick_stats.completed_this_month || 0) / Math.max(overview.quick_stats.completed_this_month || 1, 1)) * 100),
      onTimeRate: 0, // backend does not provide; keep placeholder for now
      customerRating: overview.overview_cards.average_rating.value || 0,
      jobsCompleted: overview.overview_cards.completed_pickups.value || 0,
    };
  }, [overview]);

  type Review = { id: string; name: string; rating: number; comment: string; date: string };
  const reviews: Review[] = useMemo(() => {
    return completed
      .filter((p: any) => p.rating && typeof p.rating.rating === 'number')
      .map((p: any) => ({
        id: String(p.id),
        name: p.owner_name,
        rating: p.rating.rating,
        comment: p.rating.comment || '—',
        date: p.completed_date,
      }));
  }, [completed]);

  return (
    <PrivateRoute requiredRole="worker">
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Heading level={1} className="mb-1 text-neutral-900 dark:text-neutral-100">Performance</Heading>
          <Text variant="body" className="text-neutral-600 dark:text-neutral-300">Your performance metrics and feedback</Text>
        </div>

        {error && (
          <Card className="mb-4">
            <CardContent>
              <Text variant="body" className="text-red-600 dark:text-red-400">{error}</Text>
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card className="mb-6">
            <CardContent>
              <Text variant="body" className="text-neutral-600 dark:text-neutral-300">Loading performance...</Text>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatsCard title="Completion Rate" value={`${metrics.completionRate}%`} />
          <StatsCard title="On-time Rate" value={`${metrics.onTimeRate}%`} />
          <StatsCard title="Customer Rating" value={`${metrics.customerRating}★`} />
          <StatsCard title="Jobs Completed" value={metrics.jobsCompleted} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent>
              <Text variant="label" className="mb-4 block">Recent Feedback</Text>
              <div className="space-y-4">
                {reviews.length === 0 && !loading && (
                  <div className="p-3 rounded-md border bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-center">
                    <Text variant="body" className="text-neutral-600 dark:text-neutral-400">No recent reviews</Text>
                  </div>
                )}
                {reviews.map((r) => (
                  <div key={r.id} className="p-3 rounded-md border bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between">
                      <Text variant="body" className="text-neutral-900 dark:text-neutral-100">{r.name}</Text>
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Icons.Star key={i} className={`h-4 w-4 ${i < r.rating ? 'text-amber-500' : 'text-neutral-300'}`} />
                        ))}
                      </div>
                    </div>
                    <Text variant="caption" className="text-neutral-600 dark:text-neutral-400">{r.date}</Text>
                    <Text variant="body" className="text-neutral-700 dark:text-neutral-300 mt-2">{r.comment}</Text>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Text variant="label" className="mb-4 block">Achievements</Text>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-md border bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-center">
                  <Icons.CheckCircle className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                  <Text variant="body">100 Jobs Completed</Text>
                </div>
                <div className="p-4 rounded-md border bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-center">
                  <Icons.TrendingUp className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                  <Text variant="body">Top Performer</Text>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </PrivateRoute>
  );
};

export default PerformancePage;
