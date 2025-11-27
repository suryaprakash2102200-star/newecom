"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";

export default function OrderVerifyPage({ params }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const cashfreeOrderId = searchParams.get("order_id");
        
        if (!cashfreeOrderId) {
          // Payment was cancelled or no order ID present
          setPaymentStatus("cancelled");
          setError("Payment was cancelled");
          setVerifying(false);
          return;
        }

        // Call verification API
        const response = await fetch(`/api/payment/verify?orderId=${params.id}&cashfreeOrderId=${cashfreeOrderId}`);
        const data = await response.json();

        if (data.success) {
          setPaymentStatus("success");
          setTimeout(() => {
            router.push(`/order/${params.id}/success`);
          }, 2000);
        } else {
          setPaymentStatus("failed");
          setError(data.error || "Payment verification failed");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setPaymentStatus("failed");
        setError("An error occurred during verification");
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [params.id, searchParams, router]);

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
          <h2 className="text-xl font-bold mb-2">Verifying Payment</h2>
          <p className="text-gray-600">Please wait while we confirm your payment...</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-green-600">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">Redirecting to your order...</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === "failed" || paymentStatus === "cancelled") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-red-600">
            {paymentStatus === "cancelled" ? "Payment Cancelled" : "Payment Failed"}
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push("/checkout")}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push("/cart")}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Return to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
