import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Aside from "../components/Aside";
import Header from "../components/Header";

// Booking type
type Booking = {
  id: number;
  name: string;
  email: string;
  phone: string;
  plan: string;
  price: string;
  date: string;
  time: string;
  created: string;
  status: string;
};

const bookings: Booking[] = [
  {
    id: 1,
    name: "Rexter Sun",
    email: "rexter@example.com",
    phone: "09023456789",
    plan: "Premium Glow Package",
    price: "₦12,000",
    date: "06/12/2025",
    time: "1:00 PM - 2:00 PM",
    created: "03/12/2025",
    status: "New",
  },
  {
    id: 2,
    name: "Jane Doe",
    email: "janedoe@gmail.com",
    phone: "08123456789",
    plan: "Basic Skin Consultation",
    price: "₦3,000",
    date: "05/12/2025",
    time: "11:00 AM - 12:00 PM",
    created: "02/12/2025",
    status: "Completed",
  },
  {
    id: 3,
    name: "Michael Lee",
    email: "michael@example.com",
    phone: "07099887766",
    plan: "Advanced Skin Consultation",
    price: "₦7,000",
    date: "01/12/2025",
    time: "3:00 PM - 4:00 PM",
    created: "30/11/2025",
    status: "Canceled",
  },
];
export default function BookingDetails() {
  const { id } = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Dummy data

  // Find booking
  useEffect(() => {
    const found = bookings.find((b) => b.id === Number(id)) || null;
    setBooking(found);
  }, [id]);

  if (!booking) {
    return (
      <div className="p-10 text-center text-lg text-gray-600">
        Booking not found...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-purple-950/20">
      {/* Sidebar */}
      <Aside
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Main Section */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <Header
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        {/* PAGE CONTENT */}
        <div className="mt-16 md:ml-64 p-6 md:p-8">
          {/* Title */}
          <h1 className="text-2xl font-bold text-pink-700 dark:text-pink-300 mb-4">
            Booking Details
          </h1>

          {/* Breadcrumb */}
          <p className="text-sm text-gray-500 mb-6 dark:text-gray-300">
            Bookings /
            <span className="text-pink-600 dark:text-pink-300 font-semibold ml-1">
              {booking.name}
            </span>
          </p>

          {/* Booking Information */}
          <div className="bg-white dark:bg-pink-900 p-6 rounded-2xl shadow space-y-6">
            <Detail label="Name" value={booking.name} />
            <Detail label="Email" value={booking.email} />
            <Detail label="Phone" value={booking.phone} />
            <Detail label="Plan" value={booking.plan} />
            <Detail label="Price" value={booking.price} />
            <Detail label="Scheduled Date" value={booking.date} />
            <Detail label="Time" value={booking.time} />
            <Detail label="Created On" value={booking.created} />
            <Detail label="Status" value={booking.status} />
          </div>
        </div>
      </main>
    </div>
  );
}

// Reusable Detail Component
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
