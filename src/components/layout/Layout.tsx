import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "@/components/BackToTop";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import SymptomCheckerFAB from "@/components/SymptomCheckerFAB";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <Footer />
      <BackToTop />
      <SymptomCheckerFAB />
      <StickyMobileCTA />
    </div>
  );
}

