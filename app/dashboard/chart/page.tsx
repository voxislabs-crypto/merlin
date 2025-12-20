'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { BirthChartDisplay } from '@/components/astrology/BirthChartDisplay';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function BirthChartPage() {
  const { isLoaded, userId, getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!userId) {
      router.push('/sign-in');
      return;
    }
    
    setLoading(false);
  }, [isLoaded, userId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 text-lg mb-4">Error loading birth chart</div>
        <div className="text-gray-600 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Your Birth Chart</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <BirthChartDisplay />
      </div>
    </div>
  );
}
