"use client";

import { useEffect } from "react";
import { trackEvent } from "@/utils/analytics";

export default function BlogAnalyticsTracker({ articleId }) {
  useEffect(() => {
    const handleGlobalClick = (e) => {
      // Find the closest anchor tag if any
      const link = e.target.closest("a");
      if (link) {
        // Special case for calendly booking link
        if (link.href.includes("calendly.com")) {
          trackEvent("click_book_call", { article_id: articleId });
        } else {
          // Generic link click in blog
          trackEvent("blog_link_click", { url: link.href });
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
