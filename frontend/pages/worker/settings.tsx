import React, { useState } from 'react';
import Head from 'next/head';
import WorkerLayout from '../../components/WorkerLayout';
import { useAuthStore } from '../../stores';
import { useRouter } from 'next/router';
import {
    UserCircleIcon,
    CameraIcon,
    MapPinIcon,
    PhoneIcon,
    BellIcon,
    PowerIcon,
    ArrowRightOnRectangleIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    PencilIcon
} from '@heroicons/react/24/outline';
import { authApi } from '../../services/api';

const Settings = () => {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [workerStatus, setWorkerStatus] = useState<'active' | 'offline'>('active');
    const [notifications, setNotifications] = useState({
        newPickups: true,
        messages: true,
        earnings: false,
        systemUpdates: true
    });

    // Mock user profile data - replace with actual data
    const [profile, setProfile] = useState({
        firstName: user?.first_name || '',
        lastName: user?.last_name || '',
        email: user?.email || '',
        phone: '+237 6XX XXX XXX',
        address: 'Douala, Cameroon',
        latitude: 4.0511,
        longitude: 9.7679,
        profilePhoto: null,
        verificationStatus: 'verified' as 'pending' | 'verified' | 'rejected',
        documents: {
            idCard: 'uploaded',
            drivingLicense: 'uploaded',
            backgroundCheck: 'verified'
        }
    });

    const handleLogout = async () => {
        if (confirm('Are you sure you want to logout?')) {
            try {
                await authApi.logout();
                logout();
                router.push('/');
            } catch (error) {
                console.error('Logout error:', error);
                logout();
                router.push('/');
            }
        }
    };

    const handleSaveProfile = () => {
        // TODO: Implement API call to save profile
        console.log('Saving profile:', profile);
        setIsEditing(false);
        alert('Profile updated successfully!');
    };

    const handleLocationUpdate = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setProfile({
                    ...profile,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
                alert('Location updated successfully!');
            });
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    };

    const handleNotificationToggle = (key: keyof typeof notifications) => {
        setNotifications({
            ...notifications,
            [key]: !notifications[key]
        });
    };

    const getVerificationStatusColor = (status: string) => {
        switch (status) {
            case 'verified':
                return 'text-green-600 bg-green-100';
            case 'pending':
                return 'text-yellow-600 bg-yellow-100';
            case 'rejected':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getVerificationIcon = (status: string) => {
        switch (status) {
            case 'verified':
                return <CheckCircleIcon className="h-4 w-4" />;
            case 'pending':
                return <ExclamationTriangleIcon className="h-4 w-4" />;
            case 'rejected':
                return <ExclamationTriangleIcon className="h-4 w-4" />;
            default:
                return null;
        }
    };

    return (
        <WorkerLayout>
            <Head>
                <title>Account & Settings - Worker Portal</title>
            </Head>

            <div className="py-6">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Account & Settings</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Manage your profile, verification status, and preferences
                        </p>
                    </div>

                    <div className="space-y-8">
                        {/* Profile Section */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
                                <button
                                    onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                >
                                    <PencilIcon className="h-4 w-4" />
                                    <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Profile Photo */}
                                <div className="text-center">
                                    <div className="relative mx-auto h-32 w-32 mb-4">
                                        <div className="h-32 w-32 bg-gray-300 rounded-full flex items-center justify-center">
                                            <UserCircleIcon className="h-20 w-20 text-gray-500" />
                                        </div>
                                        {isEditing && (
                                            <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700">
                                                <CameraIcon className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                    <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getVerificationStatusColor(profile.verificationStatus)}`}>
                                        {getVerificationIcon(profile.verificationStatus)}
                                        <span className="capitalize">{profile.verificationStatus}</span>
                                    </div>
                                </div>

                                {/* Profile Fields */}
                                <div className="md:col-span-2 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                value={profile.firstName}
                                                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                                disabled={!isEditing}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                value={profile.lastName}
                                                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                                disabled={!isEditing}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={profile.email}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                            disabled={!isEditing}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number
                                        </label>
                                        <div className="flex">
                                            <input
                                                type="tel"
                                                value={profile.phone}
                                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                                disabled={!isEditing}
                                                className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                            />
                                            <div className="flex items-center px-3 bg-gray-50 border border-l-0 border-gray-300 rounded-r-md">
                                                <PhoneIcon className="h-4 w-4 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Address
                                        </label>
                                        <div className="flex">
                                            <input
                                                type="text"
                                                value={profile.address}
                                                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                                disabled={!isEditing}
                                                className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                            />
                                            <button
                                                onClick={handleLocationUpdate}
                                                className="flex items-center px-3 bg-blue-50 border border-l-0 border-gray-300 rounded-r-md hover:bg-blue-100 transition-colors"
                                            >
                                                <MapPinIcon className="h-4 w-4 text-blue-600" />
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Current location: {profile.latitude.toFixed(4)}, {profile.longitude.toFixed(4)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Work Status */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Work Status</h2>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Current Status</p>
                                    <p className="text-sm text-gray-600">
                                        {workerStatus === 'active' ? 'You are currently active and receiving pickup requests' : 'You are offline and not receiving pickup requests'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setWorkerStatus(workerStatus === 'active' ? 'offline' : 'active')}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                        workerStatus === 'active'
                                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                                    }`}
                                >
                                    <PowerIcon className="h-4 w-4" />
                                    <span>{workerStatus === 'active' ? 'Go Offline' : 'Go Active'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Notification Preferences */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h2>
                            <div className="space-y-4">
                                {Object.entries(notifications).map(([key, enabled]) => (
                                    <div key={key} className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {key === 'newPickups' && 'New Pickup Requests'}
                                                {key === 'messages' && 'New Messages'}
                                                {key === 'earnings' && 'Earnings Updates'}
                                                {key === 'systemUpdates' && 'System Notifications'}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {key === 'newPickups' && 'Get notified when new pickup opportunities are available'}
                                                {key === 'messages' && 'Receive alerts for new customer messages'}
                                                {key === 'earnings' && 'Updates about payments and earnings'}
                                                {key === 'systemUpdates' && 'Important system announcements and updates'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleNotificationToggle(key as keyof typeof notifications)}
                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                                enabled ? 'bg-blue-600' : 'bg-gray-200'
                                            }`}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                    enabled ? 'translate-x-5' : 'translate-x-0'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Verification Documents */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Verification Documents</h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm font-medium text-gray-900">National ID Card</span>
                                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                                        <CheckCircleIcon className="mr-1 h-3 w-3" />
                                        Verified
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm font-medium text-gray-900">Driving License</span>
                                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                                        <CheckCircleIcon className="mr-1 h-3 w-3" />
                                        Verified
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm font-medium text-gray-900">Background Check</span>
                                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                                        <CheckCircleIcon className="mr-1 h-3 w-3" />
                                        Verified
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-white rounded-lg shadow p-6 border border-red-200">
                            <h2 className="text-lg font-medium text-red-900 mb-4">Account Actions</h2>
                            <div className="space-y-4">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                                >
                                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                                    <span>Logout</span>
                                </button>
                                <p className="text-sm text-red-600">
                                    This will log you out and redirect you to the home page.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </WorkerLayout>
    );
};

export default Settings;