// Shared video and testimonial blocks used on /training and the home page.

export function VideoCard({ video }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full aspect-video border border-[#333333] bg-[#0a0a0a] overflow-hidden">
        {video.youtubeId ? (
          <iframe
            src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0`}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-mono text-[#555555] uppercase tracking-widest">[ Coming Soon ]</span>
          </div>
        )}
      </div>
      {video.question && (
        <p className="text-xs font-mono text-[#a1a1aa] uppercase tracking-widest mt-2">Q: {video.question}</p>
      )}
      <h3 className="font-bold text-white text-lg leading-tight">{video.title}</h3>
    </div>
  );
}

// Highlighted cohort quote with rating badges
export function FeaturedFeedback({ feedback }) {
  const { label, featured } = feedback;
  return (
    <div className="border border-[#333333] border-l-2 border-l-white bg-[#0a0a0a] p-8 flex flex-col gap-6">
      <p className="text-xs font-mono text-[#a1a1aa] uppercase tracking-widest">[ {label} ]</p>
      <p className="text-lg text-white leading-relaxed">&ldquo;{featured.quote}&rdquo;</p>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm font-mono text-[#777777]">{featured.source}</p>
        <div className="flex flex-wrap gap-2">
          {featured.badges.map((b) => (
            <span key={b} className="text-xs font-mono text-white border border-[#333333] px-3 py-1">{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Full cohort feedback block: stats, featured quote, quote grid, closing line
export function CohortFeedback({ feedback }) {
  const { stats, quotes, closing } = feedback;
  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm font-mono text-[#a1a1aa]">{stats.join("  ·  ")}</p>
      <FeaturedFeedback feedback={feedback} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quotes.map((q) => (
          <div key={q.name} className="border border-[#333333] bg-[#0a0a0a] p-8 flex flex-col gap-4">
            <p className="text-[#a1a1aa] italic leading-relaxed flex-1">&ldquo;{q.quote}&rdquo;</p>
            <p className="text-white font-bold">— {q.name}</p>
          </div>
        ))}
      </div>
      <div className="bg-white text-black p-8 text-center flex flex-col gap-2">
        <p className="text-xl sm:text-2xl font-semibold">&ldquo;{closing.quote}&rdquo;</p>
        <p className="text-sm font-mono text-[#555555]">— {closing.name}, {closing.note}</p>
      </div>
    </div>
  );
}
