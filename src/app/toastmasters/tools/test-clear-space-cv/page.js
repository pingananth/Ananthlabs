"use client";

import OpenCVClearSpaceTool from '@/components/toastmasters/BrandCompliance/OpenCVClearSpaceTool';
import TopBar from '@/components/toastmasters/TopBar';
import { useRouter } from 'next/navigation';

export default function TestClearSpaceCVPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar 
        title="OpenCV Clear Space Tool" 
        onBackToHome={() => router.push('/toastmasters')} 
        hideDownloadButtons={true} 
      />
      <main className="flex-1 p-6">
        <OpenCVClearSpaceTool />
      </main>
    </div>
  );
}
