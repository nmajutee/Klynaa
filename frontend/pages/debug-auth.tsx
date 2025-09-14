import React from 'react';
import { useAuthStore } from '../stores';
import { useRouter } from 'next/router';

const AuthDebug = () => {
  const { user, isAuthenticated, setUser, logout } = useAuthStore();
  const router = useRouter();

  const createTestWorkerUser = () => {
    const testWorker = {
      id: 1,
      email: 'worker@test.com',
      first_name: 'Test',
      last_name: 'Worker',
      role: 'worker' as const,
      is_verified: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profile: {
        phone_number: '+1234567890',
        is_available: true
      }
    };
    setUser(testWorker);
  };

  const createTestCustomerUser = () => {
    const testCustomer = {
      id: 2,
      email: 'customer@test.com',
      first_name: 'Test',
      last_name: 'Customer',
      role: 'customer' as const,
      is_verified: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profile: {
        phone_number: '+1234567891'
      }
    };
    setUser(testCustomer);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>

      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
        </div>

        <div>
          <strong>User Data:</strong>
          <pre className="bg-gray-100 p-4 rounded mt-2 text-sm">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div>
          <strong>Current Route:</strong> {router.pathname}
        </div>

        <div className="space-y-4 pt-4">
          <div className="space-x-4">
            <button
              onClick={createTestWorkerUser}
              className="bg-purple-500 text-white px-4 py-2 rounded"
            >
              Create Test Worker User
            </button>
            <button
              onClick={createTestCustomerUser}
              className="bg-orange-500 text-white px-4 py-2 rounded"
            >
              Create Test Customer User
            </button>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>

          <div className="space-x-4">
            <button
              onClick={() => router.push('/worker/dashboard')}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Go to Worker Dashboard
            </button>
            <button
              onClick={() => router.push('/customer/dashboard')}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Go to Customer Dashboard
            </button>
            <button
              onClick={() => router.push('/auth/login')}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDebug;