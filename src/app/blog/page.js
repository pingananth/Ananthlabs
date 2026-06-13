import Link from "next/link";

// Dummy data placeholder
// TODO: Map to Sanity Studio fetch
const mockArticles = [
  {
    slug: "system-design-for-startups",
    title: "System Design Patterns for Early-Stage Startups",
    date: "Oct 12, 2025",
    track: "Product & System Architecture"
  },
  {
    slug: "governance-at-scale",
    title: "Navigating Governance When Scaling Past 100 Engineers",
    date: "Aug 04, 2025",
    track: "Scale & Governance"
  },
  {
    slug: "empathy-in-engineering",
    title: "Building Tools with Empathy: A PM's Guide",
    date: "Jun 22, 2025",
    track: "Human Systems & Empathy"
  },
  {
    slug: "simulator-architecture",
    title: "Architecting PM Simulators for Scalable Training",
    date: "Mar 15, 2025",
    track: "Product & System Architecture"
  }
];

export default function BlogIndex() {
  return (
    <div className="flex flex-col gap-16 max-w-3xl mx-auto">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-white">Writing</h1>
        <p className="text-[#a1a1aa] text-lg">
          Essays and technical teardowns on architecture, scaling, and the human side of software.
        </p>
      </div>

      <div className="flex flex-col">
        {mockArticles.map((article) => (
          <Link 
            key={article.slug} 
            href={`/blog/${article.slug}`}
            className="group flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 py-6 border-b border-[#333333] hover:bg-[#111111] transition-colors -mx-4 px-4 sm:mx-0 sm:px-0"
          >
            <div className="w-32 flex-shrink-0 text-sm font-mono text-[#555555] group-hover:text-[#a1a1aa] transition-colors">
              {article.date}
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                {article.title}
              </h2>
              <span className="text-xs font-mono uppercase tracking-widest text-[#a1a1aa]">
                [ {article.track} ]
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
