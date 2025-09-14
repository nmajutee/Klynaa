import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { pickupsApi } from '../../services/api';
import { useAuthStore } from '../../stores';
import type { PickupRequest } from '../../src/types';

interface WorkerAvailabilityResponse {
    available_pickups: PickupRequest[];
    worker_status: {
        pending_count: number;
        max_pickups: number;
        can_accept_more: boolean;
        service_radius_km: number;
    };
}

const WorkerJobsPage: React.FC = () => {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [availabilityData, setAvailabilityData] = useState<WorkerAvailabilityResponse | null>(null);
    const [myJobs, setMyJobs] = useState<PickupRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'worker') {
            router.push('/auth/login');
            return;
        }
        loadData();
    }, [isAuthenticated, user?.role, router]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [available, mine] = await Promise.all([
                pickupsApi.available(),
                pickupsApi.myPickups()
            ]);
            setAvailabilityData(available);
            setMyJobs(mine);
        } catch (e: any) {
            setError(e?.message || 'Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    const acceptJob = async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            await pickupsApi.acceptPickup(id);
            await loadData(); // Refresh data
        } catch (e: any) {
            setError(e?.message || 'Failed to accept job');
        } finally {
            setLoading(false);
        }
    };

    const startJob = async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            await pickupsApi.updatePickupStatus(id, 'in_progress');
            await loadData();
        } catch (e: any) {
            setError(e?.message || 'Failed to start job');
        } finally {
            setLoading(false);
        }
    };

    const markDelivered = async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            await pickupsApi.markDelivered(id);
            await loadData();
        } catch (e: any) {
            setError(e?.message || 'Failed to mark delivered');
        } finally {
            setLoading(false);
        }
    };

    const activeJobs = myJobs.filter(job =>
        ['accepted', 'in_progress', 'delivered'].includes(job.status)
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Worker Dashboard</h1>
                {availabilityData?.worker_status && (
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span>Pending: {availabilityData.worker_status.pending_count}/{availabilityData.worker_status.max_pickups}</span>
                        <span>Service Radius: {availabilityData.worker_status.service_radius_km}km</span>
                        <span className={`px-2 py-1 rounded ${availabilityData.worker_status.can_accept_more ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {availabilityData.worker_status.can_accept_more ? 'Available' : 'At Capacity'}
                        </span>
                    </div>
                )}
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}

            {loading && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
                    Loading...
                </div>
            )}

            {/* Available Jobs */}
            <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Available Jobs Near You
                    {availabilityData?.available_pickups && (
                        <span className="ml-2 text-lg text-gray-500">
                            ({availabilityData.available_pickups.length})
                        </span>
                    )}
                </h2>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {availabilityData?.available_pickups.map((pickup) => (
                        <div key={pickup.id} className="card p-6 hover:shadow-lg transition-shadow">
                            <div className="mb-3">
                                <h3 className="font-semibold text-lg text-gray-900">
                                    {pickup.bin_details?.label || `Bin #${pickup.bin}`}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    {pickup.bin_details?.address || 'Address not available'}
                                </p>
                            </div>

                            <div className="mb-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Payment:</span>
                                    <span className="font-medium">XAF {pickup.expected_fee}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Method:</span>
                                    <span className="capitalize">{pickup.payment_method?.replace('_', ' ') || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Fill Level:</span>
                                    <span>{pickup.bin_details?.fill_level || 0}%</span>
                                </div>
                            </div>

                            {pickup.notes && (
                                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-700">{pickup.notes}</p>
                                </div>
                            )}

                            <button
                                className="btn btn-primary w-full"
                                onClick={() => acceptJob(pickup.id)}
                                disabled={loading || !availabilityData?.worker_status.can_accept_more}
                            >
                                {loading ? 'Accepting...' : 'Accept Job'}
                            </button>
                        </div>
                    ))}

                    {availabilityData?.available_pickups.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            <p className="text-lg">No jobs available in your area right now.</p>
                            <p className="text-sm mt-2">Check back later or expand your service radius.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Active Jobs */}
            <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    My Active Jobs ({activeJobs.length})
                </h2>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {activeJobs.map((pickup) => (
                        <div key={pickup.id} className="card p-6 border-l-4 border-l-green-500">
                            <div className="mb-3">
                                <h3 className="font-semibold text-lg text-gray-900">
                                    {pickup.bin_details?.label || `Bin #${pickup.bin}`}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    {pickup.bin_details?.address || 'Address not available'}
                                </p>
                            </div>

                            <div className="mb-4">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${pickup.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                                    pickup.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                        pickup.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                            'bg-gray-100 text-gray-800'
                                    }`}>
                                    {pickup.status.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>

                            <div className="mb-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Payment:</span>
                                    <span className="font-medium">XAF {pickup.expected_fee}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Created:</span>
                                    <span>{pickup.created_at ? new Date(pickup.created_at).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {pickup.status === 'accepted' && (
                                    <button
                                        className="btn btn-secondary w-full"
                                        onClick={() => startJob(pickup.id)}
                                        disabled={loading}
                                    >
                                        Start Job
                                    </button>
                                )}

                                {pickup.status === 'in_progress' && (
                                    <button
                                        className="btn btn-primary w-full"
                                        onClick={() => markDelivered(pickup.id)}
                                        disabled={loading}
                                    >
                                        Mark Delivered
                                    </button>
                                )}

                                <button
                                    className="btn btn-outline w-full text-sm"
                                    onClick={() => router.push(`/worker/pickups/${pickup.id}`)}
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}

                    {activeJobs.length === 0 && (
                        <div className="col-span-full text-center py-8 text-gray-500">
                            <p>No active jobs. Accept available jobs to get started!</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default WorkerJobsPage;