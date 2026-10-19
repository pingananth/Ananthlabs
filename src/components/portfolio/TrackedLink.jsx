"use client";

import { trackEvent } from "@/utils/analytics";

// Anchor that fires an analytics event on click. Lets server pages track CTAs.
export default function TrackedLink({ event, eventProps = {}, children, ...props }) {
  return (
    <a {...props} onClick={() => trackEvent(event, eventProps)}>
      {children}
    </a>
  );
}
