export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        inventories: {
          include: {
            product: true,
          },
        },
      },
    });

    const formattedWarehouses = warehouses.map((warehouse: any) => ({
      id: warehouse.id,
      name: warehouse.name,
      location: warehouse.location,
      products: warehouse.inventories.map((inventory: any) => ({
        productName: inventory.product.name,
        totalStock: inventory.totalStock,
        reservedStock: inventory.reservedStock,
        availableStock:
          inventory.totalStock - inventory.reservedStock,
      })),
    }));

    return NextResponse.json(formattedWarehouses);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch warehouses" },
      { status: 500 }
    );
  }
}