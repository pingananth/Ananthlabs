"use client";

import HybridOneTool from '@/components/toastmasters/BrandCompliance/HybridOneTool';
import TopBar from '@/components/toastmasters/TopBar';
import { useRouter } from 'next/navigation';

export default function HybridOnePage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar 
        title="Hybrid #1 (Color Geometry) Debugger" 
        onBackToHome={() => router.push('/toastmasters')} 
        hideDownloadButtons={true} 
      />
      <main className="flex-1 p-6">
        <HybridOneTool />
      </main>
    </div>
  );
}
