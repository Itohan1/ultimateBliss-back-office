import { useState } from "react";
import Aside from "../components/Aside.tsx";
import Header from "../components/Header.tsx";

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <Aside
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        {/* Content */}
        <main className="flex-1 p-6 mt-16 md:ml-64 overflow-y-auto">
          <h1 className="text-2xl font-semibold text-pink-700 mb-4">
            Welcome to Ultimate Bliss Backoffice
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-2xl shadow">
              <h2 className="font-semibold text-lg mb-2">Inventory Overview</h2>
              <p className="text-gray-600">
                Track and manage your stock levels.
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow">
              <h2 className="font-semibold text-lg mb-2">Sales Summary</h2>
              <p className="text-gray-600">View total sales and performance.</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow">
              <h2 className="font-semibold text-lg mb-2">User Activity</h2>
              <p className="text-gray-600">Monitor recent user interactions.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
