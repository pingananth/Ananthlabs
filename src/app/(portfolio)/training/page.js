import Image from "next/image";
import { siteData } from "@/lib/data";
import TrainingEnquiryForm from "@/components/portfolio/TrainingEnquiryForm";
import TrackedLink from "@/components/portfolio/TrackedLink";
import { VideoCard, CohortFeedback } from "@/components/portfolio/TeachingMedia";

export const metadata = {
  title: "Corporate AI Training: Claude Code, FDE & GenAI Bootcamps | Ananth Labs",
  description:
    "Hands-on corporate training on Claude Code, Forward Deployed Engineering and GenAI for engineering teams and leaders. Online or onsite, tailored to your stack.",
  alternates: { canonical: "https://ananthlabs.com/training" },
  openGraph: {
    title: "Corporate AI Training by Ananth Labs",
    description: "Claude Code, FDE and GenAI bootcamps. Your team ships real work in every session.",
    url: "https://ananthlabs.com/training",
    type: "website",
  },
};

const { training } = siteData;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfessionalService",
      name: "Ananth Labs: Corporate AI Training",
      url: "https://ananthlabs.com/training",
      areaServed: "Worldwide",
      serviceType: ["Corporate training", "AI consulting"],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Training Programs",
        itemListElement: training.programs.map((p) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Course",
            name: p.title,
            description: p.outcomes.join(". "),
            provider: { "@type": "Organization", name: "Ananth Labs", sameAs: "https://ananthlabs.com" },
          },
        })),
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: training.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

const primaryBtn = "bg-white text-black px-6 py-3 font-semibold hover:bg-gray-200 transition-colors";
const secondaryBtn =
  "border border-[#333333] px-6 py-3 font-semibold hover:bg-[#111111] hover:border-gray-400 transition-colors text-white";

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold tracking-tight text-white">{title}</h2>
      {subtitle && <p className="text-[#a1a1aa] mt-2">{subtitle}</p>}
    </div>
  );
}

export default function TrainingPage() {
  return (
    <div className="flex flex-col gap-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      {/* Hero */}
      <section className="mt-16 flex flex-col items-start gap-8">
        <p className="text-xs font-mono text-[#a1a1aa] uppercase tracking-widest">[ Corporate Training · AI Consulting ]</p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-tight">
          AI training that ends with<br />
          <span className="text-[#a1a1aa]">your team shipping real work.</span>
        </h1>
        <p className="text-lg sm:text-xl text-[#a1a1aa] max-w-2xl leading-relaxed">
          Hands-on Claude Code, Forward Deployed Engineering and GenAI bootcamps for engineering teams and leaders.
          Taught by a builder with 14 years in engineering and product, who ships AI products every month.
        </p>
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <TrackedLink
            href={training.calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            event="click_book_call"
            eventProps={{ location: "training_hero" }}
            className={primaryBtn}
          >
            [ Book a Discovery Call ]
          </TrackedLink>
          <TrackedLink href="#programs" event="click_view_programs" eventProps={{ location: "training_hero" }} className={secondaryBtn}>
            [ See Programs ]
          </TrackedLink>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#333333] border border-[#333333] w-full mt-8">
          {training.proof.map((p) => (
            <div key={p.label} className="bg-[#0a0a0a] p-6">
              <p className="text-2xl font-extrabold text-white">{p.value}</p>
              <p className="text-xs font-mono text-[#a1a1aa] mt-2 uppercase tracking-widest">{p.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Programs */}
      <section id="programs" className="scroll-mt-24">
        <SectionHeader title="Programs" subtitle="Every program is tailored to your stack after a discovery call." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {training.programs.map((p) => (
            <div key={p.id} className="border border-[#333333] bg-[#0a0a0a] p-8 flex flex-col gap-6 hover:border-gray-500 transition-colors">
              <div className="flex flex-col gap-3">
                <span className="text-xs font-mono text-[#a1a1aa] uppercase tracking-widest">[ {p.tag} ]</span>
                <h3 className="text-xl font-bold text-white">{p.title}</h3>
                <p className="text-sm font-mono text-[#777777]">{p.duration} · {p.format}</p>
                <p className="text-sm text-[#a1a1aa]"><span className="text-white">For:</span> {p.audience}</p>
              </div>
              <ul className="space-y-2 text-[#a1a1aa] text-sm leading-relaxed flex-1">
                {p.outcomes.map((o) => (
                  <li key={o} className="flex gap-3">
                    <span className="text-white">→</span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
              <TrackedLink
                href="#enquire"
                event="click_program_enquire"
                eventProps={{ program: p.id }}
                className="text-sm font-semibold text-white hover:text-blue-400 transition-colors"
              >
                Enquire about this program →
              </TrackedLink>
            </div>
          ))}
        </div>

        <div className="mt-12 border border-[#333333] p-8">
          <h3 className="text-sm font-mono text-[#a1a1aa] uppercase tracking-widest mb-6">Also available: AI Consulting</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {training.consulting.map((c) => (
              <div key={c.title}>
                <p className="font-bold text-white">{c.title}</p>
                <p className="text-sm text-[#a1a1aa] mt-2 leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* See me teach */}
      <section className="border-t border-[#333333] pt-24">
        <SectionHeader title="See Me Teach" subtitle="Short samples that answer the questions buyers ask most." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {training.videos.map((v) => (
            <VideoCard key={v.title} video={v} />
          ))}
        </div>
        <div className="mt-8">
          <TrackedLink
            href={siteData.socials.youtube}
            target="_blank"
            rel="noopener noreferrer"
            event="click_youtube"
            eventProps={{ location: "training_videos" }}
            className="text-sm font-semibold text-white hover:text-blue-400 transition-colors"
          >
            More on YouTube →
          </TrackedLink>
        </div>
      </section>

      {/* Cohort feedback */}
      <section className="border-t border-[#333333] pt-24">
        <SectionHeader title="In Their Words" subtitle={training.cohortFeedback.label} />
        <CohortFeedback feedback={training.cohortFeedback} />
      </section>

      {/* Proof: photos + testimonials */}
      <section className="border-t border-[#333333] pt-24">
        <SectionHeader title="From Past Sessions" subtitle="Workshops, bootcamps and leadership trainings." />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {training.photos.map((ph) => (
            <div key={ph.src} className="aspect-[4/3] bg-[#111111] border border-[#333333] relative overflow-hidden">
              <Image src={ph.src} alt={ph.caption} fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <p className="text-xs text-white font-mono">{ph.caption}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {training.testimonials.map((t) => (
            <div key={t.name} className="border border-[#333333] bg-[#0a0a0a] p-8 flex flex-col gap-6">
              <p className="text-[#a1a1aa] italic leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
              <div>
                <p className="text-white font-bold">{t.name}</p>
                <p className="text-sm font-mono text-[#777777] mt-1">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-[#333333] pt-24">
        <SectionHeader title="How It Works" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {training.process.map((s) => (
            <div key={s.step} className="flex flex-col gap-3">
              <span className="text-sm font-mono text-[#555555]">{s.step}</span>
              <p className="font-bold text-white">{s.title}</p>
              <p className="text-sm text-[#a1a1aa] leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-[#333333] pt-24">
        <SectionHeader title="Questions Buyers Ask" />
        <div className="flex flex-col border-t border-[#333333]">
          {training.faqs.map((f) => (
            <details key={f.q} className="group border-b border-[#333333] py-6">
              <summary className="flex justify-between items-center gap-4 cursor-pointer list-none font-semibold text-white">
                {f.q}
                <span className="text-[#a1a1aa] font-mono group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-[#a1a1aa] mt-4 leading-relaxed max-w-3xl">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Enquiry */}
      <section id="enquire" className="border-t border-[#333333] pt-24 pb-12 scroll-mt-24">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-white">Bring This to Your Team</h2>
          <p className="text-[#a1a1aa] mt-4 leading-relaxed">
            Share a few details and I will send a tailored proposal within 48 hours.
          </p>
        </div>
        <TrainingEnquiryForm />
      </section>
    </div>
  );
}
