import React from 'react';
import YoloTestTool from '@/components/toastmasters/BrandCompliance/YoloTestTool';

export const metadata = {
  title: 'YOLO Model Test - Toastmasters Brand Compliance',
  description: 'Test page for Roboflow YOLO API Integration.',
};

export default function YoloTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <YoloTestTool />
      </div>
    </div>
  );
}
