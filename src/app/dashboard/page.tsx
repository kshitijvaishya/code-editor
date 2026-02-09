'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Profile from '@/components/Profile';
import CodeEditor from '@/components/CodeEditor';

export const dynamic = 'force-dynamic';

type View = 'profile' | 'editor';

function DashboardContent() {
  const searchParams = useSearchParams();
  const [activeView, setActiveView] = useState<View>('profile');

  useEffect(() => {
    const view = searchParams.get('view') as View;
    if (view === 'profile' || view === 'editor') {
      setActiveView(view);
    }
  }, [searchParams]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        {activeView === 'profile' && <Profile />}
        {activeView === 'editor' && (
          <div className="h-full">
            <CodeEditor />
          </div>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
