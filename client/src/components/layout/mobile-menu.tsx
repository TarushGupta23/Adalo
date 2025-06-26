import { Fragment } from "react";
import { Link } from "wouter";
import { User } from "@shared/schema";
import { Dialog, Transition } from "@headlessui/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import JewelLogo from '@/components/ui/logo';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function MobileMenu({ isOpen, onClose, user }: MobileMenuProps) {
  const { logoutMutation } = useAuth();
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 lg:hidden" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80" />
        </Transition.Child>

        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="ease-in duration-200"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
        >
          <Dialog.Panel className="fixed inset-y-0 right-0 w-full max-w-sm flex flex-col bg-neutral-900 text-white shadow-xl">
            <div className="flex justify-between items-center p-6 border-b border-neutral-800">
              <div className="flex items-center font-serif text-2xl font-bold">
                <div className="mr-2 flex items-center">
                  <JewelLogo size={24} className="text-secondary" />
                </div>
                <span className="text-secondary">Jewel</span>Connect
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-white">
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6">
                <div className="relative">
                  <Input 
                    type="text" 
                    placeholder="Search..." 
                    className="bg-neutral-800 text-white border-0 focus-visible:ring-primary" 
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-0 top-0 h-full text-neutral-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </Button>
                </div>
              </div>
              
              <ul className="space-y-6">
                <li>
                  <Link href="/">
                    <a className="text-white font-serif text-xl block" onClick={onClose}>Home</a>
                  </Link>
                </li>
                <li>
                  <Link href="/directory">
                    <a className="text-neutral-400 hover:text-white font-serif text-xl block" onClick={onClose}>Directory</a>
                  </Link>
                </li>
                <li>
                  <Link href="/events">
                    <a className="text-neutral-400 hover:text-white font-serif text-xl block" onClick={onClose}>Events</a>
                  </Link>
                </li>
                <li>
                  <Link href="/gemstone-marketplace">
                    <a className="text-neutral-400 hover:text-white font-serif text-xl block" onClick={onClose}>Gemstones</a>
                  </Link>
                </li>
                <li>
                  <Link href="/jewelry-marketplace">
                    <a className="text-neutral-400 hover:text-white font-serif text-xl block" onClick={onClose}>Marketplace</a>
                  </Link>
                </li>
                <li>
                  <Link href="/group-purchases">
                    <a className="text-neutral-400 hover:text-white font-serif text-xl block" onClick={onClose}>Group Buys</a>
                  </Link>
                </li>
                {user && (
                  <>
                    <li>
                      <Link href="/messages">
                        <a className="text-neutral-400 hover:text-white font-serif text-xl block" onClick={onClose}>Messages</a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/inventory">
                        <a className="text-neutral-400 hover:text-white font-serif text-xl block" onClick={onClose}>My Inventory</a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/cart">
                        <a className="text-neutral-400 hover:text-white font-serif text-xl block" onClick={onClose}>Shopping Cart</a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/orders">
                        <a className="text-neutral-400 hover:text-white font-serif text-xl block" onClick={onClose}>My Orders</a>
                      </Link>
                    </li>
                    <li>
                      <Link href={`/profile/${user.id}`}>
                        <a className="text-neutral-400 hover:text-white font-serif text-xl block" onClick={onClose}>My Profile</a>
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
            
            <div className="p-6 border-t border-neutral-800">
              {user ? (
                <div className="space-y-3">
                  <a 
                    href={`/profile/${user.id}`} 
                    onClick={(e) => {
                      e.preventDefault();
                      onClose();
                      window.location.href = `/profile/${user.id}`;
                    }}
                    className="w-full py-2.5 px-4 mb-3 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary flex items-center justify-center"
                  >
                    View Profile
                  </a>
                  <button 
                    className="w-full py-2.5 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center"
                    onClick={() => {
                      logoutMutation.mutate();
                      onClose();
                      // Force reload the page after logout to clear any cached state
                      setTimeout(() => window.location.href = "/", 300);
                    }}
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending ? "Logging out..." : "Sign out"}
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-neutral-800/50 rounded-lg p-4 mb-5">
                    <p className="text-center text-sm text-neutral-300 mb-3">Browse without an account</p>
                    <a 
                      href="/directory" 
                      onClick={(e) => {
                        e.preventDefault();
                        onClose();
                        window.location.href = "/directory";
                      }}
                      className="w-full py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-neutral-900 bg-secondary hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M7 7h.01" /><path d="M17 7h.01" /><path d="M7 12h.01" /><path d="M17 12h.01" /><path d="M7 17h.01" /><path d="M17 17h.01" /></svg>
                      Browse as Guest
                    </a>
                    <p className="text-center text-xs text-neutral-500 mt-2">Limited to directory viewing only</p>
                  </div>
                  
                  <a 
                    href="/auth?tab=register" 
                    onClick={(e) => {
                      e.preventDefault();
                      onClose();
                      window.location.href = "/auth?tab=register";
                    }}
                    className="w-full py-2.5 px-4 mb-3 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center"
                  >
                    Create an Account
                  </a>
                  <a 
                    href="/auth" 
                    onClick={(e) => {
                      e.preventDefault();
                      onClose();
                      window.location.href = "/auth";
                    }}
                    className="w-full py-2.5 px-4 border border-neutral-600 text-sm font-medium rounded-md text-white bg-transparent hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center"
                  >
                    Log In
                  </a>
                </>
              )}
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}
