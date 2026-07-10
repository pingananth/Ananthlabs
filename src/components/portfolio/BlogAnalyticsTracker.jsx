"use client";

import { useEffect } from "react";
import { sendGAEvent } from "@next/third-parties/google";

export default function BlogAnalyticsTracker({ articleId }) {
  useEffect(() => {
    const handleGlobalClick = (e) => {
      // Find the closest anchor tag if any
      const link = e.target.closest("a");
      if (link) {
        // Special case for calendly booking link
        if (link.href.includes("calendly.com")) {
          sendGAEvent({ event: "click_book_call", value: articleId });
        } else {
          // Generic link click in blog
          sendGAEvent({ event: "blog_link_click", value: link.href });
        }
      }
    };

    // Attach listener to document
    document.addEventListener("click", handleGlobalClick);

    return () => {
      document.removeEventListener("click", handleGlobalClick);
    };
  }, [articleId]);

  return null; // This is an invisible utility component
}
