import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard.tsx";
import Inventory from "./pages/Inventory.tsx";
import ScrollToTop from "./components/ScrollToTop.tsx";
import AddProduct from "./pages/AddProduct";
import ViewProduct from "./pages/ViewProduct";
import SalesManagement from "./pages/SalesOverview.tsx";
import UserManagement from "./pages/UserManagement.tsx";
import UserDetails from "./pages/UserDetails.tsx";
import BookingManagement from "./pages/Booking.tsx";
import BookingDetails from "./pages/BookingDetails.tsx";
import AdvertisementManagement from "./pages/AdManagement.tsx";
function App() {
  return (
    <Router>
      <ScrollToTop />
      {/*<Navigationbar />*/}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/bookings" element={<BookingManagement />} />
        <Route path="/booking/:id" element={<BookingDetails />} />
        <Route path="/user/:id" element={<UserDetails />} />
        <Route path="/inventory" element={<Inventory />}></Route>
        <Route path="/sales" element={<SalesManagement />}></Route>
        <Route path="/ads" element={<AdvertisementManagement />} />
        <Route path="/inventory/view-product" element={<ViewProduct />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/inventory/add-product" element={<AddProduct />}></Route>
        {/*<Route path="/about-us" element={<AboutUs />} />
        <Route path="our-programs" element={<Programs />} />
        <Route path="shows" element={<Shows />} />
        <Route path="impact" element={<Impact />} />
        <Route path="get-involved" element={<GetInvolved />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/contact" element={<Contact />} />*/}
      </Routes>
    </Router>
  );
}

export default App;
