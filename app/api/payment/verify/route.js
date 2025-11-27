import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    const cashfreeOrderId = searchParams.get("cashfreeOrderId");

    if (!orderId || !cashfreeOrderId) {
      return NextResponse.json(
        { error: "Missing order parameters" },
        { status: 400 }
      );
    }

    // Fetch order from database
    const order = await Order.findById(orderId);
    
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Check if order is already paid
    if (order.paymentStatus === "Success") {
      return NextResponse.json({
        success: true,
        status: "already_paid",
        order,
      });
    }

    // Determine Cashfree API URL
    const cashfreeApiUrl = process.env.CASHFREE_ENV === "production"
      ? `https://api.cashfree.com/pg/orders/${cashfreeOrderId}/payments`
      : `https://sandbox.cashfree.com/pg/orders/${cashfreeOrderId}/payments`;

    // Fetch payment status from Cashfree using REST API
    const cashfreeResponse = await fetch(cashfreeApiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2022-09-01",
        "x-client-id": process.env.CASHFREE_CLIENT_ID,
        "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
      },
    });

    if (!cashfreeResponse.ok) {
      const errorData = await cashfreeResponse.json();
      console.error("Cashfree API error:", errorData);
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    const cashfreeData = await cashfreeResponse.json();

    if (!cashfreeData || !Array.isArray(cashfreeData) || cashfreeData.length === 0) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    const payment = cashfreeData[0];
    
    // Check payment status
    if (payment.payment_status === "SUCCESS") {
      // Update order in database
      order.paymentStatus = "Success";
      order.status = "Processing";
      await order.save();

      return NextResponse.json({
        success: true,
        status: "paid",
        order,
      });
    } else if (payment.payment_status === "FAILED") {
      // Update order as failed
      order.paymentStatus = "Failed";
      await order.save();

      return NextResponse.json(
        { error: "Payment failed", status: payment.payment_status },
        { status: 400 }
      );
    } else {
      // Payment is pending
      return NextResponse.json(
        { error: "Payment is pending", status: payment.payment_status },
        { status: 202 }
      );
    }

  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: error.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
