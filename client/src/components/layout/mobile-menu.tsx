import { Fragment } from "react";
import { Link, useLocation } from "wouter";
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
  onNavigate: (path: string) => void;
  onLogout: () => void;
  isLoggingOut: boolean;
}

export default function MobileMenu({ isOpen, onClose, user }: MobileMenuProps) {
  const { logoutMutation } = useAuth();
  const [, navigate] = useLocation();

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 lg:hidden" onClose={onClose}>
        <Dialog.Title className="sr-only">Mobile navigation menu</Dialog.Title>

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
          <Dialog.Panel className="fixed inset-y-0 right-0 w-full max-w-[90vw] flex flex-col bg-neutral-900 text-white shadow-xl">
            <div className="flex justify-between items-center p-6 border-b border-neutral-800">
              <div className="flex items-center font-serif text-2xl font-bold">
                <JewelLogo size={24} className="mr-2 text-secondary" />
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
                <li><a onClick={() => { navigate("/"); onClose(); }} className="text-white font-serif text-xl block cursor-pointer">Home</a></li>
                <li><a onClick={() => { navigate("/directory"); onClose(); }} className="text-neutral-400 hover:text-white font-serif text-xl block cursor-pointer">Directory</a></li>
                <li><a onClick={() => { navigate("/events"); onClose(); }} className="text-neutral-400 hover:text-white font-serif text-xl block cursor-pointer">Events</a></li>
                <li><a onClick={() => { navigate("/gemstone-marketplace"); onClose(); }} className="text-neutral-400 hover:text-white font-serif text-xl block cursor-pointer">Gemstones</a></li>
                <li><a onClick={() => { navigate("/jewelry-marketplace"); onClose(); }} className="text-neutral-400 hover:text-white font-serif text-xl block cursor-pointer">Marketplace</a></li>
                <li><a onClick={() => { navigate("/group-purchases"); onClose(); }} className="text-neutral-400 hover:text-white font-serif text-xl block cursor-pointer">Group Buys</a></li>

                {user && (
                  <>
                    <li><a onClick={() => { navigate("/messages"); onClose(); }} className="text-neutral-400 hover:text-white font-serif text-xl block cursor-pointer">Messages</a></li>
                    <li><a onClick={() => { navigate("/inventory"); onClose(); }} className="text-neutral-400 hover:text-white font-serif text-xl block cursor-pointer">My Inventory</a></li>
                    <li><a onClick={() => { navigate("/cart"); onClose(); }} className="text-neutral-400 hover:text-white font-serif text-xl block cursor-pointer">Shopping Cart</a></li>
                    <li><a onClick={() => { navigate("/orders"); onClose(); }} className="text-neutral-400 hover:text-white font-serif text-xl block cursor-pointer">My Orders</a></li>
                    <li><a onClick={() => { navigate(`/profile/${user.id}`); onClose(); }} className="text-neutral-400 hover:text-white font-serif text-xl block cursor-pointer">My Profile</a></li>

                    {/* Admin dashboard link */}
                    {["admin", "carmelar", "tobepacking"].includes(user.username) && (
                      <li>
                        <a onClick={() => { navigate("/admin"); onClose(); }} className="text-orange-400 hover:text-white font-serif text-xl block cursor-pointer">
                          🔧 Admin Dashboard
                        </a>
                      </li>
                    )}
                  </>
                )}
              </ul>
            </div>

            <div className="p-6 border-t border-neutral-800">
              {user ? (
                <div className="space-y-3">
                  <Button
                    className="w-full"
                    onClick={() => {
                      navigate(`/profile/${user.id}`);
                      onClose();
                    }}
                  >
                    View Profile
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      logoutMutation.mutate();
                      onClose();
                      setTimeout(() => navigate("/"), 300);
                    }}
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending ? "Logging out..." : "Sign out"}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="bg-neutral-800/50 rounded-lg p-4 mb-5">
                    <p className="text-center text-sm text-neutral-300 mb-3">Browse without an account</p>
                    <Button
                      className="w-full"
                      onClick={() => {
                        navigate("/directory");
                        onClose();
                      }}
                    >
                      Browse as Guest
                    </Button>
                    <p className="text-center text-xs text-neutral-500 mt-2">Limited to directory viewing only</p>
                  </div>

                  <Button
                    className="w-full mb-3"
                    onClick={() => {
                      navigate("/auth?tab=register");
                      onClose();
                    }}
                  >
                    Create an Account
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      navigate("/auth");
                      onClose();
                    }}
                  >
                    Log In
                  </Button>
                </>
              )}
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}
