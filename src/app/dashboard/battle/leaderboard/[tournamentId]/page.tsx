'use client';

// This route is kept for backward compatibility.
// The new system uses match-based results at /dashboard/battle/results/[matchId]

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LegacyLeaderboardPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    // Redirect to results if we have an ID that looks like a matchId
    const id = params.tournamentId as string;
    if (id) {
      router.replace(`/dashboard/battle/results/${id}`);
    } else {
      router.replace('/dashboard/battle');
    }
  }, [params, router]);

  return null;
}
