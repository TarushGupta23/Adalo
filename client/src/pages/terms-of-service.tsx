import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <Link href="/" className="flex items-center text-primary hover:text-primary/80 mb-8">
        <ArrowLeft size={20} className="mr-2" />
        Back to Home
      </Link>
      
      <h1 className="font-serif text-4xl font-bold mb-8">Terms of Service</h1>
      
      <div className="bg-white p-8 rounded-lg shadow-md">
        <p className="text-lg mb-6">
          By using JewelConnect, you agree to our terms:
        </p>
        
        <ul className="space-y-4 list-disc pl-6 mb-8">
          <li className="text-gray-800">
            <span className="font-medium">You are responsible for the accuracy of your profile and business listings.</span>
          </li>
          <li className="text-gray-800">
            <span className="font-medium">Messaging and networking features must be used professionally and respectfully.</span>
          </li>
          <li className="text-gray-800">
            <span className="font-medium">We reserve the right to suspend or remove any user who violates our terms.</span>
          </li>
          <li className="text-gray-800">
            <span className="font-medium">All content remains the property of its respective owners.</span>
          </li>
        </ul>
        
        <p className="text-gray-700 font-medium">
          Please read our full Terms of Service before continuing to use the app.
        </p>
      </div>
    </main>
  );
}