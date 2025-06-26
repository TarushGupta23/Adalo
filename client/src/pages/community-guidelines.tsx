import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function CommunityGuidelines() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <Link href="/" className="flex items-center text-primary hover:text-primary/80 mb-8">
        <ArrowLeft size={20} className="mr-2" />
        Back to Home
      </Link>
      
      <h1 className="font-serif text-4xl font-bold mb-8">Community Guidelines</h1>
      
      <div className="bg-white p-8 rounded-lg shadow-md">
        <p className="text-lg mb-6">
          Let's keep JewelConnect safe, professional, and inspiring.
          To ensure a respectful and valuable experience for everyone, please follow these guidelines:
        </p>
        
        <ul className="space-y-4 list-disc pl-6 mb-8">
          <li className="text-gray-800">
            <span className="font-medium">Only share accurate business information.</span>
          </li>
          <li className="text-gray-800">
            <span className="font-medium">Be respectful in chats and public interactions.</span>
          </li>
          <li className="text-gray-800">
            <span className="font-medium">No spamming or unsolicited promotions.</span>
          </li>
          <li className="text-gray-800">
            <span className="font-medium">Report any inappropriate behavior.</span>
          </li>
        </ul>
        
        <p className="text-gray-700 font-medium">
          Accounts that violate these rules may be restricted or removed.
        </p>
      </div>
    </main>
  );
}