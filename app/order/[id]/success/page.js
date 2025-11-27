import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function OrderSuccessPage({ params }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle className="w-20 h-20 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900">
          Order Placed Successfully!
        </h1>
        
        <p className="text-gray-600">
          Thank you for your order. Your order ID is:
        </p>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <code className="text-sm font-mono text-gray-900">
            {params.id}
          </code>
        </div>
        
        <p className="text-sm text-gray-500">
          We'll send you a confirmation email with order details shortly.
        </p>
        
        <Link
          href="/"
          className="inline-block mt-6 px-8 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
