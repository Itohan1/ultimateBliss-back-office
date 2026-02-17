import Aside from "../components/Aside";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import {
  useGetCartQuery,
  useIncreaseQtyMutation,
  useDecreaseQtyMutation,
  useRemoveFromCartMutation,
} from "../services/cartApi";
import { Breadcrumb } from "../components/Breadcrumbs";
import { Plus, Minus, Trash } from "lucide-react";
import { useState } from "react";

const naira = new Intl.NumberFormat("en-NG");

export default function AdminCart() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { data: cart } = useGetCartQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [increaseQty] = useIncreaseQtyMutation();
  const [decreaseQty] = useDecreaseQtyMutation();
  const [removeItem] = useRemoveFromCartMutation();

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
          <h1 className="text-2xl font-semibold text-pink-700 mb-6">
            Admin Cart
          </h1>
          <Breadcrumb
            items={[
              { label: "Sales", onClick: () => navigate("/sales") },
              { label: "Cart" },
            ]}
          />

          {!cart || cart.items.length === 0 ? (
            <div className="p-10 text-center text-gray-500">Cart is empty</div>
          ) : (
            <div className="bg-white rounded-2xl shadow p-6 space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.orderItemId}
                  className="flex justify-between items-center border-b pb-4 gap-4"
                >
                  <div className="flex items-center gap-3">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-gray-100" />
                    )}

                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-gray-500 text-sm">
                        {item.discountType !== "free" &&
                        item.discountedPrice < item.sellingPrice ? (
                          <>
                            <span className="line-through mr-2">
                              ₦{naira.format(item.sellingPrice)}
                            </span>
                            <span className="text-pink-700 font-semibold">
                              ₦{naira.format(item.discountedPrice)}
                            </span>
                          </>
                        ) : (
                          <span>₦{naira.format(item.discountedPrice)}</span>
                        )}
                      </p>
                      {item.discountType === "free" &&
                        (item.freeQuantity ?? 0) > 0 && (
                          <p className="text-xs text-green-700 bg-green-100 inline-block px-2 py-0.5 rounded mt-1">
                            +{item.freeQuantity} free{" "}
                            {item.freeItemDescription ?? "item(s)"} (Buy{" "}
                            {item.minPurchaseQuantity ?? 1})
                          </p>
                        )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        decreaseQty({
                          cartId: cart.cartId,
                          orderItemId: item.orderItemId,
                        })
                      }
                    >
                      <Minus />
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() =>
                        increaseQty({
                          cartId: cart.cartId,
                          orderItemId: item.orderItemId,
                        })
                      }
                    >
                      <Plus />
                    </button>

                    <button
                      onClick={() =>
                        removeItem({
                          cartId: cart.cartId,
                          orderItemId: item.orderItemId,
                        })
                      }
                      className="text-red-500"
                    >
                      <Trash />
                    </button>
                  </div>
                </div>
              ))}

              <div className="text-right pt-4 space-y-1">
                <p>Subtotal: ₦{naira.format(cart.subTotal)}</p>
                <p>Discount: -₦{naira.format(cart.totalDiscount)}</p>
                <p className="font-bold text-lg">
                  Total: ₦{naira.format(cart.grandTotal)}
                </p>
              </div>
              <button
                onClick={() => navigate("/admin/checkout")}
                className="mt-4 w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700"
              >
                Checkout
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
