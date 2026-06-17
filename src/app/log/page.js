"use client";

import { useState } from "react";
import { siteData } from "@/lib/data";
import Image from "next/image";

export default function VisualLog() {
  const [filter, setFilter] = useState("All");

  const filters = ["All", "Leading", "Exploring", "Building"];

  const filteredLogs = filter === "All" 
    ? siteData.visualLogs 
    : siteData.visualLogs.filter(log => log.type === filter);

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-white">Visual Log</h1>
        <p className="text-[#a1a1aa] max-w-2xl">
          An artifact timeline of events, travels, and builds.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-4 border-b border-[#333333] pb-4">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-sm font-mono uppercase tracking-widest px-4 py-2 transition-colors ${
              filter === f 
                ? "bg-white text-black font-bold" 
                : "text-[#a1a1aa] hover:text-white hover:bg-[#111111]"
            }`}
          >
            [ {f} ]
          </button>
        ))}
      </div>

      {/* Masonry Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {filteredLogs.map((log) => (
          <div 
            key={log.id} 
            className={`relative break-inside-avoid border border-[#333333] bg-[#0a0a0a] group overflow-hidden ${log.heightClass} flex flex-col items-center justify-center`}
          >
            {/* Image Placeholder or Actual Image */}
            {log.imageUrl ? (
              <Image 
                src={log.imageUrl} 
                alt={log.caption} 
                fill 
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <span className="font-mono text-[#333333] group-hover:opacity-0 transition-opacity">Image_{log.id}</span>
            )}
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
              <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-[#a1a1aa] uppercase tracking-wider">{log.location}</span>
                  <span className="text-xs font-mono text-white bg-[#333333] px-2 py-1">{log.year}</span>
                </div>
                <p className="text-white text-sm font-medium leading-snug">
                  {log.caption}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
