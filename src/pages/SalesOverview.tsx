import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Aside from "../components/Aside";
import Header from "../components/Header";
import { Plus, Minus, ShoppingCart } from "lucide-react";

import { useGetInventoryItemsQuery } from "../services/inventoryApi";
import {
  useAddToCartMutation,
  useGetCartQuery,
  useIncreaseQtyMutation,
  useDecreaseQtyMutation,
} from "../services/cartApi";
import type { InventoryItem } from "../types/InventoryItem";

export default function SalesManagement() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const navigate = useNavigate();

  const { data: inventory = [], isLoading } = useGetInventoryItemsQuery();
  const { data: cart, refetch } = useGetCartQuery();
  const [addToCart, { isLoading: adding }] = useAddToCartMutation();
  const [increaseQty] = useIncreaseQtyMutation();
  const [decreaseQty] = useDecreaseQtyMutation();

  // Compute total items in cart
  const cartItemCount =
    cart?.items?.reduce((acc, i) => acc + i.quantity, 0) ?? 0;

  function hasProductId(
    item: InventoryItem,
  ): item is InventoryItem & { productId: number } {
    return typeof item.productId === "number";
  }

  const handleAddToCart = async (item: InventoryItem) => {
    await addToCart({
      product: {
        productId: item.productId,
        name: item.productName,
        image: item.productImage ?? "",
        price: item.pricing.sellingPrice,
        discount: item.discount,
        discountType: item.discountType,
      },
    }).unwrap();

    // refresh cart so button updates immediately
    refetch();
  };

  const handleIncreaseQty = async (orderItemId: number) => {
    if (!cart) return;
    await increaseQty({ cartId: cart.cartId, orderItemId }).unwrap();
    refetch();
  };

  const handleDecreaseQty = async (orderItemId: number) => {
    if (!cart) return;
    await decreaseQty({ cartId: cart.cartId, orderItemId }).unwrap();
    refetch();
  };

  // Check if an item is already in cart
  const getCartItem = (productId: number) =>
    cart?.items?.find((i) => i.productId === productId);

  // Filter inventory
  const filteredInventory = inventory
    .filter(hasProductId)
    .filter((item) =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter((item) =>
      selectedBrand ? item.brandName === selectedBrand : true,
    );

  const brands = Array.from(
    new Set(
      inventory
        .filter(hasProductId)
        .map((item) => item.brandName)
        .filter(Boolean),
    ),
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Aside
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <main className="flex-1 flex flex-col">
        <Header
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        <section className="mt-16 md:ml-64 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-pink-700">
              Sales Management
            </h1>

            <button
              onClick={() => navigate("/admin/cart")}
              className="relative p-3 bg-white rounded-xl shadow"
            >
              <ShoppingCart />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>

          {/* Search & Brand Filter */}
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              placeholder="Search product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 p-2 border rounded-lg"
            />
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="p-2 border rounded-lg"
            >
              <option value="">All Brands</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          <h2 className="font-semibold text-lg mb-4">Product Listing</h2>

          {isLoading ? (
            <p>Loading inventory...</p>
          ) : filteredInventory.length === 0 ? (
            <p className="text-gray-500">No products found.</p>
          ) : (
            <div className="grid md:grid-cols-4 gap-6">
              {filteredInventory.map((item) => {
                const cartItem = getCartItem(item.productId); // undefined if not in cart
                const quantity = cartItem?.quantity ?? 1;

                return (
                  <div
                    key={item.productId}
                    className="bg-white rounded-2xl shadow p-5 flex flex-col"
                  >
                    {/* Product Image */}
                    {item.productImage && (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-40 object-cover rounded-xl mb-4"
                      />
                    )}

                    <h3 className="font-semibold text-lg">
                      {item.productName}
                    </h3>
                    <p className="text-gray-500">{item.category}</p>
                    <p className="text-xl font-bold text-pink-700 mt-3">
                      ₦{item.pricing.sellingPrice.toLocaleString()}
                    </p>

                    {/* Only show increase/decrease if item is in cart */}
                    {cartItem && (
                      <div className="flex items-center gap-4 mt-4">
                        <button
                          onClick={() =>
                            handleDecreaseQty(cartItem.orderItemId)
                          }
                          className="p-2 bg-gray-200 rounded-full"
                        >
                          <Minus size={16} />
                        </button>

                        <span className="font-semibold">{quantity}</span>

                        <button
                          onClick={() =>
                            handleIncreaseQty(cartItem.orderItemId)
                          }
                          className="p-2 bg-pink-600 text-white rounded-full"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    )}

                    <p className="text-gray-500 mt-2">
                      {item.inventory.stockNumber} units left
                    </p>

                    <button
                      onClick={() =>
                        cartItem
                          ? navigate("/admin/cart")
                          : handleAddToCart(item)
                      }
                      className={`mt-4 w-full py-2 rounded-xl hover:bg-pink-700 ${
                        cartItem
                          ? "bg-gray-400 text-white cursor-pointer"
                          : "bg-pink-600 text-white"
                      }`}
                      disabled={adding}
                    >
                      {cartItem ? "View in Cart" : "Add to Cart"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
