import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

export default function AuthPage() {
  const router = useRouter();
  const { type } = router.query;

  useEffect(() => {
    // Redirect based on the type parameter
    if (type === 'customer') {
      router.push('/bin-owner/dashboard');
    } else if (type === 'worker') {
      router.push('/worker/dashboard');
    } else if (type === 'admin') {
      router.push('/admin/dashboard');
    } else {
      // Default redirect to login if no valid type
      router.push('/auth/login');
    }
  }, [type, router]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="mt-4 text-neutral-600 dark:text-neutral-300">
          Redirecting...
        </p>
      </div>
    </div>
  );
}