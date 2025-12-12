import { useState } from "react";
import Aside from "../components/Aside";
import Header from "../components/Header";

export default function UserDetails() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-purple-950/20">
      {/* Aside */}
      <Aside
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Main Section */}
      <main className="flex-1 flex flex-col w-full overflow-y-auto">
        {/* Header */}
        <Header
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        {/* Page Content */}
        <div className="mt-16 md:ml-64 p-6 md:p-8">
          {/* Page Title */}
          <h1 className="text-2xl font-bold text-pink-700 dark:text-pink-300 mb-4">
            User Management
          </h1>

          {/* Breadcrumb */}
          <p className="text-sm text-gray-500 mb-6 dark:text-gray-300">
            Buyer /{" "}
            <span className="text-pink-600 dark:text-pink-300 font-semibold">
              Rexter
            </span>
          </p>

          {/* User Summary */}
          <div className="bg-white dark:bg-pink-900 p-6 rounded-2xl shadow mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-pink-200 dark:bg-pink-700 rounded-full flex items-center justify-center text-xl font-bold text-pink-900 dark:text-white">
                R
              </div>

              <div>
                <h2 className="text-xl font-bold dark:text-white">Rexter</h2>
                <p className="text-gray-500 dark:text-gray-300">
                  rexop89727@besenica.com
                </p>
              </div>
            </div>

            {/* Status & Actions */}
            <div className="flex items-center gap-4 mt-6">
              <span className="px-4 py-1 text-sm rounded-full bg-green-200 text-green-700 dark:bg-green-700 dark:text-white font-medium">
                Active
              </span>

              <button className="px-4 py-2 bg-yellow-500 text-white rounded-xl shadow hover:bg-yellow-600">
                Suspend
              </button>

              <button className="px-4 py-2 bg-red-600 text-white rounded-xl shadow hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>

          {/* Personal Details */}
          <div className="bg-white dark:bg-pink-900 p-6 rounded-2xl shadow mb-8">
            <h3 className="text-lg font-bold mb-4 dark:text-white">
              Personal Details
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <Detail label="Phone Number" value="---" />
              <Detail label="Email" value="rexop89727@besenica.com" />
              <Detail label="Date Joined" value="December 2, 2025" />
              <Detail label="Last Login" value="December 2, 2025" />
              <Detail label="Address" value="---" />
              <Detail label="Date of Birth" value="---" />
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white dark:bg-pink-900 p-6 rounded-2xl shadow">
            <h3 className="text-lg font-bold mb-4 dark:text-white">
              Recent Orders
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-500 dark:text-gray-300 border-b border-gray-200 dark:border-pink-700">
                    <th className="py-3">Date</th>
                    <th className="py-3">Order ID</th>
                    <th className="py-3">Deal</th>
                    <th className="py-3">Unit</th>
                    <th className="py-3">Price</th>
                    <th className="py-3">Status</th>
                  </tr>
                </thead>

                <tbody className="dark:text-white">
                  {[
                    [
                      "03/12/2025",
                      "TEVER-ADDB318B08F1",
                      "checking shipping",
                      1,
                      "₦7,000",
                    ],
                    [
                      "03/12/2025",
                      "TEVER-006143A83099",
                      "check v",
                      1,
                      "₦50,000",
                    ],
                    [
                      "26/11/2025",
                      "TEVER-CAB3DF31C43F",
                      "check v",
                      2,
                      "₦50,000",
                    ],
                    [
                      "25/11/2025",
                      "TEVER-42A57A975B42",
                      "check v",
                      1,
                      "₦50,000",
                    ],
                    [
                      "25/11/2025",
                      "TEVER-45949E316EAE",
                      "check v",
                      1,
                      "₦50,000",
                    ],
                  ].map((row, i) => (
                    <tr key={i} className="border-b dark:border-pink-700">
                      <td className="py-3">{row[0]}</td>
                      <td>{row[1]}</td>
                      <td>{row[2]}</td>
                      <td>{row[3]}</td>
                      <td>{row[4]}</td>
                      <td className="text-yellow-600 font-medium">Pending</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

interface DetailProp {
  label: string;
  value: string;
}

function Detail({ label, value }: DetailProp) {
  return (
    <div>
      <p className="text-gray-500 dark:text-gray-300 text-sm">{label}</p>
      <p className="font-medium dark:text-white">{value}</p>
    </div>
  );
}
