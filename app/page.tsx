"use client";

import { useEffect, useState } from "react";

export default function Home() {

  const [products, setProducts] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [productId, setProductId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [quantity, setQuantity] = useState("");

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await fetch(
        "http://localhost:3000/api/products"
      );

      const data = await res.json();

      setProducts(data);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Reservation
  const reserveStock = async () => {

    try {

      const res = await fetch(
        "http://localhost:3000/api/reservations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: Number(productId),
            warehouseId: Number(warehouseId),
            quantity: Number(quantity),
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Reservation successful");

        fetchProducts();

      } else {
        alert(data.error);
      }

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10">

      <h1 className="text-4xl font-bold mb-8">
        Inventory Reservation System
      </h1>

      {/* Reservation Form */}

      <div className="bg-white p-6 rounded-xl shadow-md mb-10">

        <h2 className="text-2xl font-semibold mb-4">
          Reserve Stock
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <input
            type="number"
            placeholder="Product ID"
            className="border p-3 rounded"
            value={productId}
            onChange={(e) =>
              setProductId(e.target.value)
            }
          />

          <input
            type="number"
            placeholder="Warehouse ID"
            className="border p-3 rounded"
            value={warehouseId}
            onChange={(e) =>
              setWarehouseId(e.target.value)
            }
          />

          <input
            type="number"
            placeholder="Quantity"
            className="border p-3 rounded"
            value={quantity}
            onChange={(e) =>
              setQuantity(e.target.value)
            }
          />

        </div>

        <button
          onClick={reserveStock}
          className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Reserve
        </button>

      </div>

      {/* Products */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {products.map((product: any) => (

          <div
            key={product.id}
            className="bg-white p-6 rounded-xl shadow-md"
          >

            <h2 className="text-2xl font-bold">
              {product.name}
            </h2>

            <p className="text-lg mt-2">
              Price: ₹{product.price}
            </p>

            <div className="mt-4">

              {product.inventories.map(
                (inventory: any, index: number) => (

                  <div
                    key={index}
                    className="border rounded-lg p-4 mt-3"
                  >

                    <p>
                      <strong>Warehouse:</strong>{" "}
                      {inventory.warehouse}
                    </p>

                    <p>
                      <strong>Total Stock:</strong>{" "}
                      {inventory.totalStock}
                    </p>

                    <p>
                      <strong>Reserved:</strong>{" "}
                      {inventory.reservedStock}
                    </p>

                    <p>
                      <strong>Available:</strong>{" "}
                      {inventory.availableStock}
                    </p>

                  </div>
                )
              )}

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}