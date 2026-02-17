import { NavLink, useLocation } from "react-router-dom";
//import { X } from "lucide-react";

interface AsideProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (state: boolean) => void;
}

export default function Aside({ isSidebarOpen, setIsSidebarOpen }: AsideProps) {
  const { pathname } = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/", matchPaths: ["/"] },
    {
      name: "Inventory Management",
      path: "/inventory",
      matchPaths: ["/inventory"],
    },
    { name: "Order Management", path: "/orders", matchPaths: ["/orders"] },
    { name: "Sales Management", path: "/sales", matchPaths: ["/sales"] },
    {
      name: "Consultation Management",
      path: "/consultation",
      matchPaths: [
        "/consultation",
        "/consultationplan-detail",
        "/timeslot-detail",
      ],
    },
    {
      name: "User Management",
      path: "/users",
      matchPaths: ["/users", "/user"],
    },
    {
      name: "Booking Management",
      path: "/bookings",
      matchPaths: ["/bookings"],
    },
    { name: "Advertisement Management", path: "/ads", matchPaths: ["/ads"] },
    {
      name: "Admin-Accounts Management",
      path: "/admin-accounts",
      matchPaths: ["/admin-accounts", "/admins/add"],
    },
    {
      name: "PaymentMethod Management",
      path: "/payment-methods",
      matchPaths: ["/payment-methods"],
    },
    {
      name: "Damaged/Returned Management",
      path: "/inventory/returns",
      matchPaths: ["/inventory/returns"],
    },
    {
      name: "Discount Management",
      path: "/discounts",
      matchPaths: ["/discounts"],
    },
    {
      name: "Settings",
      path: "/settings",
      matchPaths: ["/settings"],
    },
    { name: "Learn Management", path: "/learn", matchPaths: ["/learn"] },
  ];

  const isItemActive = (matchPaths: string[]) => {
    return matchPaths.some((matchPath) => {
      if (matchPath === "/") return pathname === "/";
      return pathname === matchPath || pathname.startsWith(`${matchPath}/`);
    });
  };

  return (
    <>
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white shadow-md transition-transform duration-300 flex flex-col overflow-hidden z-40
          ${
            isSidebarOpen
              ? "translate-x-0 w-64"
              : "-translate-x-full md:translate-x-0 md:w-64"
          }`}
      >
        {/*<div className="flex items-center justify-between p-4 border-b md:hidden">
          <span className="font-semibold text-lg">Menu</span>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-gray-500 hover:text-pink-600"
          >
            <X size={22} />
          </button>
        </div>*/}

        <nav className="flex-1 overflow-y-auto mt-4 pb-4">
          {menuItems.map((item) => (
            <NavLink key={item.name} to={item.path}>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className={`w-full text-left px-6 py-3 transition ${
                  isItemActive(item.matchPaths)
                    ? "bg-pink-100 text-pink-700 border-r-4 border-pink-600 font-semibold"
                    : "hover:bg-pink-100 hover:text-pink-700 text-gray-700"
                }`}
              >
                {item.name}
              </button>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden w-[38%] ml-auto"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </>
  );
}
