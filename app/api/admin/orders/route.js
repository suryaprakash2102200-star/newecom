import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    
    // Fetch all orders, sorted by most recent first
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Convert _id to string for JSON serialization
    const serializedOrders = orders.map(order => ({
      ...order,
      _id: order._id.toString(),
      items: order.items.map(item => ({
        ...item,
        productId: item.productId.toString(),
      })),
    }));

    return NextResponse.json(serializedOrders);
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
