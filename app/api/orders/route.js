import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { items, totalAmount, customerInfo } = body;

    // Validate required fields
    if (!items || !totalAmount || !customerInfo) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create order
    const order = await Order.create({
      items: items.map(item => ({
        productId: item._id,
        quantity: item.quantity
      })),
      totalAmount,
      customerInfo,
      status: "Pending"
    });

    return NextResponse.json({ 
      success: true, 
      orderId: order._id.toString() 
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
