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

export default function AdminCart() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { data: cart } = useGetCartQuery();
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
                  className="flex justify-between items-center border-b pb-4"
                >
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-gray-500">
                      ₦{item.price.toLocaleString()}
                    </p>
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

              {/* Totals */}
              <div className="text-right pt-4">
                <p>Subtotal: ₦{cart.subTotal.toLocaleString()}</p>
                <p className="font-bold text-lg">
                  Total: ₦{cart.grandTotal.toLocaleString()}
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
