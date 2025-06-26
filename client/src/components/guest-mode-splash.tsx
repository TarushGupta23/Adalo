import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import JewelLogo from '@/components/ui/logo';

export default function GuestModeSplash() {
  // Force splash to stay open by default - only closes with explicit action
  const [isOpen, setIsOpen] = useState(true);
  const [location, navigate] = useLocation();
  const { user } = useAuth();

  // Only check if user is logged in, ignore session storage
  useEffect(() => {
    if (user) {
      setIsOpen(false);
    }
  }, [user]);

  // Show splash when accessing non-directory pages without authentication
  useEffect(() => {
    // If user isn't authenticated and location isn't /directory or /auth, always show splash
    if (!user && location !== '/directory' && !location.startsWith('/auth')) {
      setIsOpen(true);
    }
  }, [user, location]);

  const handleContinueAsGuest = () => {
    sessionStorage.setItem('hasSeenGuestSplash', 'true');
    setIsOpen(false);
    navigate('/directory');
  };

  const handleCreateAccount = () => {
    sessionStorage.setItem('hasSeenGuestSplash', 'true');
    setIsOpen(false);
    navigate('/auth?tab=register');
  };

  const handleDismiss = () => {
    // If on a protected page, navigate to directory
    if (!user && location !== '/directory' && !location.startsWith('/auth')) {
      navigate('/directory');
    }
    sessionStorage.setItem('hasSeenGuestSplash', 'true');
    setIsOpen(false);
  };

  // Only hide if explicitly closed by user action or if logged in
  if (!isOpen || user) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative animate-fadeIn">
        <button 
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 p-1"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18"/>
            <path d="m6 6 12 12"/>
          </svg>
        </button>
        
        <div className="text-center mb-8 mt-2">
          <div className="flex items-center justify-center mx-auto mb-6">
            <JewelLogo size={72} />
          </div>
          <h2 className="text-2xl font-bold mb-1 transform scale-105">
            <span className="font-accent text-neutral-600 italic">Welcome to</span><br />
            <span className="text-secondary">Jewel</span>Connect
          </h2>
          <p className="text-neutral-600 text-sm">
            Professional network for the jewelry industry
          </p>
        </div>
        
        {/* Show more detailed message when trying to access protected pages */}
        {!user && location !== '/directory' && !location.startsWith('/auth') && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm text-amber-800">
            <p className="font-medium mb-1">Sign up required</p>
            <p>You need to create an account to access this page and other features of JewelConnect.</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-4 mb-2">
          <div>
            <Button 
              variant="secondary" 
              className="w-full flex items-center justify-center gap-2"
              onClick={handleContinueAsGuest}
            >
              <span>Browse as Guest</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </Button>
            <p className="text-neutral-500 text-xs text-center mt-1">Directory browsing only</p>
          </div>
          
          <div className="flex items-center gap-3 my-1">
            <div className="h-px bg-neutral-200 flex-grow"></div>
            <span className="text-xs text-neutral-400">or</span>
            <div className="h-px bg-neutral-200 flex-grow"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Button 
                className="w-full bg-gray-700 text-white border-gray-600 hover:bg-gray-800"
                onClick={() => {
                  sessionStorage.setItem('hasSeenGuestSplash', 'true');
                  setIsOpen(false);
                  navigate('/auth');
                }}
                variant="outline"
              >
                Sign In
              </Button>
            </div>
            <div>
              <Button 
                className="w-full" 
                onClick={handleCreateAccount}
              >
                Create a free account
              </Button>
            </div>
            <p className="text-neutral-500 text-xs text-center col-span-2 mt-1">
              Full access to all features
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}