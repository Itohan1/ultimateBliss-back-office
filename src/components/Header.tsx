import { Bell, User, Search, Menu } from "lucide-react";
import ultimateLogo from "../assets/ultimateLogo.svg";
import { useState } from "react";

interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (state: boolean) => void;
}

export default function Header({
  isSidebarOpen,
  setIsSidebarOpen,
}: HeaderProps) {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <header className="flex justify-center gap-20 items-center md:py-2 px-4 py-3 border-b bg-white fixed w-full z-50">
      <div className="flex items-center space-x-2">
        {/* Hamburger button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-gray-700 hover:text-pink-600 md:hidden"
        >
          <Menu size={24} />
        </button>
        <img
          src={ultimateLogo}
          alt="Ultimate Bliss"
          className="h-10 md:h-15 object-contain"
        />
        <h1 className="font-semibold text-sm">Ultimate Dashboard</h1>
      </div>

      {/*<div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-2 top-2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-8 pr-3 py-1.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400"
          />
        </div>
        <Bell className="text-gray-600 cursor-pointer" />
        <User className="text-gray-600 cursor-pointer" />
      </div>*/}
      <div className="flex gap-140">
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

        <div className="flex items-center gap-6">
          <button className="relative">
            <Bell
              width={22}
              height={22}
              className="text-gray-600 hover:text-pink-600"
            />
            <span className="absolute top-0 right-0 inline-flex items-center justify-center w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center gap-2 cursor-pointer hover:text-pink-700">
            <User width={24} height={24} />
            <span className="hidden md:inline">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
