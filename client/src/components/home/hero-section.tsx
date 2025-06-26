import { Link } from "wouter";
import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  user: User | null;
}

export default function HeroSection({ user }: HeroSectionProps) {
  return (
    <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Connect With Jewelry Professionals
          </h1>
          <p className="font-sans text-lg md:text-xl opacity-90 mb-8">
            Discover, connect, and collaborate with the finest artisans, designers, and businesses in the jewelry industry.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            {user ? (
              <>
                <Link href="/directory">
                  <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-neutral-900 rounded-full w-full md:w-auto">
                    Find Professionals
                  </Button>
                </Link>
                <Link href="/events">
                  <Button size="lg" variant="outline" className="border-white bg-transparent !text-white hover:bg-white/10 hover:text-white rounded-full w-full md:w-auto">
                    Explore Events
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/directory">
                  <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-neutral-900 rounded-full w-full md:w-auto">
                    Find Professionals
                  </Button>
                </Link>
                <Link href="/auth?tab=register">
                  <Button size="lg" variant="outline" className="border-white bg-transparent !text-white hover:bg-white/10 hover:text-white rounded-full w-full md:w-auto">
                    Create Account
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
