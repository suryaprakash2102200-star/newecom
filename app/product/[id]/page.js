"use client";

import useCartStore from "@/lib/cartStore";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Share2, ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductPage({ params }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const addItem = useCartStore((state) => state.addItem);

  // Fetch product on mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [params.id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  const nextImage = () => {
    if (product.imageURLs && product.imageURLs.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.imageURLs.length);
    }
  };

  const prevImage = () => {
    if (product.imageURLs && product.imageURLs.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + product.imageURLs.length) % product.imageURLs.length);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24 relative max-w-md mx-auto shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 sticky top-0 bg-white z-10">
        <div className="w-6"></div> {/* Spacer */}
        <h1 className="text-lg font-bold text-black">Alpha Engraving</h1>
        <Link href="/cart">
          <ShoppingBag className="w-6 h-6 text-black" />
        </Link>
      </div>

      {/* Image Carousel */}
      <div className="relative w-full aspect-square bg-gray-100">
        {product.imageURLs && product.imageURLs.length > 0 ? (
          <Image
            src={product.imageURLs[currentImageIndex]}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
        )}

        {/* Navigation Arrows */}
        {product.imageURLs && product.imageURLs.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/50 rounded-full text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/50 rounded-full text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Dots */}
        {product.imageURLs && product.imageURLs.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {product.imageURLs.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full ${
                  currentImageIndex === idx ? "bg-black" : "bg-white border border-gray-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="px-4 py-6 space-y-6">
        <div className="flex items-start justify-between">
          <h2 className="text-2xl font-bold text-black">{product.name}</h2>
          <button className="p-2">
            <Share2 className="w-6 h-6 text-black" />
          </button>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-bold text-black">Shipping</span>
            <span className="flex-1 mx-2 border-b border-dotted border-gray-400 mb-1"></span>
            <span className="text-gray-600">Ships within 1-2 days</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-black">Support</span>
            <span className="flex-1 mx-2 border-b border-dotted border-gray-400 mb-1"></span>
            <span className="text-gray-600">DM me on ig alpha_engraving for queries</span>
          </div>
        </div>

        <div className="text-gray-600 text-sm leading-relaxed">
          {product.description}
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-black px-4 py-3 flex items-center justify-between z-20 max-w-md mx-auto">
        <button
          onClick={() => {
            addItem(product);
            alert("Added to bag!");
          }}
          className="text-white font-bold text-base"
        >
          Add to Bag
        </button>
        <span className="text-white font-bold text-base">₹{product.price}</span>
      </div>
    </div>
  );
}
