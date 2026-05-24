export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      productId,
      warehouseId,
      quantity,
    } = body;

    // Find inventory
    const inventory = await prisma.inventory.findFirst({
      where: {
        productId,
        warehouseId,
      },
    });

    if (!inventory) {
      return NextResponse.json(
        { error: "Inventory not found" },
        { status: 404 }
      );
    }

    // Available stock
    const availableStock =
      inventory.totalStock - inventory.reservedStock;

    // Prevent overbooking
    if (availableStock < quantity) {
      return NextResponse.json(
        { error: "Not enough stock available" },
        { status: 400 }
      );
    }

    // Expiry time (15 mins)
    const expiresAt = new Date(
      Date.now() + 15 * 60 * 1000
    );

    // Transaction
    const reservation = await prisma.$transaction(
      async (tx) => {
        // Increase reserved stock
        await tx.inventory.update({
          where: {
            id: inventory.id,
          },
          data: {
            reservedStock: {
              increment: quantity,
            },
          },
        });

        // Create reservation
        return await tx.reservation.create({
          data: {
            productId,
            warehouseId,
            quantity,
            expiresAt,
          },
        });
      }
    );

    return NextResponse.json({
      success: true,
      reservation,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Reservation failed" },
      { status: 500 }
    );
  }
}