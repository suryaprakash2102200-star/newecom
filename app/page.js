import ProductCard from "@/components/ProductCard";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Link from "next/link";

async function getData(searchParams) {
  await dbConnect();
  
  const categorySlug = searchParams?.category;
  const filter = categorySlug ? { category: categorySlug } : {};
  
  const products = await Product.find(filter).lean();
  const categories = await Category.find({}).lean();

  return {
    products: products.map(p => ({ ...p, _id: p._id.toString() })),
    categories: categories.map(c => ({ ...c, _id: c._id.toString() })),
  };
}

export default async function Home({ searchParams }) {
  const { products, categories } = await getData(searchParams);
  const currentCategory = searchParams?.category;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
          <div className="text-center space-y-4 animate-fade-in">
            <Link href="/" className="flex items-center justify-center text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
              Articuture
            </Link>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              Discover our handcrafted collection of personalized engravings
            </p>
          </div>
          
          {/* Category Filters */}
          <div className="flex justify-center gap-2 sm:gap-3 flex-wrap mt-8">
            <Link
              href="/"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 shadow-sm ${
                !currentCategory 
                  ? "bg-black text-white hover:bg-gray-800" 
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              All Products
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/?category=${cat.slug}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 shadow-sm ${
                  currentCategory === cat.slug
                    ? "bg-black text-white hover:bg-gray-800"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 bg-white">
        <div className="grid grid-cols-2 gap-4">
          {products.map((product, index) => (
            <div 
              key={product._id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        
        {products.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-block p-8 bg-gray-50 rounded-2xl">
              <p className="text-gray-500 text-lg">No products found</p>
              <p className="text-gray-400 text-sm mt-2">Try selecting a different category</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
