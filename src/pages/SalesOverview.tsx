import { useEffect, useState } from "react";
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
import type { DiscountType } from "../types/cart";

const naira = new Intl.NumberFormat("en-NG");

const normalizeDiscountType = (
  type?: InventoryItem["pricing"]["discountType"],
): DiscountType => {
  if (type === "percentage" || type === "flat" || type === "free") return type;
  if (type === "promotion") return "percentage";
  return "none";
};

const getDiscountedPrice = (item: InventoryItem): number => {
  const selling = Number(item.pricing?.sellingPrice ?? 0);
  const discount = Number(item.pricing?.discount ?? item.discount ?? 0);
  const type = normalizeDiscountType(item.pricing?.discountType ?? item.discountType);
  const provided = Number(item.pricing?.discountedPrice);

  if (Number.isFinite(provided) && provided >= 0) return provided;
  if (type === "percentage") return Math.max(0, Math.round(selling - (selling * discount) / 100));
  if (type === "flat") return Math.max(0, Math.round(selling - discount));
  return selling;
};

export default function SalesManagement() {
  const ITEMS_PER_PAGE = 10;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const { data: inventory = [], isLoading } = useGetInventoryItemsQuery();
  const { data: cart, refetch } = useGetCartQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [addToCart, { isLoading: adding }] = useAddToCartMutation();
  const [increaseQty] = useIncreaseQtyMutation();
  const [decreaseQty] = useDecreaseQtyMutation();

  const cartItemCount = cart?.items?.reduce((acc, i) => acc + i.quantity, 0) ?? 0;

  function hasProductId(
    item: InventoryItem,
  ): item is InventoryItem & { productId: number } {
    return typeof item.productId === "number";
  }

  const handleAddToCart = async (item: InventoryItem) => {
    const sellingPrice = Number(item.pricing?.sellingPrice ?? 0);
    const discountedPrice = getDiscountedPrice(item);
    const discountType = normalizeDiscountType(item.pricing?.discountType ?? item.discountType);
    const discountValue = Math.max(0, sellingPrice - discountedPrice);

    await addToCart({
      product: {
        productId: item.productId,
        name: item.productName,
        image: item.productImage ?? "",
        sellingPrice,
        discountedPrice,
        discount: discountValue,
        discountType,
        minPurchaseQuantity: item.pricing?.freeOffer?.minQuantityOfPurchase ?? 1,
        freeQuantity: item.pricing?.freeOffer?.freeItemQuantity ?? 1,
        freeItemDescription: item.pricing?.freeOffer?.freeItemDescription ?? "",
        isDiscounted: discountType === "free" || discountedPrice < sellingPrice,
      },
    }).unwrap();

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

  const getCartItem = (productId: number) =>
    cart?.items?.find((i) => i.productId === productId);

  const filteredInventory = inventory
    .filter(hasProductId)
    .filter((item) =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter((item) => (selectedBrand ? item.brandName === selectedBrand : true));

  const totalPages = Math.max(
    1,
    Math.ceil(filteredInventory.length / ITEMS_PER_PAGE),
  );
  const paginatedInventory = filteredInventory.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const brands: string[] = Array.from(
    new Set(
      inventory
        .filter(hasProductId)
        .map((item) => item.brandName)
        .filter(Boolean),
    ),
  ) as string[];

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedBrand]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paginatedInventory.map((item) => {
                const cartItem = getCartItem(item.productId);
                const quantity = cartItem?.quantity ?? 1;
                const sellingPrice = Number(item.pricing?.sellingPrice ?? 0);
                const discountedPrice = getDiscountedPrice(item);
                const discountType = normalizeDiscountType(
                  item.pricing?.discountType ?? item.discountType,
                );
                const discount = Number(item.pricing?.discount ?? item.discount ?? 0);
                const isDiscounted = discountType === "free" || discountedPrice < sellingPrice;

                return (
                  <div
                    key={item.productId}
                    className="bg-white rounded-2xl shadow p-5 flex flex-col"
                  >
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-40 object-cover rounded-xl mb-4"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gray-100 rounded-xl mb-4" />
                    )}

                    <h3 className="font-semibold text-lg">{item.productName}</h3>
                    <p className="text-gray-500">{item.category}</p>

                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <p className="text-xl font-bold text-pink-700">
                        ₦{naira.format(discountedPrice)}
                      </p>

                      {discountType !== "free" && discountedPrice < sellingPrice && (
                        <p className="text-sm text-gray-400 line-through">
                          ₦{naira.format(sellingPrice)}
                        </p>
                      )}

                      {discountType === "percentage" && discount > 0 && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                          -{discount}% OFF
                        </span>
                      )}

                      {discountType === "flat" && discount > 0 && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                          Save ₦{naira.format(discount)}
                        </span>
                      )}

                      {discountType === "free" && item.pricing?.freeOffer && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          Buy {item.pricing.freeOffer.minQuantityOfPurchase ?? 1} Get{" "}
                          {item.pricing.freeOffer.freeItemQuantity ?? 1}{" "}
                          {item.pricing.freeOffer.freeItemDescription ?? "Item"} Free
                        </span>
                      )}
                    </div>

                    {cartItem && (
                      <div className="flex items-center gap-4 mt-4">
                        <button
                          onClick={() => handleDecreaseQty(cartItem.orderItemId)}
                          className="p-2 bg-gray-200 rounded-full"
                        >
                          <Minus size={16} />
                        </button>

                        <span className="font-semibold">{quantity}</span>

                        <button
                          onClick={() => handleIncreaseQty(cartItem.orderItemId)}
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
                        cartItem ? navigate("/admin/cart") : handleAddToCart(item)
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

                    {!isDiscounted && (
                      <p className="text-xs text-gray-400 mt-2">No active discount</p>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-gray-600">
                Showing{" "}
                {filteredInventory.length === 0
                  ? 0
                  : (currentPage - 1) * ITEMS_PER_PAGE + 1}
                {" - "}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredInventory.length)} of{" "}
                {filteredInventory.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
