"use client";

import Link from "next/link";
import Image from "next/image";
import { siteData } from "@/lib/data";
import { sendGAEvent } from "@next/third-parties/google";

export default function Home() {
  return (
    <div className="flex flex-col gap-32">
      {/* Hero Section */}
      <section className="mt-16 flex flex-col items-start gap-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-tight">
          Architecting Products.<br />
          Shipping Code.<br />
          <span className="text-[#a1a1aa]">Scaling Systems.</span>
        </h1>
        <p className="text-lg sm:text-xl text-[#a1a1aa] max-w-2xl leading-relaxed">
          14 years of cross-functional leadership bridging engineering with data-driven product management. I build functional tools and scalable simulators designed to solve complex operational friction.
        </p>
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <a href="#portfolio" onClick={() => sendGAEvent({ event: 'click_view_portfolio', value: 'hero' })} className="bg-white text-black px-6 py-3 font-semibold hover:bg-gray-200 transition-colors">
            [ View Portfolio ]
          </a>
          <a href="#partner" onClick={() => sendGAEvent({ event: 'click_partner', value: 'hero' })} className="border border-[#333333] px-6 py-3 font-semibold hover:bg-[#111111] hover:border-gray-400 transition-colors text-white">
            [ Let's Partner ]
          </a>
        </div>
      </section>

      {/* Shipped Product Grid */}
      <section id="portfolio" className="scroll-mt-24">
        <div className="mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-white">Shipped Products</h2>
          <p className="text-[#a1a1aa] mt-2">Tools, utilities, and simulators driving measurable impact.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {siteData.products.map((product) => (
            <div key={product.id} className="group border border-[#333333] bg-[#0a0a0a] p-8 flex flex-col justify-between hover:border-gray-500 transition-colors">
              <div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">{product.title}</h3>
                <p className="text-[#a1a1aa] mb-6 leading-relaxed">
                  {product.metric} 
                  {/* TODO: Map to Sanity Studio fetch for dynamic metric updates */}
                </p>
              </div>
              <div className="mt-auto">
                <a href={product.ctaLink} onClick={() => sendGAEvent({ event: 'click_product', value: product.id })} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                  {product.ctaText}
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7"></path></svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About & Video Resume Section */}
      <section className="border-t border-[#333333] pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="flex flex-col gap-6">
            <h2 className="text-3xl font-bold tracking-tight text-white">The Narrative</h2>
            <div className="text-[#a1a1aa] space-y-4 leading-relaxed">
              <p>
                My career spans 14 years bridging the gap between rigorous software engineering and high-impact product management. Starting with a strong foundation in C++ engineering, I evolved into a product leader who understands both the technical constraints and the business scale.
              </p>
              <p>
                Today, as a solopreneur and consultant, I focus on building pragmatic, scalable solutions. Whether it's crafting PM simulators to train the next generation of product leaders or developing functional utilities that eliminate operational drag, my approach is always data-driven and user-centric.
              </p>
            </div>
            <div className="mt-4">
              <a href={siteData.resumePdfUrl} onClick={() => sendGAEvent({ event: 'download_cv', value: 'about_section' })} target="_blank" rel="noopener noreferrer" className="inline-flex items-center border border-[#333333] px-6 py-3 font-semibold hover:bg-[#111111] hover:border-gray-400 transition-colors text-white">
                <svg className="mr-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                [ Download CV (PDF) ]
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-4 items-center justify-center">
            {/* Video Resume Embed (YouTube Short) */}
            <div className="relative w-full max-w-sm aspect-[9/16] border border-[#333333] bg-[#0a0a0a] overflow-hidden shadow-2xl">
              <iframe 
                src="https://www.youtube.com/embed/qadMAz1dJW0?autoplay=0&rel=0" 
                title="Ananth Video Resume"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              ></iframe>
            </div>
          </div>
        </div>

        {/* Ananth in Action - 3 Photo Grid */}
        <div className="mt-16">
          <h3 className="text-sm font-mono text-[#555555] mb-4 uppercase tracking-widest">Ananth in Action</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="aspect-[4/3] bg-[#111111] border border-[#333333] flex items-center justify-center relative overflow-hidden group">
              <Image 
                src="/profile.jpg" 
                alt="Ananth speaking at an event" 
                fill 
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <p className="text-xs text-white font-mono">Speaking on System Architecture</p>
              </div>
            </div>
            {/* Slot 2 */}
            <div className="aspect-[4/3] bg-[#111111] border border-[#333333] flex items-center justify-center relative overflow-hidden group">
              <Image 
                src="/profile2.jpg" 
                alt="Ananth presenting at Toastmasters" 
                fill 
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <p className="text-xs text-white font-mono">Toastmasters Presentation</p>
              </div>
            </div>

            {/* Slot 3 */}
            <div className="aspect-[4/3] bg-[#111111] border border-[#333333] flex items-center justify-center relative overflow-hidden group">
              <Image 
                src="/profile3.jpg" 
                alt="Ananth in a scenic outdoor setting" 
                fill 
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <p className="text-xs text-white font-mono">Offsite</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="border-t border-[#333333] pt-24 scroll-mt-24">
        <div className="mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-white">Feedback & Testimonials</h2>
          <p className="text-[#a1a1aa] mt-2">What clients and workshop attendees have to say.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border border-[#333333] bg-[#0a0a0a] p-8 flex flex-col gap-6 hover:border-gray-500 transition-colors">
            <p className="text-[#a1a1aa] italic leading-relaxed flex-1">
              "Our website was brought to life by Anantha, whose creativity and dedication helped shape JSP's online presence. From understanding our ideas to turning them into a clean, modern, and easy-to-use website, he paid attention to every detail throughout the process. His commitment to quality and user experience has given us a platform that truly represents who we are and what we stand for. We sincerely appreciate his hard work and valuable contribution to JSP's digital journey."
            </p>
            <div>
              <p className="text-white font-bold">Ashwin Prasad</p>
              <p className="text-sm font-mono text-[#777777] mt-1">Director, JSP Trading & Solutions Private Limited</p>
            </div>
          </div>

          <div className="border border-[#333333] bg-[#0a0a0a] p-8 flex flex-col gap-6 hover:border-gray-500 transition-colors">
            <p className="text-[#a1a1aa] italic leading-relaxed flex-1 text-sm">
              "I am extremely pleased with the website developed by Mr. Ananth Subramaniam for JSP Trading & Solutions Private Limited. From understanding our business requirements to delivering a modern, professional, and user-friendly website, Ananth demonstrated exceptional dedication, creativity, and technical expertise throughout the project. He was highly responsive to our feedback, paid close attention to every detail, and ensured that the final website truly reflected our company's vision and international standards. His commitment to quality and timely delivery made the entire experience smooth and enjoyable. I sincerely appreciate his hard work and professionalism. I highly recommend Ananth to anyone looking for a reliable and talented web developer. I wish him continued success and all the very best in his future endeavors. May he achieve even greater milestones in his career."
            </p>
            <div>
              <p className="text-white font-bold">Prasanna Vijayakumar</p>
              <p className="text-sm font-mono text-[#777777] mt-1">Director, JSP Trading & Solutions Private Limited</p>
            </div>
          </div>

          <div className="border border-[#333333] bg-[#0a0a0a] p-8 flex flex-col gap-6 hover:border-gray-500 transition-colors">
            <p className="text-[#a1a1aa] italic leading-relaxed flex-1">
              "Everything is perfect,you make the session for all who don't have any prior knowledge of how promoting needs to be done"
            </p>
            <div>
              <p className="text-white font-bold">Anbu Kathiravan</p>
              <p className="text-sm font-mono text-[#777777] mt-1">Attendee, Gen AI Workshop at SSN College of Engineering</p>
            </div>
          </div>

          <div className="border border-[#333333] bg-[#0a0a0a] p-8 flex flex-col gap-6 hover:border-gray-500 transition-colors">
            <p className="text-[#a1a1aa] italic leading-relaxed flex-1">
              "This session is really good for beginners who doesn’t about the ai assists development."
            </p>
            <div>
              <p className="text-white font-bold">Ajith Kumar A</p>
              <p className="text-sm font-mono text-[#777777] mt-1">Attendee, Gen AI Workshop at SSN College of Engineering</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Talks */}
      <section id="talks" className="border-t border-[#333333] pt-24 mt-24 scroll-mt-24">
        <div className="mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-white">Featured Talks</h2>
          <p className="text-[#a1a1aa] mt-2">Insights on product strategy, engineering, and leadership.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Talk 1 */}
          <div className="flex flex-col gap-3">
            <div className="relative w-full aspect-video border border-[#333333] bg-[#0a0a0a] overflow-hidden shadow-2xl">
              <iframe 
                src="https://www.youtube.com/embed/x6he4ADVZWg" 
                title="Talk 1"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              ></iframe>
            </div>
            <h3 className="font-bold text-white text-lg leading-tight mt-2">Surrounded By Idiots - Management Book Review</h3>
            <p className="text-xs font-mono text-[#a1a1aa] uppercase tracking-widest">Talk / Presentation</p>
          </div>

          {/* Talk 2 */}
          <div className="flex flex-col gap-3">
            <div className="relative w-full aspect-video border border-[#333333] bg-[#0a0a0a] overflow-hidden shadow-2xl">
              <iframe 
                src="https://www.youtube.com/embed/rkw5FgxK59M" 
                title="Talk 2"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              ></iframe>
            </div>
            <h3 className="font-bold text-white text-lg leading-tight mt-2">Demo Day Presentation of our AI Product</h3>
            <p className="text-xs font-mono text-[#a1a1aa] uppercase tracking-widest">Product Demo</p>
          </div>

          {/* Talk 3 */}
          <div className="flex flex-col gap-3">
            <div className="relative w-full aspect-video border border-[#333333] bg-[#0a0a0a] overflow-hidden shadow-2xl">
              <iframe 
                src="https://www.youtube.com/embed/d1AvH_fwbhI" 
                title="Talk 3"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              ></iframe>
            </div>
            <h3 className="font-bold text-white text-lg leading-tight mt-2">Test Speaker for Meraki Advanced Toastmaster's Club Contest</h3>
            <p className="text-xs font-mono text-[#a1a1aa] uppercase tracking-widest">Toastmasters</p>
          </div>
        </div>
      </section>

      {/* Let's Partner Form */}
      <section id="partner" className="border-t border-[#333333] pt-24 pb-12 scroll-mt-24">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-white">Let's Partner</h2>
          <p className="text-[#a1a1aa] mt-4 leading-relaxed italic border-l-2 border-[#333333] pl-4 text-left">
            "Outside of my core corporate focus, I selectively engage with the ecosystem through speaking, panel discussions, and weekend workshops."
          </p>
        </div>
        
        <form className="max-w-2xl mx-auto space-y-6" onSubmit={async (e) => {
          e.preventDefault();
          sendGAEvent({ event: 'form_submit', value: 'inbound_pipeline' });
          const btn = e.target.querySelector('button[type="submit"]');
          const originalText = btn.innerText;
          btn.innerText = 'Sending...';
          btn.disabled = true;

          try {
            const formData = {
              type: 'contact_inquiry',
              name: e.target.name.value,
              email: e.target.email.value,
              organization: e.target.organization.value,
              intent: e.target.intent.value,
              message: e.target.message.value
            };

            const res = await fetch('/api/contact', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData)
            });

            if (res.ok) {
              alert('Message sent successfully! I will get back to you soon.');
              e.target.reset();
            } else {
              alert('Failed to send message. Please try again.');
            }
          } catch (error) {
            console.error(error);
            alert('An error occurred.');
          } finally {
            btn.innerText = originalText;
            btn.disabled = false;
          }
        }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-[#a1a1aa]">Full Name</label>
              <input type="text" id="name" name="name" required className="w-full bg-[#0a0a0a] border border-[#333333] p-3 text-white focus:outline-none focus:border-white transition-colors" placeholder="Jane Doe" />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-[#a1a1aa]">Email Address</label>
              <input type="email" id="email" name="email" required className="w-full bg-[#0a0a0a] border border-[#333333] p-3 text-white focus:outline-none focus:border-white transition-colors" placeholder="jane@company.com" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="organization" className="text-sm font-medium text-[#a1a1aa]">Organization</label>
            <input type="text" id="organization" name="organization" className="w-full bg-[#0a0a0a] border border-[#333333] p-3 text-white focus:outline-none focus:border-white transition-colors" placeholder="Company or Institution Name" />
          </div>

          <div className="space-y-2">
            <label htmlFor="intent" className="text-sm font-medium text-[#a1a1aa]">Engagement Intent</label>
            <select id="intent" name="intent" className="w-full bg-[#0a0a0a] border border-[#333333] p-3 text-white focus:outline-none focus:border-white transition-colors appearance-none">
              <option value="speaking">Speaking / Panel Discussion</option>
              <option value="workshop">Weekend Workshop</option>
              <option value="freelance">Freelance Consulting</option>
              <option value="hiring">Hiring / Full-time Opportunity</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium text-[#a1a1aa]">Message</label>
            <textarea id="message" name="message" required rows={5} className="w-full bg-[#0a0a0a] border border-[#333333] p-3 text-white focus:outline-none focus:border-white transition-colors resize-none" placeholder="Briefly describe the context of your inquiry..."></textarea>
          </div>

          <button type="submit" className="w-full bg-white text-black font-bold py-4 hover:bg-gray-200 transition-colors disabled:opacity-50">
            [ Submit Inquiry ]
          </button>
        </form>
      </section>
    </div>
  );
}
