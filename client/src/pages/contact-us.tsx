import { Link } from "wouter";
import { ArrowLeft, Mail, MapPin } from "lucide-react";

export default function ContactUs() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <Link href="/" className="flex items-center text-primary hover:text-primary/80 mb-8">
        <ArrowLeft size={20} className="mr-2" />
        Back to Home
      </Link>
      
      <h1 className="font-serif text-4xl font-bold mb-8">Contact Us</h1>
      
      <div className="bg-white p-8 rounded-lg shadow-md">
        <p className="text-lg mb-6">
          Have questions, feedback, or issues?
          We'd love to hear from you.
        </p>
        
        <div className="space-y-6">
          <div className="flex items-start">
            <Mail className="text-primary mr-3 mt-1" />
            <div>
              <p className="font-medium text-gray-800">Email us at:</p>
              <a 
                href="mailto:jewelconnect@gmail.com" 
                className="text-primary hover:underline"
              >
                jewelconnect@gmail.com
              </a>
            </div>
          </div>
          
          <div className="flex items-start">
            <MapPin className="text-primary mr-3 mt-1" />
            <div>
              <p className="font-medium text-gray-800">Based in New York City</p>
              <p className="text-gray-600">Serving the global jewelry community.</p>
            </div>
          </div>
        </div>
        

      </div>
    </main>
  );
}