import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <Link href="/" className="flex items-center text-primary hover:text-primary/80 mb-8">
        <ArrowLeft size={20} className="mr-2" />
        Back to Home
      </Link>
      
      <h1 className="font-serif text-4xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="bg-white p-8 rounded-lg shadow-md">
        <p className="text-lg mb-6">
          At JewelConnect, your privacy is important to us.
        </p>
        
        <div className="space-y-6">
          <p>
            We only collect the information we need to make the app work and improve your experience. We do not sell your data.
          </p>
          
          <p>
            You're always in control — you can update or delete your info anytime.
          </p>
          
          <p>
            By using JewelConnect, you agree to this policy.
          </p>
        </div>
        
        <div className="mt-10 pt-6 border-t border-gray-200">
          <p className="text-gray-600">
            If you have any questions, contact us at:
            <br />
            <a href="mailto:contact@jewelconnect.com" className="text-primary hover:underline">
              📧 contact@jewelconnect.com
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}