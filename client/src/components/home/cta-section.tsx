import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface CTASectionProps {
  loggedIn: boolean;
}

export default function CTASection({ loggedIn }: CTASectionProps) {
  return (
    <div className="bg-gradient-to-br from-primary to-primary-dark text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
          Ready to Connect with Industry Professionals?
        </h2>
        <p className="font-sans text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
          Join thousands of jewelry professionals who are growing their business through meaningful connections.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {loggedIn ? (
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
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Link href="/auth?tab=register">
                  <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-neutral-900 rounded-full w-full md:w-auto">
                    Create Free Account
                  </Button>
                </Link>
                <div className="hidden sm:flex items-center">
                  <div className="h-8 w-px bg-white/30 mx-2"></div>
                </div>
                <Link href="/directory">
                  <Button size="lg" variant="outline" className="border-white bg-transparent !text-white hover:bg-white/10 hover:text-white rounded-full w-full md:w-auto">
                    Browse as Guest
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-white/70 mt-3">
                Guest browsing is limited to directory viewing only
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
