import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    
    // Clear existing products
    await Product.deleteMany({});

    const products = [
      {
        name: "Minimalist Watch",
        price: 120,
        description: "A clean, modern watch for everyday wear.",
        imageURLs: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop"],
      },
      {
        name: "Leather Backpack",
        price: 85,
        description: "Durable leather backpack with ample storage.",
        imageURLs: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop"],
      },
      {
        name: "Wireless Headphones",
        price: 250,
        description: "Premium noise-cancelling headphones.",
        imageURLs: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop"],
      },
      {
        name: "Ceramic Coffee Mug",
        price: 25,
        description: "Handcrafted ceramic mug for your morning brew.",
        imageURLs: ["https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=1000&auto=format&fit=crop"],
      },
    ];

    await Product.insertMany(products);

    return NextResponse.json({ success: true, message: "Database seeded!" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
