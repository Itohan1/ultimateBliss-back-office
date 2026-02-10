import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard.tsx";
import Inventory from "./pages/Inventory.tsx";
import ScrollToTop from "./components/ScrollToTop.tsx";
import AddProduct from "./pages/AddProduct";
import ViewProduct from "./pages/ViewProduct";
import AdminOrders from "./pages/OrderManagement.tsx";
import SalesManagement from "./pages/SalesOverview.tsx";
import UserManagement from "./pages/UserManagement.tsx";
import UserDetails from "./pages/UserDetails.tsx";
import AddCategory from "./pages/AddCategory.tsx";
import AdvertisementManagement from "./pages/AdManagement.tsx";
import CategoriesList from "./pages/Categories.tsx";
import CategoryDetails from "./pages/CategoryDetails.tsx";
import PaymentMethods from "./pages/PaymentMethods.tsx";
import OrderDetails from "./pages/OrderDetails.tsx";
import ConsultationManagement from "./pages/ConsultationManagement.tsx";
import { ConsultationPlanDetail } from "./pages/ConsultationPlanDetail.tsx";
import { TimeSlotDetail } from "./pages/TimeSlotDetail.tsx";
import Bookings from "./pages/BookingsManagement.tsx";
import BookingDetails from "./pages/BookingDetails.tsx";
import LearnManagement from "./pages/LearnManagement.tsx";
import LearnDetail from "./pages/LearnDetail.tsx";
import AdminCart from "./pages/AdminCart.tsx";
import Checkout from "./pages/Checkout.tsx";
import AddDamagedReturn from "./pages/AddDamagedReturn";
import DamagedReturned from "./pages/DamagedReturned.tsx";
import ReturnDetails from "./pages/ReturnDetails.tsx";
import Notifications from "./pages/Notifications.tsx";
import NotificationsListener from "./components/NotificationsListener";
import AdminAccounts from "./pages/AdminAccounts.tsx";
import AddAdmin from "./pages/AddAdmin.tsx";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <NotificationsListener />
      {/*<Navigationbar />*/}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventory/returns" element={<DamagedReturned />} />
        <Route path="/admin-accounts" element={<AdminAccounts />} />
        <Route path="/admins/add" element={<AddAdmin />} />
        <Route path="/notifications" element={<Notifications />}></Route>
        <Route path="/orders" element={<AdminOrders />} />
        <Route path="/admin/checkout" element={<Checkout />} />
        <Route path="/inventory/returns/:id" element={<ReturnDetails />} />
        <Route path="/returns/add" element={<AddDamagedReturn />} />
        <Route path="/learn/:id" element={<LearnDetail />} />
        <Route path="/admin/cart" element={<AdminCart />} />
        <Route path="/orders/:orderId" element={<OrderDetails />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/bookings/:bookingId" element={<BookingDetails />} />
        <Route
          path="/consultationplan-detail/:id"
          element={<ConsultationPlanDetail />}
        />
        <Route path="/timeslot-detail/:id" element={<TimeSlotDetail />} />
        <Route path="/consultation" element={<ConsultationManagement />} />
        <Route path="/user/:id" element={<UserDetails />} />
        <Route path="/inventory" element={<Inventory />}></Route>
        <Route path="/sales" element={<SalesManagement />}></Route>
        <Route path="/ads" element={<AdvertisementManagement />} />
        <Route path="/payment-methods" element={<PaymentMethods />} />
        <Route
          path="/inventory/inventory-details/:id"
          element={<ViewProduct />}
        />
        <Route path="/categories/add" element={<AddCategory />} />
        <Route path="/categories" element={<CategoriesList />} />
        <Route path="/categories/:id" element={<CategoryDetails />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/inventory/add-product" element={<AddProduct />}></Route>
        <Route path="learn" element={<LearnManagement />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
