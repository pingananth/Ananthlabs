import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PortfolioLayout({ children }) {
  return (
    <>
      <Header />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </main>
      <Footer />
    </>
  );
}
