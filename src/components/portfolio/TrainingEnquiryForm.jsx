"use client";

import { useState } from "react";
import { siteData } from "@/lib/data";
import { trackEvent } from "@/utils/analytics";

const inputClass =
  "w-full bg-[#0a0a0a] border border-[#333333] p-3 text-white focus:outline-none focus:border-white transition-colors";
const labelClass = "text-sm font-medium text-[#a1a1aa]";

export default function TrainingEnquiryForm() {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const { programs, calendlyUrl } = siteData.training;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    const form = e.target;
    trackEvent("form_submit", { form_name: "training_inquiry", program: form.program.value });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "training_inquiry",
          name: form.name.value,
          email: form.email.value,
          organization: form.organization.value,
          program: form.program.value,
          teamSize: form.teamSize.value,
          format: form.format.value,
          timeline: form.timeline.value,
          message: form.message.value,
        }),
      });

      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="max-w-2xl mx-auto border border-[#333333] bg-[#0a0a0a] p-8 text-center flex flex-col gap-4">
        <h3 className="text-2xl font-bold text-white">Thanks, enquiry received.</h3>
        <p className="text-[#a1a1aa]">
          I will reply within 48 hours with next steps. Want to move faster? Pick a slot for a discovery call.
        </p>
        <a
          href={calendlyUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("click_book_call", { location: "training_form_success" })}
          className="mx-auto bg-white text-black px-6 py-3 font-semibold hover:bg-gray-200 transition-colors"
        >
          [ Book a Discovery Call ]
        </a>
      </div>
    );
  }

  return (
    <form className="max-w-2xl mx-auto space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="t-name" className={labelClass}>Full Name</label>
          <input type="text" id="t-name" name="name" required className={inputClass} placeholder="Jane Doe" />
        </div>
        <div className="space-y-2">
          <label htmlFor="t-email" className={labelClass}>Work Email</label>
          <input type="email" id="t-email" name="email" required className={inputClass} placeholder="jane@company.com" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="t-org" className={labelClass}>Company</label>
          <input type="text" id="t-org" name="organization" required className={inputClass} placeholder="Company name" />
        </div>
        <div className="space-y-2">
          <label htmlFor="t-program" className={labelClass}>Program of Interest</label>
          <select id="t-program" name="program" className={`${inputClass} appearance-none`}>
            {programs.map((p) => (
              <option key={p.id} value={p.title}>{p.title}</option>
            ))}
            <option value="Consulting">AI Consulting / Pilot Build</option>
            <option value="Not sure">Not sure yet</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label htmlFor="t-size" className={labelClass}>Team Size</label>
          <select id="t-size" name="teamSize" className={`${inputClass} appearance-none`}>
            <option>1–10</option>
            <option>11–25</option>
            <option>26–50</option>
            <option>50+</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="t-format" className={labelClass}>Format</label>
          <select id="t-format" name="format" className={`${inputClass} appearance-none`}>
            <option>Online</option>
            <option>Onsite</option>
            <option>Either</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="t-timeline" className={labelClass}>Timeline</label>
          <select id="t-timeline" name="timeline" className={`${inputClass} appearance-none`}>
            <option>This month</option>
            <option>1–3 months</option>
            <option>3+ months</option>
            <option>Just exploring</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="t-message" className={labelClass}>What should your team be able to do after the training?</label>
        <textarea id="t-message" name="message" rows={4} className={`${inputClass} resize-none`} placeholder="e.g. Our 20 backend engineers should use Claude Code daily on our Java services..." />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-400">
          Something went wrong. Please try again, or{" "}
          <a href={calendlyUrl} target="_blank" rel="noopener noreferrer" className="underline">book a call directly</a>.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-white text-black font-bold py-4 hover:bg-gray-200 transition-colors disabled:opacity-50"
      >
        {status === "loading" ? "Sending..." : "[ Request a Training Proposal ]"}
      </button>
    </form>
  );
}
