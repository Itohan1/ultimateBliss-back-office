import { Link } from "react-router-dom";
//import { X } from "lucide-react";

interface AsideProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (state: boolean) => void;
}

export default function Aside({ isSidebarOpen, setIsSidebarOpen }: AsideProps) {
  const menuItems = [
    { name: "Dashboard", path: "/" },
    { name: "Inventory Management", path: "/inventory" },
    { name: "Sales Management", path: "/sales" },
    { name: "User Management", path: "/users" },
    { name: "Booking Management", path: "/bookings" },
    { name: "Advertisement Management", path: "/ads" },
    { name: "Learn Management", path: "/learn" },
    { name: "Settings", path: "/settings" },
  ];

  return (
    <>
      <aside
        className={`fixed top-16 left-0 h-[calc(100%-4rem)] bg-white shadow-md transition-transform duration-300
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

        <nav className="flex-1 overflow-y-auto mt-4">
          {menuItems.map((item) => (
            <Link key={item.name} to={item.path}>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="w-full text-left px-6 py-3 hover:bg-pink-100 hover:text-pink-700 transition"
              >
                {item.name}
              </button>
            </Link>
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
