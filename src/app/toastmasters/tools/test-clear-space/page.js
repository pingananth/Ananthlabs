"use client";

import TestClearSpaceTool from '@/components/toastmasters/BrandCompliance/TestClearSpaceTool';
import TopBar from '@/components/toastmasters/TopBar';
import { useRouter } from 'next/navigation';

export default function TestClearSpacePage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar 
        title="Clear Space Debugger" 
        onBackToHome={() => router.push('/toastmasters')} 
        hideDownloadButtons={true} 
      />
      <main className="flex-1 p-6">
        <TestClearSpaceTool />
      </main>
    </div>
  );
}
