import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { pickupsApi } from '../../../services/api';
import { useAuthStore } from '../../../stores';
import PhotoCapture from '../../../components/PhotoCapture';
import type { PickupRequest } from '../../../src/types';

const PickupDetailPage: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const { user, isAuthenticated } = useAuthStore();
    const [pickup, setPickup] = useState<PickupRequest | null>(null);
    const [proofs, setProofs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadPickupData = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [pickupData, proofsData] = await Promise.all([
                pickupsApi.getPickup(Number(id)),
                pickupsApi.listProofs(Number(id)).catch(() => []) // Proof endpoints might not exist yet
            ]);
            setPickup(pickupData);
            setProofs(proofsData || []);
        } catch (e: any) {
            setError(e?.message || 'Failed to load pickup data');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'worker') {
            router.push('/auth/login');
            return;
        }

        if (id) {
            loadPickupData();
        }
    }, [id, isAuthenticated, user?.role, router, loadPickupData]);

    const handlePhotoCapture = async (file: File, type: 'before' | 'after', location?: { lat: number; lng: number }) => {
        if (!pickup) return;

        setUploading(true);
        setError(null);
        try {
            await pickupsApi.uploadProof(pickup.id, {
                file,
                type,
                latitude: location?.lat,
                longitude: location?.lng
            });
            await loadPickupData(); // Refresh to show uploaded proof
        } catch (e: any) {
            setError(e?.message || 'Failed to upload proof');
        } finally {
            setUploading(false);
        }
    };

    const updateStatus = async (newStatus: string) => {
        if (!pickup) return;

        setLoading(true);
        setError(null);
        try {
            await pickupsApi.updatePickupStatus(pickup.id, newStatus);
            await loadPickupData();
        } catch (e: any) {
            setError(e?.message || 'Failed to update status');
        } finally {
            setLoading(false);
        }
    };

    const markDelivered = async () => {
        if (!pickup) return;

        setLoading(true);
        setError(null);
        try {
            await pickupsApi.markDelivered(pickup.id);
            await loadPickupData();
        } catch (e: any) {
            setError(e?.message || 'Failed to mark delivered');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !pickup) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">Loading pickup details...</div>
            </div>
        );
    }

    if (!pickup) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center text-red-600">Pickup not found</div>
            </div>
        );
    }

    const hasBeforeProof = proofs.some(p => p.type === 'before');
    const hasAfterProof = proofs.some(p => p.type === 'after');
    const canMarkDelivered = pickup.status === 'in_progress' && hasBeforeProof && hasAfterProof;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <button
                    onClick={() => router.push('/worker/jobs')}
                    className="text-green-600 hover:text-green-700 mb-4"
                >
                    ← Back to Jobs
                </button>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Pickup #{pickup.id}
                </h1>

                <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${pickup.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                        pickup.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            pickup.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                pickup.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                                    'bg-gray-100 text-gray-800'
                        }`}>
                        {pickup.status.replace('_', ' ').toUpperCase()}
                    </span>

                    <span className="text-sm text-gray-500">
                        Created: {pickup.created_at ? new Date(pickup.created_at).toLocaleString() : 'N/A'}
                    </span>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}

            {/* Pickup Details */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="card p-6">
                    <h2 className="text-xl font-semibold mb-4">Bin Details</h2>
                    <div className="space-y-3">
                        <div>
                            <span className="text-gray-500">Location:</span>
                            <p className="font-medium">{pickup.bin_details?.label || `Bin #${pickup.bin}`}</p>
                            <p className="text-sm text-gray-600">{pickup.bin_details?.address}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Fill Level:</span>
                            <p className="font-medium">{pickup.bin_details?.fill_level || 0}%</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Capacity:</span>
                            <p className="font-medium">{pickup.bin_details?.capacity_liters || 'N/A'}L</p>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
                    <div className="space-y-3">
                        <div>
                            <span className="text-gray-500">Fee:</span>
                            <p className="font-medium text-lg">XAF {pickup.expected_fee}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Method:</span>
                            <p className="font-medium capitalize">{pickup.payment_method?.replace('_', ' ') || 'N/A'}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Status:</span>
                            <p className="font-medium capitalize">{pickup.payment_status?.replace('_', ' ') || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Job Actions */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Job Actions</h2>
                <div className="flex flex-wrap gap-3">
                    {pickup.status === 'accepted' && (
                        <button
                            onClick={() => updateStatus('in_progress')}
                            disabled={loading}
                            className="btn btn-primary"
                        >
                            Start Job
                        </button>
                    )}

                    {pickup.status === 'in_progress' && (
                        <button
                            onClick={markDelivered}
                            disabled={loading || !canMarkDelivered}
                            className="btn btn-primary"
                            title={!canMarkDelivered ? 'Upload both before and after photos first' : ''}
                        >
                            Mark Delivered
                        </button>
                    )}
                </div>
            </div>

            {/* Photo Capture Section */}
            {pickup.status === 'in_progress' && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Photo Verification</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <PhotoCapture
                            type="before"
                            onCapture={(file, location) => handlePhotoCapture(file, 'before', location)}
                            disabled={uploading || hasBeforeProof}
                        />
                        <PhotoCapture
                            type="after"
                            onCapture={(file, location) => handlePhotoCapture(file, 'after', location)}
                            disabled={uploading || hasAfterProof}
                        />
                    </div>
                </div>
            )}

            {/* Existing Proofs */}
            {proofs.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Uploaded Proofs</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {proofs.map((proof) => (
                            <div key={proof.id} className="card p-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-medium capitalize">{proof.type} Photo</h3>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${proof.status === 'approved' ? 'bg-green-100 text-green-800' :
                                        proof.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {proof.status}
                                    </span>
                                </div>

                                {proof.image_url && (
                                    <Image
                                        src={proof.image_url}
                                        alt={`${proof.type} proof`}
                                        width={500}
                                        height={192}
                                        className="w-full h-48 object-cover rounded-lg mb-3"
                                    />
                                )}

                                <div className="text-sm text-gray-600">
                                    <p>Uploaded: {new Date(proof.created_at).toLocaleString()}</p>
                                    {proof.latitude && proof.longitude && (
                                        <p>GPS: {proof.latitude}, {proof.longitude}</p>
                                    )}
                                    {proof.notes && (
                                        <p className="mt-2 text-gray-800">{proof.notes}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Notes Section */}
            {pickup.notes && (
                <div className="card p-6">
                    <h2 className="text-xl font-semibold mb-4">Notes</h2>
                    <p className="text-gray-700">{pickup.notes}</p>
                </div>
            )}
        </div>
    );
};

export default PickupDetailPage;