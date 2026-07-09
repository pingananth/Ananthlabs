"use client";

import HybridTwoTool from '@/components/toastmasters/BrandCompliance/HybridTwoTool';
import TopBar from '@/components/toastmasters/TopBar';
import { useRouter } from 'next/navigation';

export default function HybridTwoPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar 
        title="Hybrid #2 (Dynamic Template) Debugger" 
        onBackToHome={() => router.push('/toastmasters')} 
        hideDownloadButtons={true} 
      />
      <main className="flex-1 p-6">
        <HybridTwoTool />
      </main>
    </div>
  );
}
