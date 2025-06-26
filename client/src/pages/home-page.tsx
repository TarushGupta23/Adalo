import { Helmet } from "react-helmet";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import HeroSection from "@/components/home/hero-section";
import CategorySection from "@/components/home/category-section";
import TrendingSection from "@/components/home/trending-section";
import EventsSection from "@/components/home/events-section";
import FeaturedWorkSection from "@/components/home/featured-work-section";
import JewelryArticlesSection from "@/components/home/jewelry-articles-section";

import CTASection from "@/components/home/cta-section";
import GuestBrowsingBanner from "@/components/home/guest-browsing-banner";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
    // Force reload the page after logout to clear any cached state
    setTimeout(() => window.location.href = "/", 300);
  };

  return (
    <>
      <Helmet>
        <title>JewelConnect - Jewelry Industry Network</title>
        <meta name="description" content="Connect with jewelry professionals and grow your business through meaningful industry connections." />
      </Helmet>
      
      <Navbar />
      
      <main className="pt-16 pb-12">
        <HeroSection user={user} />
        <CategorySection />
        <TrendingSection />
        <EventsSection />
        <FeaturedWorkSection />
        <JewelryArticlesSection />
        <CTASection loggedIn={!!user} />
      </main>
      
      <Footer />
    </>
  );
}
