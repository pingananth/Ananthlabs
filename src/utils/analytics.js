import * as amplitude from '@amplitude/analytics-browser';
import { sendGAEvent } from '@next/third-parties/google';

const AMPLITUDE_API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
let isAmplitudeInitialized = false;

export const initAnalytics = () => {
  if (typeof window !== 'undefined' && !isAmplitudeInitialized) {
    amplitude.init(AMPLITUDE_API_KEY, {
      defaultTracking: true,
    });
    isAmplitudeInitialized = true;
  }
};

export const trackEvent = (eventName, properties = {}) => {
  // Ensure initialized
  if (!isAmplitudeInitialized) {
    initAnalytics();
  }

  // 1. Send to Amplitude
  if (typeof window !== 'undefined') {
    amplitude.track(eventName, properties);
  }

  // 2. Send to Google Analytics
  sendGAEvent({ event: eventName, ...properties });
};
