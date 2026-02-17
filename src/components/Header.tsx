import { Bell, User, Search, Menu, LogOut, LogIn } from "lucide-react";
import ultimateLogo from "../assets/ultimateLogo.svg";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoginPopup from "../components/LoginPopup.tsx";
import { useGetCurrentAdminQuery } from "../services/adminApi";

interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (state: boolean) => void;
}

export default function Header({
  isSidebarOpen,
  setIsSidebarOpen,
}: HeaderProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const adminToken = localStorage.getItem("adminToken");
  const location = useLocation();
  const isNotificationPage = location.pathname.startsWith("/notifications");
  const isUserPage =
    location.pathname.startsWith("/users") ||
    location.pathname.startsWith("/user/") ||
    location.pathname.startsWith("/admin-accounts") ||
    location.pathname.startsWith("/admins/") ||
    location.pathname.startsWith("/settings");

  const { data: admin } = useGetCurrentAdminQuery(undefined, {
    skip: !adminToken,
  });

  function handleLogout() {
    setShowLogoutConfirm(true);
  }

  function confirmLogout() {
    localStorage.removeItem("adminToken");
    window.location.reload();
  }

  function handleLogin() {
    setShowLogin(true);
  }

  // 🔹 Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenUserMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="flex justify-between items-center md:py-2 px-4 py-3 border-b bg-white fixed w-full z-50">
        {/* LEFT */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-700 hover:text-pink-600 md:hidden"
          >
            <Menu size={24} />
          </button>

          <img
            src={ultimateLogo}
            alt="Ultimate Bliss"
            className="h-10 object-contain"
          />
          <h1 className="font-semibold text-sm">Ultimate Dashboard</h1>
        </div>

        {/* CENTER SEARCH */}
        <div className="hidden sm:flex items-center w-60 bg-gray-100 rounded-lg px-3 py-2">
          <Search className="text-gray-500" width={18} height={18} />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ml-2 bg-transparent outline-none w-full"
          />
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-6 relative">
          {/* Notifications */}
          <button
            className="relative"
            onClick={() => navigate("/notifications")}
          >
            <Bell
              width={22}
              height={22}
              className={
                isNotificationPage
                  ? "text-pink-600"
                  : "text-gray-600 hover:text-pink-600"
              }
            />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setOpenUserMenu((prev) => !prev)}
              className={`flex items-center gap-2 hover:text-pink-700 ${
                isUserPage ? "text-pink-600" : "text-gray-700"
              }`}
            >
              <User width={24} height={24} />
              <span className="hidden md:inline">
                {admin ? admin.firstname : "Account"}
              </span>
            </button>

            {openUserMenu && (
              <div className="absolute right-0 mt-3 w-48 bg-white border rounded-xl shadow-lg z-50">
                {adminToken ? (
                  <>
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-semibold text-gray-800">
                        {admin?.firstname} {admin?.lastname}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {admin?.email}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setOpenUserMenu(false);
                        navigate("/settings");
                      }}
                      className="w-full border-b px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 rounded-b-xl"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleLogin}
                    className="w-full flex items-center gap-2 px-4 py-3 text-pink-600 hover:bg-gray-100 rounded-xl"
                  >
                    <LogIn size={16} />
                    Login
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
      {showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-80 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Confirm Logout
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to logout?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={confirmLogout}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
