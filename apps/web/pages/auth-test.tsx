import React, { useState } from 'react';
import { useAuth } from '@klynaa/api';
import type { LoginCredentials, RegisterData } from '@klynaa/api';

export default function AuthTestPage() {
  const auth = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loginForm, setLoginForm] = useState<LoginCredentials>({
    identifier: '',
    password: '',
  });
  const [registerForm, setRegisterForm] = useState<RegisterData>({
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    role: 'customer',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await auth.loginAsync(loginForm);
      alert('Login successful!');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed: ' + (error as any)?.response?.data?.detail || 'Unknown error');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirm_password) {
      alert('Passwords do not match');
      return;
    }
    try {
      await auth.registerAsync(registerForm);
      alert('Registration successful!');
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed: ' + (error as any)?.response?.data?.detail || 'Unknown error');
    }
  };

  const handleLogout = () => {
    auth.logout();
    alert('Logged out successfully');
  };

  if (auth.isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          🧪 Klynaa Auth Test
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Testing Django Backend Integration
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {auth.isAuthenticated ? (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-md">
                <h3 className="text-lg font-medium text-green-800">✅ Authentication Successful!</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p><strong>Email:</strong> {auth.user?.email}</p>
                  <p><strong>Name:</strong> {auth.user?.first_name} {auth.user?.last_name}</p>
                  <p><strong>Role:</strong> {auth.user?.role}</p>
                  <p><strong>ID:</strong> {auth.user?.id}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
                  <button
                    onClick={() => setMode('login')}
                    className={`flex-1 text-center py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                      mode === 'login'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setMode('register')}
                    className={`flex-1 text-center py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                      mode === 'register'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Register
                  </button>
                </div>
              </div>

              {mode === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                      Email or Username
                    </label>
                    <input
                      id="identifier"
                      type="text"
                      required
                      value={loginForm.identifier}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, identifier: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={auth.isLoggingIn}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {auth.isLoggingIn ? 'Logging in...' : 'Login'}
                  </button>
                  {auth.loginError && (
                    <div className="text-red-600 text-sm mt-2">
                      Login failed: {(auth.loginError as any)?.response?.data?.detail || 'Unknown error'}
                    </div>
                  )}
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                        First Name
                      </label>
                      <input
                        id="first_name"
                        type="text"
                        required
                        value={registerForm.first_name}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, first_name: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                        Last Name
                      </label>
                      <input
                        id="last_name"
                        type="text"
                        required
                        value={registerForm.last_name}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, last_name: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="register_password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      id="register_password"
                      type="password"
                      required
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                      Confirm Password
                    </label>
                    <input
                      id="confirm_password"
                      type="password"
                      required
                      value={registerForm.confirm_password}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <select
                      id="role"
                      value={registerForm.role}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, role: e.target.value as 'customer' | 'worker' }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="customer">Customer</option>
                      <option value="worker">Worker</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={auth.isRegistering}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {auth.isRegistering ? 'Creating Account...' : 'Create Account'}
                  </button>
                  {auth.registerError && (
                    <div className="text-red-600 text-sm mt-2">
                      Registration failed: {(auth.registerError as any)?.response?.data?.detail || 'Unknown error'}
                    </div>
                  )}
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}