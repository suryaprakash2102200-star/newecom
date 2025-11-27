import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { items, totalAmount, customerInfo } = body;

    // Validate required fields
    if (!items || !items.length || !totalAmount || !customerInfo) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate customer info
    const requiredFields = ["name", "email", "phone", "address", "city", "state", "zip"];
    for (const field of requiredFields) {
      if (!customerInfo[field]) {
        return NextResponse.json(
          { error: `Missing customer field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Calculate and validate total
    const calculatedTotal = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // Add processing fee (same as frontend)
    const processingFee = 10.79;
    const expectedTotal = calculatedTotal + processingFee;

    // Allow small floating point differences
    if (Math.abs(expectedTotal - totalAmount) > 0.02) {
      return NextResponse.json(
        { error: `Total amount mismatch. Expected: ₹${expectedTotal.toFixed(2)}, Received: ₹${totalAmount.toFixed(2)}` },
        { status: 400 }
      );
    }

    // Transform items to match Order schema (productId instead of _id)
    const orderItems = items.map(item => ({
      productId: item._id,
      quantity: item.quantity,
      price: item.price,
      name: item.name,
    }));

    // Create order in MongoDB with Pending status
    const order = await Order.create({
      items: orderItems,
      totalAmount,
      customerInfo,
      status: "Pending",
      paymentStatus: "Pending",
    });

    // Generate unique order ID for Cashfree
    const cashfreeOrderId = `order_${order._id}_${Date.now()}`;

    // Determine Cashfree API URL
    const cashfreeApiUrl = process.env.CASHFREE_ENV === "production"
      ? "https://api.cashfree.com/pg/orders"
      : "https://sandbox.cashfree.com/pg/orders";

    // Create Cashfree payment order request
    const cashfreeRequest = {
      order_id: cashfreeOrderId,
      order_amount: parseFloat(totalAmount.toFixed(2)),
      order_currency: "INR",
      customer_details: {
        customer_id: order._id.toString(),
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/order/${order._id}/verify?order_id={order_id}`,
      },
    };

    const cashfreeResponse = await fetch(cashfreeApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2022-09-01",
        "x-client-id": process.env.CASHFREE_CLIENT_ID,
        "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
      },
      body: JSON.stringify(cashfreeRequest),
    });

    if (!cashfreeResponse.ok) {
      const errorData = await cashfreeResponse.json();
      console.error("Cashfree API error:", errorData);
      throw new Error(`Cashfree error: ${errorData.message || 'Unknown error'}`);
    }

    const cashfreeData = await cashfreeResponse.json();

    if (!cashfreeData || !cashfreeData.payment_session_id) {
      throw new Error("Invalid Cashfree response");
    }

    // Update order with Cashfree details
    order.cashfreeOrderId = cashfreeOrderId;
    order.paymentSessionId = cashfreeData.payment_session_id;
    await order.save();

    return NextResponse.json({
      success: true,
      orderId: order._id.toString(),
      paymentSessionId: cashfreeData.payment_session_id,
      cashfreeOrderId: cashfreeOrderId,
    });

  } catch (error) {
    console.error("Payment order creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment order" },
      { status: 500 }
    );
  }
}
