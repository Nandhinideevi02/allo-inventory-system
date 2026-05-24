export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Find expired reservations
    const expiredReservations =
      await prisma.reservation.findMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
          status: "ACTIVE",
        },
      });

    // Process each expired reservation
    for (const reservation of expiredReservations) {

      // Find inventory
      const inventory =
        await prisma.inventory.findFirst({
          where: {
            productId: reservation.productId,
            warehouseId: reservation.warehouseId,
          },
        });

      if (inventory) {
        // Release stock
        await prisma.inventory.update({
          where: {
            id: inventory.id,
          },
          data: {
            reservedStock: {
              decrement: reservation.quantity,
            },
          },
        });
      }

      // Mark reservation expired
      await prisma.reservation.update({
        where: {
          id: reservation.id,
        },
        data: {
          status: "EXPIRED",
        },
      });
    }

    return NextResponse.json({
      success: true,
      expiredReservations:
        expiredReservations.length,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Cleanup failed" },
      { status: 500 }
    );
  }
}