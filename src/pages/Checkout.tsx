import { useState } from "react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useNavigate } from "react-router-dom";
import Aside from "../components/Aside";
import LoginPopup from "../components/LoginPopup.tsx";
import Header from "../components/Header";
import { Breadcrumb } from "../components/Breadcrumbs";
import { useGetCartQuery } from "../services/cartApi";
import { useGetPaymentMethodsQuery } from "../services/paymentMethodApi";
import { useCreateOrderMutation } from "../services/orderApi";
import type { BillingInfo } from "../types/order";
import toast from "react-hot-toast";
export default function Checkout() {
  const [billing, setBilling] = useState<BillingInfo>({
    firstname: "",
    lastname: "",
    streetAddress: "",
    country: "",
    state: "",
    city: "",
  });
  const [showLogin, setShowLogin] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("");
  const navigate = useNavigate();

  const { data: cart } = useGetCartQuery();
  const { data: paymentMethods } = useGetPaymentMethodsQuery();
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  const handleCheckout = async () => {
    try {
      if (!cart) return;

      if (!selectedPayment) {
        toast.error("Please select a payment method");
        return;
      }

      if (
        !billing.firstname ||
        !billing.lastname ||
        !billing.streetAddress ||
        !billing.city ||
        !billing.state ||
        !billing.country
      ) {
        toast.error("Please complete billing information");
        return;
      }

      await createOrder({
        cartId: cart.cartId,
        billing, // ✅ REQUIRED
        paymentMethodId: selectedPayment,
      }).unwrap();
      toast.success("You have successfully checked-out");
      navigate("/sales");
    } catch (err: unknown) {
      const error = err as FetchBaseQueryError;
      if ("status" in error && error.status === 401) setShowLogin(true);
    }
  };

  if (!cart || cart.items.length === 0)
    return <div className="p-10 text-center text-gray-500">Cart is empty</div>;

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
            Checkout
          </h1>

          <Breadcrumb
            items={[
              { label: "Sales", onClick: () => navigate("/sales") },
              { label: "Cart", onClick: () => navigate("/admin/cart") },
              { label: "Checkout" },
            ]}
          />

          <div className="mt-6">
            <h2 className="font-semibold text-lg mb-3">Billing Information</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                placeholder="First Name"
                className="p-2 border rounded-lg"
                value={billing.firstname}
                onChange={(e) =>
                  setBilling({ ...billing, firstname: e.target.value })
                }
              />

              <input
                placeholder="Last Name"
                className="p-2 border rounded-lg"
                value={billing.lastname}
                onChange={(e) =>
                  setBilling({ ...billing, lastname: e.target.value })
                }
              />

              <input
                placeholder="Street Address"
                className="p-2 border rounded-lg md:col-span-2"
                value={billing.streetAddress}
                onChange={(e) =>
                  setBilling({ ...billing, streetAddress: e.target.value })
                }
              />

              <input
                placeholder="City"
                className="p-2 border rounded-lg"
                value={billing.city}
                onChange={(e) =>
                  setBilling({ ...billing, city: e.target.value })
                }
              />

              <input
                placeholder="State"
                className="p-2 border rounded-lg"
                value={billing.state}
                onChange={(e) =>
                  setBilling({ ...billing, state: e.target.value })
                }
              />

              <input
                placeholder="Country"
                className="p-2 border rounded-lg"
                value={billing.country}
                onChange={(e) =>
                  setBilling({ ...billing, country: e.target.value })
                }
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 space-y-4 mt-4">
            {cart.items.map((item) => (
              <div
                key={item.orderItemId}
                className="flex justify-between items-center border-b pb-4"
              >
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-gray-500">
                    ₦{item.price.toLocaleString()} x {item.quantity}
                  </p>
                </div>
                <p className="font-bold">
                  ₦{(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}

            <div className="text-right pt-4 space-y-2">
              <p>Subtotal: ₦{cart.subTotal.toLocaleString()}</p>
              <p className="font-bold text-lg">
                Total: ₦{cart.grandTotal.toLocaleString()}
              </p>
            </div>

            <div className="mt-6">
              <label className="block mb-2 font-semibold">Payment Method</label>
              <select
                value={selectedPayment}
                onChange={(e) => setSelectedPayment(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Select Payment Method</option>
                {paymentMethods?.map((pm) => (
                  <option key={pm._id} value={pm._id}>
                    {pm.name} {pm.isActive ? "" : "(Inactive)"}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCheckout}
              className="mt-6 w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Place Order"}
            </button>
          </div>
        </section>
      </main>
      {showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
    </div>
  );
}
