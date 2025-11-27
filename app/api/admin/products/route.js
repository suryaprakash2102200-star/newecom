import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { name, price, description, category, imageURLs } = body;

    // Validate required fields
    if (!name || !price || !description || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create product
    const product = await Product.create({
      name,
      price,
      description,
      category,
      imageURLs: imageURLs || [],
    });

    return NextResponse.json({ 
      success: true, 
      product: {
        _id: product._id.toString(),
        name: product.name,
        price: product.price,
      }
    });
  } catch (error) {
    console.error("Product creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
