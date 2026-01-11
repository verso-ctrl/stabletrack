'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SchedulePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to calendar (unified schedule view)
    router.replace('/calendar');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-stone-500">Redirecting to schedule...</p>
    </div>
  );
}
