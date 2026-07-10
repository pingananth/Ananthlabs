"use client";

import { useState } from "react";
import { trackEvent } from "@/utils/analytics";

export default function NewsletterForm() {
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    trackEvent("form_submit", { form_name: "newsletter_subscribe" });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "newsletter_subscribe",
          email: e.target.email.value,
        }),
      });

      if (res.ok) {
        setStatus("success");
        e.target.reset();
        alert("Thanks for subscribing! You'll hear from me soon.");
      } else {
        setStatus("error");
        alert("Failed to subscribe. Please try again later.");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
      alert("An error occurred.");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="my-8 p-6 bg-[#111111] border border-[#333333] rounded-lg text-center">
      <h3 className="text-xl font-bold text-white mb-2">Subscribe to my Newsletter</h3>
      <p className="text-[#a1a1aa] mb-4">Get the latest product teardowns and frameworks delivered to your inbox.</p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
        <input 
          type="email" 
          name="email" 
          placeholder="Your email address" 
          required 
          className="flex-1 bg-[#0a0a0a] border border-[#333333] p-3 text-white focus:outline-none focus:border-white transition-colors" 
        />
        <button 
          type="submit" 
          disabled={status === "loading"}
          className="bg-white text-black font-bold px-6 py-3 hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {status === "loading" ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
    </div>
  );
}
