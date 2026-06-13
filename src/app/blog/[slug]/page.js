import Link from "next/link";

// Dummy data fetching
// TODO: Map to Sanity Studio fetch
async function getArticle(slug) {
  // Simulate network request
  return {
    slug,
    title: slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    date: "Oct 12, 2025",
    track: "Product & System Architecture",
    content: `
      <p>This is a placeholder for the article content. In a production environment, this content would be fetched dynamically from a headless CMS like Sanity.io or from local markdown files.</p>
      <h2>The Core Architecture</h2>
      <p>Building scalable systems requires a foundational understanding of the constraints and the bottlenecks that naturally emerge as usage grows. When we designed the PM simulator, the goal wasn't just to mimic real-world friction, but to do so at a scale that could accommodate thousands of concurrent sessions.</p>
      <p>To achieve this, we decoupled the simulation engine from the state management layer, allowing us to spin up lightweight instances on demand. We utilized an event-driven architecture, leaning heavily on message queues to handle state transitions asynchronously. This approach not only improved the responsiveness of the UI but also gave us the resilience needed to survive traffic spikes during cohort launches.</p>
      <h3>Empathy in the Code</h3>
      <p>However, the real challenge wasn't just technical. It was ensuring that the simulator felt authentic to the PMs using it. This required a deep empathy for the day-to-day challenges of a product manager—the endless context switching, the vague requirements, and the pressure to deliver. By hardcoding these "frictions" into the simulation events, we created a learning environment that was both technically robust and deeply human.</p>
    `
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  return (
    <article className="max-w-2xl mx-auto flex flex-col gap-8 pt-8 pb-24">
      <Link href="/blog" className="text-sm font-mono text-[#a1a1aa] hover:text-white transition-colors flex items-center gap-2 w-fit">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Back to Writing
      </Link>
      
      <header className="flex flex-col gap-4 border-b border-[#333333] pb-8 mb-8">
        <div className="flex items-center gap-4 text-sm font-mono text-[#555555]">
          <span>{article.date}</span>
          <span>/</span>
          <span className="uppercase tracking-widest text-[#a1a1aa]">[ {article.track} ]</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
          {article.title}
        </h1>
      </header>

      <div 
        className="prose prose-invert prose-lg max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-a:text-blue-400 hover:prose-a:text-blue-300"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
      
      <footer className="mt-16 pt-8 border-t border-[#333333]">
        <p className="text-sm text-[#a1a1aa] font-mono">
          Written by Ananth
        </p>
      </footer>
    </article>
  );
}
