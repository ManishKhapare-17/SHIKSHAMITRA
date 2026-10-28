'use client';

import { Suspense } from 'react';
import TutorClient from './TutorClient';

export default function TutorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    }>
      <TutorClient />
    </Suspense>
  );
}
