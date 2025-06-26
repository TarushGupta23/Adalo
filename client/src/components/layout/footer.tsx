import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-neutral-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Social */}
          <div>
            <div className="font-serif text-2xl font-bold mb-6">
              <span className="text-secondary">Jewel</span>Connect
            </div>
            <p className="text-neutral-400 mb-6">The premier professional network for the jewelry industry.</p>
            <div className="flex space-x-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-secondary transition-all">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-serif font-bold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <div 
                  onClick={() => window.location.href = "/"} 
                  className="text-neutral-400 hover:text-white transition-all cursor-pointer"
                >
                  Home
                </div>
              </li>
              <li>
                <div 
                  onClick={() => window.location.href = "/directory"} 
                  className="text-neutral-400 hover:text-white transition-all cursor-pointer"
                >
                  Directory
                </div>
              </li>
              <li>
                <div 
                  onClick={() => window.location.href = "/events"} 
                  className="text-neutral-400 hover:text-white transition-all cursor-pointer"
                >
                  Events
                </div>
              </li>
              <li>
                <div 
                  onClick={() => window.location.href = "/inventory"} 
                  className="text-neutral-400 hover:text-white transition-all cursor-pointer"
                >
                  Featured Work
                </div>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <ul className="space-y-3">
              <li>
                <div 
                  onClick={() => window.location.href = "/community-guidelines"} 
                  className="text-neutral-400 hover:text-white transition-all cursor-pointer"
                >
                  Community Guidelines
                </div>
              </li>
              <li>
                <div 
                  onClick={() => window.location.href = "/privacy-policy"} 
                  className="text-neutral-400 hover:text-white transition-all cursor-pointer"
                >
                  Privacy Policy
                </div>
              </li>
              <li>
                <div 
                  onClick={() => window.location.href = "/terms-of-service"} 
                  className="text-neutral-400 hover:text-white transition-all cursor-pointer"
                >
                  Terms of Service
                </div>
              </li>
              <li>
                <div 
                  onClick={() => window.location.href = "/contact-us"} 
                  className="text-neutral-400 hover:text-white transition-all cursor-pointer"
                >
                  Contact Us
                </div>
              </li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h3 className="font-serif font-bold text-lg mb-6">Newsletter</h3>
            <p className="text-neutral-400 mb-4">Stay updated with industry trends and platform updates.</p>
            <form className="mb-4" onSubmit={(e) => e.preventDefault()}>
              <div className="flex">
                <Input 
                  type="email" 
                  placeholder="Your email address" 
                  className="bg-neutral-700 text-white border-0 rounded-l-md focus-visible:ring-primary" 
                />
                <Button 
                  type="submit" 
                  className="bg-secondary hover:bg-secondary/90 text-neutral-900 rounded-l-none"
                >
                  Subscribe
                </Button>
              </div>
            </form>
            <p className="text-neutral-500 text-xs">By subscribing, you agree to our Privacy Policy.</p>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-neutral-700 mt-12 pt-6 text-center text-neutral-500 text-sm">
          <p>&copy; {new Date().getFullYear()} JewelConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
