import Image from "next/image";
import Link from "next/link";

export default function ProductCard({ product }) {
  return (
    <Link 
      href={`/product/${product._id}`} 
      className="group block bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 hover:-translate-y-1"
    >
      <div className="aspect-square w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 relative">
        {product.imageURLs && product.imageURLs[0] ? (
          <Image
            src={product.imageURLs[0]}
            alt={product.name}
            fill
            className="object-cover object-center group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <span className="text-sm">No Image</span>
          </div>
        )}
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-700 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-base font-bold text-gray-900">
            ₹{product.price}
          </p>
          <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}
