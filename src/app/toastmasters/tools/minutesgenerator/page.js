"use client";
import React from 'react';
import MinutesGenerator from '@/components/toastmasters/MinutesGenerator/MinutesGenerator';
import { useRouter } from 'next/navigation';

export default function MinutesGeneratorPage() {
    const router = useRouter();

    return (
        <MinutesGenerator onBackToHome={() => router.push('/toastmasters')} />
    );
}
