import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ThemeHall from "@/pages/ThemeHall";
import ThemeDetail from "@/pages/ThemeDetail";
import MyBookings from "@/pages/MyBookings";
import AdminLayout from "@/pages/admin/AdminLayout";
import ScheduleOverview from "@/pages/admin/ScheduleOverview";
import ThemeManagement from "@/pages/admin/ThemeManagement";
import OnsiteControl from "@/pages/admin/OnsiteControl";
import Statistics from "@/pages/admin/Statistics";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ThemeHall />} />
        <Route path="/theme/:id" element={<ThemeDetail />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<ScheduleOverview />} />
          <Route path="themes" element={<ThemeManagement />} />
          <Route path="onsite" element={<OnsiteControl />} />
          <Route path="stats" element={<Statistics />} />
        </Route>
      </Routes>
    </Router>
  );
}
