import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function GuestBrowsingBanner() {
  return (
    <div className="bg-gradient-to-r from-secondary/5 to-secondary/10 border-b border-secondary/20 py-2 mb-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-row items-center justify-center gap-4 text-sm">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary mr-2"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M7 7h.01" /><path d="M17 7h.01" /><path d="M7 12h.01" /><path d="M17 12h.01" /><path d="M7 17h.01" /><path d="M17 17h.01" /></svg>
            <span className="text-neutral-600">No login required to browse our directory</span>
          </div>
          <Link href="/directory">
            <Button variant="link" className="text-secondary hover:text-secondary/80 px-2 py-0 h-auto font-medium">
              Explore Now →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}