"use client";

import UnifiedBrandChecker from '@/components/toastmasters/BrandCompliance/UnifiedBrandChecker';
import TopBar from '@/components/toastmasters/TopBar';
import { useRouter } from 'next/navigation';

export default function BrandCompliancePage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar 
        title="Brand Compliance Checker" 
        onBackToHome={() => router.push('/toastmasters')} 
        hideDownloadButtons={true} 
      />
      <main className="flex-1 p-0">
        <UnifiedBrandChecker />
      </main>
    </div>
  );
}
