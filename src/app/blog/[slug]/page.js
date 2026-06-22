import Link from "next/link";
import { siteData } from "@/lib/data";
import { notFound } from "next/navigation";

// Fetch article from siteData
async function getArticle(slug) {
  const article = siteData.articles.find(a => a.slug === slug);
  if (!article) {
    notFound();
  }
  return article;
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
