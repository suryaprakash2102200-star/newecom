"use client";

import useCartStore from "@/lib/cartStore";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Image from "next/image";
import { Heart, Home, Edit2, Truck, CreditCard, Wallet, Smartphone, Check } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total);
  const clearCart = useCartStore((state) => state.clearCart);
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cashfreeLoaded, setCashfreeLoaded] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    paymentMethod: "upi", // Default to UPI as per reference image style
    orderNote: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && items.length === 0) {
      router.push("/cart");
    }
  }, [mounted, items, router]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const isFormValid = () => {
    return (
      formData.name.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.phone.trim() !== "" &&
      formData.address.trim() !== "" &&
      formData.city.trim() !== "" &&
      formData.state.trim() !== "" &&
      formData.zip.trim() !== ""
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setIsSubmitting(true);

    try {
      // Create payment order
      const response = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
          totalAmount: total + 10.79, // Adding processing fee
          customerInfo: formData,
        }),
      });

      const data = await response.json();

      if (!data.success || !data.paymentSessionId) {
        alert(data.error || "Failed to create payment order. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Check if Cashfree SDK is loaded
      if (!window.Cashfree || !cashfreeLoaded) {
        alert("Payment gateway not loaded. Please refresh and try again.");
        setIsSubmitting(false);
        return;
      }

      // Initialize Cashfree
      const cashfree = window.Cashfree({
        mode: process.env.NEXT_PUBLIC_CASHFREE_ENV || "sandbox",
      });

      // Payment options
      const checkoutOptions = {
        paymentSessionId: data.paymentSessionId,
        returnUrl: `${window.location.origin}/order/${data.orderId}/verify`,
      };

      // Open payment modal
      cashfree.checkout(checkoutOptions).then((result) => {
        if (result.error) {
          console.error("Payment error:", result.error);
          alert(result.error.message || "Payment failed. Please try again.");
          setIsSubmitting(false);
        }
        if (result.redirect) {
          // Payment will redirect to returnUrl
          console.log("Payment initiated, redirecting...");
        }
        if (result.paymentDetails) {
          // Payment completed
          console.log("Payment completed:", result.paymentDetails);
          clearCart();
          router.push(`/order/${data.orderId}/success`);
        }
      });

    } catch (error) {
      console.error("Checkout error:", error);
      alert("An error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      {/* Load Cashfree SDK */}
      <Script
        src="https://sdk.cashfree.com/js/v3/cashfree.js"
        onLoad={() => setCashfreeLoaded(true)}
        onError={() => {
          console.error("Failed to load Cashfree SDK");
          alert("Payment gateway failed to load. Please refresh the page.");
        }}
      />
      
      <div className="min-h-screen py-8 bg-gray-50 font-sans">
      <div className="max-w-md mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8">
          <Heart className="w-8 h-8 text-pink-500 fill-current mb-2" />
          <h1 className="text-2xl font-bold text-gray-900">Thank you</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Contact Info Section */}
          <div className="space-y-3">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                className="w-full bg-transparent border-none focus:ring-0 p-0 text-base text-gray-900 placeholder-gray-400"
                required
              />
            </div>
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-2 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
              <span className="text-gray-400">@</span>
              <input
                type="text"
                placeholder="Instagram (Optional)"
                className="w-full bg-transparent border-none focus:ring-0 p-0 text-base text-gray-900 placeholder-gray-400"
              />
            </div>
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-2 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
              <span className="text-lg">🇮🇳</span>
              <span className="text-gray-500 text-sm">+91</span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                className="w-full bg-transparent border-none focus:ring-0 p-0 text-base text-gray-900 placeholder-gray-400"
                required
              />
            </div>
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full bg-transparent border-none focus:ring-0 p-0 text-base text-gray-900 placeholder-gray-400"
                required
              />
            </div>
          </div>

          {/* Shipping Address Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Home className="w-5 h-5 text-orange-500" />
              <h2 className="text-base font-semibold text-gray-700">Shipping Address</h2>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-3 relative group focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
              <div className="pr-8">
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street Address"
                  rows={2}
                  className="w-full bg-transparent border-none focus:ring-0 p-0 text-base text-gray-900 placeholder-gray-400 resize-none"
                  required
                />
              </div>
              <Edit2 className="w-4 h-4 text-gray-400 absolute top-4 right-4 cursor-pointer" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
                <input
                  type="text"
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                  placeholder="ZIP Code"
                  className="w-full bg-transparent border-none focus:ring-0 p-0 text-base text-gray-900 placeholder-gray-400"
                  required
                />
              </div>
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="w-full bg-transparent border-none focus:ring-0 p-0 text-base text-gray-900 placeholder-gray-400"
                  required
                />
              </div>
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  className="w-full bg-transparent border-none focus:ring-0 p-0 text-base text-gray-900 placeholder-gray-400"
                  required
                />
              </div>
              <div className="bg-gray-100 rounded-lg px-4 py-3 flex items-center justify-center">
                <span className="text-sm text-gray-700 font-medium">India</span>
              </div>
            </div>
          </div>

          {/* Order Note */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Edit2 className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-semibold text-gray-700">Order Note</h2>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 relative focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
              <textarea
                name="orderNote"
                value={formData.orderNote}
                onChange={handleChange}
                placeholder="Got any special requests or notes for your order? Let us know here!"
                rows={3}
                className="w-full bg-transparent border-none focus:ring-0 p-0 text-base text-gray-900 placeholder-gray-400 resize-none"
              />
              <Edit2 className="w-4 h-4 text-gray-400 absolute bottom-4 right-4" />
            </div>
          </div>

          {/* Delivery Options */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Truck className="w-5 h-5 text-orange-400" />
              <h2 className="text-base font-semibold text-gray-700">Delivery Options</h2>
            </div>
            <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-black rounded flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Regular Delivery</p>
                  <p className="text-xs text-gray-500">Ships within 1-2 day(s)</p>
                </div>
              </div>
              <span className="text-sm font-bold">₹0</span>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-5 h-5 text-blue-500" />
              <h2 className="text-base font-semibold text-gray-700">Payment Method</h2>
            </div>
            <div className="bg-gray-100 rounded-xl overflow-hidden">
              {[
                { id: 'upi', label: 'UPI', icon: Smartphone },
                { id: 'netbanking', label: 'Netbanking', icon: Home },
                { id: 'card', label: 'Debit Card', icon: CreditCard },
                { id: 'credit', label: 'Credit Card', icon: CreditCard },
                { id: 'wallet', label: 'Wallets', icon: Wallet },
              ].map((method) => (
                <label key={method.id} className="flex items-center justify-between p-4 border-b border-gray-200 last:border-0 cursor-pointer hover:bg-gray-50">
                  <span className="text-sm font-medium text-gray-700">{method.label}</span>
                  <div className={`w-5 h-5 border rounded flex items-center justify-center ${
                    formData.paymentMethod === method.id ? 'bg-black border-black' : 'border-gray-400'
                  }`}>
                    {formData.paymentMethod === method.id && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={formData.paymentMethod === method.id}
                    onChange={handleChange}
                    className="hidden"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-100 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-orange-200 flex items-center justify-center">
                <span className="text-xs text-orange-700">📦</span>
              </div>
              <h2 className="text-base font-bold text-gray-900">Your Order</h2>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <div key={item._id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.name} x {item.quantity}</span>
                  <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping Fee</span>
                <span className="font-medium">₹0.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Processing Fee</span>
                <span className="font-medium">₹10.79</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <input
                  type="text"
                  placeholder="Have a Promo code?"
                  className="bg-transparent border-none text-sm placeholder-gray-400 focus:ring-0 p-0"
                />
              </div>
              
              <button
                type="submit"
                disabled={!isFormValid() || isSubmitting}
                className="w-full bg-black text-white py-4 rounded-lg font-bold text-sm flex justify-between px-6 hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Proceed to Pay</span>
                <span>₹{(total + 10.79).toFixed(2)}</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
    </>
  );
}
