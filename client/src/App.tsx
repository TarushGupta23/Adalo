import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import GuestModeSplash from "@/components/guest-mode-splash";
import { FixedGuestButton } from "@/components/ui/fixed-guest-button";

import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import DirectoryPage from "@/pages/directory-page";
import ProfilePage from "@/pages/profile-page";
import TestProfile from "@/pages/test-profile";
import EventsPage from "@/pages/events-page";
import MessagesPage from "@/pages/messages-page";
import InventoryPage from "@/pages/inventory-page";
import GemstoneMarketplace from "@/pages/gemstone-marketplace";
import CartPage from "@/pages/cart-page";
import OrdersPage from "@/pages/orders-page";
import JewelryMarketplace from "@/pages/jewelry-marketplace";
import GroupPurchasePage from "@/pages/group-purchase-page";
import CommunityGuidelines from "@/pages/community-guidelines";
import TermsOfService from "@/pages/terms-of-service";
import PrivacyPolicy from "@/pages/privacy-policy";
import ContactUs from "@/pages/contact-us";
import AdminDashboard from "@/pages/admin-dashboard";
import DeveloperManagement from "@/pages/developer-management";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Public routes - Available without authentication */}
      <Route path="/auth" component={AuthPage} />
      <Route path="/directory" component={DirectoryPage} />
      <Route path="/community-guidelines" component={CommunityGuidelines} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/contact-us" component={ContactUs} />
      <Route path="/contact" component={ContactUs} />
      
      {/* All other pages require authentication */}
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/profile/:id" component={ProfilePage} />
      <ProtectedRoute path="/test-profile" component={TestProfile} />
      <ProtectedRoute path="/events" component={EventsPage} />
      <ProtectedRoute path="/gemstone-marketplace" component={GemstoneMarketplace} />
      <ProtectedRoute path="/jewelry-marketplace" component={JewelryMarketplace} />
      <ProtectedRoute path="/group-purchases" component={GroupPurchasePage} />
      <ProtectedRoute path="/messages" component={MessagesPage} />
      <ProtectedRoute path="/inventory" component={InventoryPage} />
      <ProtectedRoute path="/cart" component={CartPage} />
      <ProtectedRoute path="/orders" component={OrdersPage} />
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <ProtectedRoute path="/admin-dashboard" component={AdminDashboard} />
      <ProtectedRoute path="/developer-management" component={DeveloperManagement} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          <GuestModeSplash />
          
          {/* Fixed guest browsing button that stays visible on all pages */}
          <FixedGuestButtonWrapper />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Component that displays guest button only for non-logged in users
function FixedGuestButtonWrapper() {
  const { user } = useAuth();
  
  if (user) return null;
  
  return <FixedGuestButton />;
}

export default App;
