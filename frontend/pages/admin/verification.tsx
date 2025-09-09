import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { pickupsApi } from '../../services/api';
import { useAuthStore } from '../../stores';

interface Proof {
    id: number;
    pickup: number;
    type: 'before' | 'after';
    image_url: string;
    latitude?: string;
    longitude?: string;
    captured_by: number;
    captured_by_name?: string;
    status: 'pending' | 'approved' | 'rejected';
    notes?: string;
    created_at: string;
}

const AdminVerificationPage: React.FC = () => {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [proofs, setProofs] = useState<Proof[]>([]);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [notes, setNotes] = useState<Record<number, string>>({});

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'admin') {
            router.replace('/auth/login');
            return;
        }
        loadPendingProofs();
    }, [isAuthenticated, user?.role, router]);

    const loadPendingProofs = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await pickupsApi.pendingVerifications();
            setProofs(response.proofs || []);
        } catch (e: any) {
            setError(e?.message || 'Failed to load pending verifications');
        } finally {
            setLoading(false);
        }
    };

    const handleVerification = async (pickupId: number, proofId: number, decision: 'approve' | 'reject') => {
        setProcessing(proofId);
        setError(null);
        try {
            await pickupsApi.verifyProof(pickupId, proofId, decision, notes[proofId] || '');
            await loadPendingProofs(); // Refresh the list

            // Clear the notes for this proof
            setNotes(prev => {
                const newNotes = { ...prev };
                delete newNotes[proofId];
                return newNotes;
            });
        } catch (e: any) {
            setError(e?.message || 'Failed to process verification');
        } finally {
            setProcessing(null);
        }
    };

    const updateNotes = (proofId: number, value: string) => {
        setNotes(prev => ({ ...prev, [proofId]: value }));
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Proof Verification</h1>
                <p className="text-gray-600">Review and verify worker-submitted photos for pickup completion.</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}

            {loading && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
                    Loading pending verifications...
                </div>
            )}

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="card p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">{proofs.length}</div>
                    <div className="text-sm text-gray-600">Pending Reviews</div>
                </div>
                <div className="card p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                        {proofs.filter(p => p.type === 'before').length}
                    </div>
                    <div className="text-sm text-gray-600">Before Photos</div>
                </div>
                <div className="card p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                        {proofs.filter(p => p.type === 'after').length}
                    </div>
                    <div className="text-sm text-gray-600">After Photos</div>
                </div>
            </div>

            {/* Proof Cards */}
            {proofs.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-500">
                    <div className="text-6xl mb-4">✅</div>
                    <h3 className="text-xl font-medium mb-2">All caught up!</h3>
                    <p>No pending proof verifications at this time.</p>
                </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {proofs.map((proof) => (
                    <div key={proof.id} className="card overflow-hidden">
                        {/* Image */}
                        <div className="relative">
                            <img
                                src={proof.image_url}
                                alt={`${proof.type} proof`}
                                className="w-full h-48 object-cover"
                            />
                            <div className="absolute top-2 left-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${proof.type === 'before'
                                        ? 'bg-orange-100 text-orange-800'
                                        : 'bg-blue-100 text-blue-800'
                                    }`}>
                                    {proof.type.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            <div className="mb-3">
                                <h3 className="font-medium text-lg">Pickup #{proof.pickup}</h3>
                                <p className="text-sm text-gray-600">
                                    By: {proof.captured_by_name || `Worker ${proof.captured_by}`}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {new Date(proof.created_at).toLocaleString()}
                                </p>
                            </div>

                            {/* GPS Info */}
                            {proof.latitude && proof.longitude && (
                                <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
                                    <span className="text-gray-500">📍 GPS:</span>
                                    <span className="font-mono text-xs ml-1">
                                        {parseFloat(proof.latitude).toFixed(6)}, {parseFloat(proof.longitude).toFixed(6)}
                                    </span>
                                </div>
                            )}

                            {/* Notes Input */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Admin Notes (optional)
                                </label>
                                <textarea
                                    value={notes[proof.id] || ''}
                                    onChange={(e) => updateNotes(proof.id, e.target.value)}
                                    placeholder="Add verification notes..."
                                    className="form-input w-full text-sm"
                                    rows={2}
                                    disabled={processing === proof.id}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleVerification(proof.pickup, proof.id, 'approve')}
                                    disabled={processing === proof.id}
                                    className="btn btn-primary flex-1 text-sm"
                                >
                                    {processing === proof.id ? (
                                        <span className="inline-block animate-spin mr-1">⏳</span>
                                    ) : (
                                        '✅'
                                    )} Approve
                                </button>

                                <button
                                    onClick={() => handleVerification(proof.pickup, proof.id, 'reject')}
                                    disabled={processing === proof.id}
                                    className="btn btn-secondary flex-1 text-sm"
                                >
                                    {processing === proof.id ? (
                                        <span className="inline-block animate-spin mr-1">⏳</span>
                                    ) : (
                                        '❌'
                                    )} Reject
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Refresh Button */}
            <div className="mt-8 text-center">
                <button
                    onClick={loadPendingProofs}
                    disabled={loading}
                    className="btn btn-outline"
                >
                    {loading ? 'Refreshing...' : '🔄 Refresh'}
                </button>
            </div>
        </div>
    );
};

export default AdminVerificationPage;