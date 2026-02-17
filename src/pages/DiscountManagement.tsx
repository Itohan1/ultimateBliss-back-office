import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import Aside from "../components/Aside";
import Header from "../components/Header";
import { Breadcrumb } from "../components/Breadcrumbs";
import { useNavigate } from "react-router-dom";
import { useGetInventoryItemsQuery } from "../services/inventoryApi";
import { useGetCategoriesQuery } from "../services/categoryApi";
import {
  useApplyDiscountMutation,
  useGetDiscountedItemsQuery,
  useRemoveDiscountMutation,
} from "../services/discountApi";
import { getErrorMessage } from "../getErrorMessage";

type TargetType = "all" | "selected" | "category";
type DiscountType = "percentage" | "flat" | "free";

export default function DiscountManagement() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data: products = [], refetch: refetchProducts } =
    useGetInventoryItemsQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: discountedItems = [], isLoading } =
    useGetDiscountedItemsQuery();
  const [applyDiscount, { isLoading: isApplying }] = useApplyDiscountMutation();
  const [removeDiscount, { isLoading: isRemoving }] =
    useRemoveDiscountMutation();

  const [target, setTarget] = useState<TargetType>("selected");
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");

  const [discountType, setDiscountType] = useState<DiscountType>("percentage");
  const [discount, setDiscount] = useState("");
  const [minQuantityOfPurchase, setMinQuantityOfPurchase] = useState("");
  const [freeItemQuantity, setFreeItemQuantity] = useState("");
  const [freeItemDescription, setFreeItemDescription] = useState("");

  const availableSubcategories = useMemo(
    () => categories.find((c) => c.name === category)?.subcategories || [],
    [categories, category],
  );

  const selectableProducts = useMemo(() => {
    const term = productSearch.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) => {
      return (
        product.productName.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        (product.subcategory || "").toLowerCase().includes(term)
      );
    });
  }, [products, productSearch]);

  const buildTargetPayload = () => ({
    target,
    ...(target === "selected" ? { productIds: selectedProductIds } : {}),
    ...(target === "category" ? { category, subcategory } : {}),
  });

  const validateTarget = () => {
    if (target === "selected" && selectedProductIds.length === 0) {
      toast.error("Select at least one product");
      return false;
    }
    if (target === "category" && !category) {
      toast.error("Select a category");
      return false;
    }
    return true;
  };

  const handleApplyDiscount = async () => {
    if (!validateTarget()) return;

    const numericDiscount = Number(discount) || 0;
    if (
      (discountType === "percentage" || discountType === "flat") &&
      numericDiscount <= 0
    ) {
      toast.error(
        "Discount must be greater than 0 for percentage or flat type",
      );
      return;
    }

    if (discountType === "percentage" && numericDiscount > 100) {
      toast.error("Percentage discount cannot exceed 100%");
      return;
    }

    if (discountType === "free") {
      const minQty = Number(minQuantityOfPurchase) || 0;
      const freeQty = Number(freeItemQuantity) || 0;
      if (minQty <= 0 || freeQty <= 0) {
        toast.error("Free offer quantities must be greater than 0");
        return;
      }
    }

    try {
      await applyDiscount({
        ...buildTargetPayload(),
        discountType,
        discount: discountType === "free" ? 0 : numericDiscount,
        freeOffer:
          discountType === "free"
            ? {
                minQuantityOfPurchase: Number(minQuantityOfPurchase) || 0,
                freeItemQuantity: Number(freeItemQuantity) || 0,
                freeItemDescription: freeItemDescription.trim(),
              }
            : undefined,
      }).unwrap();

      toast.success("Discount applied successfully");
      await refetchProducts();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to apply discount"));
    }
  };

  const handleRemoveDiscount = async () => {
    if (!validateTarget()) return;

    try {
      await removeDiscount(buildTargetPayload()).unwrap();
      toast.success("Discount removed successfully");
      await refetchProducts();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to remove discount"));
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      <Aside
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <main className="flex-1 flex flex-col w-full overflow-y-auto">
        <Header
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <section className="mt-16 md:ml-64 flex-1 p-2 sm:p-6">
          <h1 className="text-2xl font-semibold text-pink-700 mb-4">
            Discount Management
          </h1>
          <Breadcrumb
            items={[
              { label: "Inventory", onClick: () => navigate("/inventory") },
              { label: "Discount Management" },
            ]}
          />

          <section className="bg-white rounded-2xl p-6 shadow mt-4">
            <h2 className="font-semibold text-lg mb-4">Setup Discount</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Target</label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value as TargetType)}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                >
                  <option value="selected">Selected Products</option>
                  <option value="all">All Products</option>
                  <option value="category">Category/Subcategory</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Discount Type</label>
                <select
                  value={discountType}
                  onChange={(e) =>
                    setDiscountType(e.target.value as DiscountType)
                  }
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Amount (NGN)</option>
                  <option value="free">Buy X Get Y Free</option>
                </select>
              </div>

              {target === "category" && (
                <>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <select
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        setSubcategory("");
                      }}
                      className="mt-1 w-full border rounded-lg px-3 py-2"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Subcategory (optional)
                    </label>
                    <select
                      value={subcategory}
                      onChange={(e) => setSubcategory(e.target.value)}
                      className="mt-1 w-full border rounded-lg px-3 py-2"
                    >
                      <option value="">All subcategories</option>
                      {availableSubcategories.map((sub) => (
                        <option key={sub.subId} value={sub.name}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {(discountType === "percentage" || discountType === "flat") && (
                <div>
                  <label className="text-sm font-medium">
                    {discountType === "percentage"
                      ? "Discount (%)"
                      : "Discount (NGN)"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                  />
                </div>
              )}

              {discountType === "free" && (
                <>
                  <div>
                    <label className="text-sm font-medium">
                      Min Quantity Of Purchase
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={minQuantityOfPurchase}
                      onChange={(e) => setMinQuantityOfPurchase(e.target.value)}
                      className="mt-1 w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Free Item Quantity
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={freeItemQuantity}
                      onChange={(e) => setFreeItemQuantity(e.target.value)}
                      className="mt-1 w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">
                      Free Item Description
                    </label>
                    <input
                      type="text"
                      value={freeItemDescription}
                      onChange={(e) => setFreeItemDescription(e.target.value)}
                      className="mt-1 w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                </>
              )}
            </div>

            {target === "selected" && (
              <div className="mt-4">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products by name, SKU, category..."
                  className="mb-3 w-full border rounded-lg px-3 py-2"
                />
                <div className="border rounded-lg p-3 max-h-56 overflow-auto">
                  {selectableProducts.map((product) => (
                    <label
                      key={product.productId}
                      className="flex items-center gap-2 py-1"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProductIds.includes(product.productId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProductIds((prev) => [
                              ...prev,
                              product.productId,
                            ]);
                          } else {
                            setSelectedProductIds((prev) =>
                              prev.filter((id) => id !== product.productId),
                            );
                          }
                        }}
                      />
                      <span className="text-sm">
                        {product.productName} ({product.sku})
                      </span>
                    </label>
                  ))}
                  {selectableProducts.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No matching products found.
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4 flex gap-3">
              <button
                onClick={handleApplyDiscount}
                disabled={isApplying}
                className="px-4 py-2 rounded-lg bg-pink-700 text-white hover:bg-pink-600 disabled:opacity-50"
              >
                {isApplying ? "Applying..." : "Apply Discount"}
              </button>
              <button
                onClick={handleRemoveDiscount}
                disabled={isRemoving}
                className="px-4 py-2 rounded-lg border border-red-500 text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {isRemoving ? "Removing..." : "Remove Discount"}
              </button>
            </div>
          </section>

          <section className="bg-white rounded-2xl p-6 shadow mt-6">
            <h2 className="font-semibold text-lg mb-4">
              Discounted / Free Offer Products
            </h2>
            {isLoading ? (
              <p>Loading discounted items...</p>
            ) : discountedItems.length === 0 ? (
              <p className="text-gray-500">No discounted products found.</p>
            ) : (
              <div>
                <div className="hidden md:block overflow-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                        <th className="px-3 py-2">Product</th>
                        <th className="px-3 py-2">Category</th>
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-sm">
                      {discountedItems.map((item) => (
                        <tr key={item.productId}>
                          <td className="px-3 py-2">
                            {item.productName} ({item.sku})
                          </td>
                          <td className="px-3 py-2">
                            {item.category}
                            {item.subcategory ? ` / ${item.subcategory}` : ""}
                          </td>
                          <td className="px-3 py-2">
                            {item.pricing.discountType}
                          </td>
                          <td className="px-3 py-2">
                            {item.pricing.discountType === "percentage"
                              ? `${item.pricing.discount ?? 0}%`
                              : item.pricing.discountType === "flat"
                                ? `NGN ${(item.pricing.discount ?? 0).toLocaleString()}`
                                : `Buy ${
                                    item.pricing.freeOffer
                                      ?.minQuantityOfPurchase ?? 0
                                  } Get ${item.pricing.freeOffer?.freeItemQuantity ?? 0} ${
                                    item.pricing.freeOffer
                                      ?.freeItemDescription || "item"
                                  } Free`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden space-y-3">
                  {discountedItems.map((item) => (
                    <div
                      key={item.productId}
                      className="border border-gray-200 rounded-xl p-4"
                    >
                      <p className="font-semibold">
                        {item.productName} ({item.sku})
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Category: {item.category}
                        {item.subcategory ? ` / ${item.subcategory}` : ""}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Type: {item.pricing.discountType}
                      </p>
                      <p className="text-sm text-gray-700 mt-2">
                        {item.pricing.discountType === "percentage"
                          ? `${item.pricing.discount ?? 0}%`
                          : item.pricing.discountType === "flat"
                            ? `NGN ${(item.pricing.discount ?? 0).toLocaleString()}`
                            : `Buy ${
                                item.pricing.freeOffer?.minQuantityOfPurchase ??
                                0
                              } Get ${item.pricing.freeOffer?.freeItemQuantity ?? 0} ${
                                item.pricing.freeOffer?.freeItemDescription ||
                                "item"
                              } Free`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}
