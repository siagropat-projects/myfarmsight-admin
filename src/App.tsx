import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router";
import Login from "./pages/auth/Login";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import { Toaster } from "sonner";
import Farmers from "./pages/farmers/Farmers";
import CreateFarmer from "./pages/farmers/CreateFarmer";
import FarmersDetails from "./pages/farmers/FarmersDetails";
import Settings from "./pages/settings/Settings";
import Vets from "./pages/vets/Vets";
import LMS from "./pages/lms/LMS";
import Reports from "./pages/reports/Reports";
import Revenue from "./pages/revenue/Revenue";
import VetsDetails from "./pages/vets/VetsDetails";
import CreateVet from "./pages/vets/CreateVet";
import Details from "./pages/lms/Details";
import Create from "./pages/lms/Create";
import ActivityLog from "./pages/ActivityLog";
import Wallet from "./pages/Wallet";
import Support from "./pages/Support";

export default function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
          <Route path="" element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/support" element={<Support />} />
            <Route path="/activity-log" element={<ActivityLog />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/farmers">
              <Route path="" element={<Farmers />} />
              <Route path="create" element={<CreateFarmer />} />
              <Route path=":id" element={<FarmersDetails />} />
            </Route>
            <Route path="/vets">
              <Route path="" element={<Vets />} />
              <Route path="create" element={<CreateVet />} />
              <Route path=":id" element={<VetsDetails />} />
            </Route>
            <Route path="/lms">
              <Route path="" element={<LMS />} />
              <Route path="create" element={<Create />} />
              <Route path=":id" element={<Details />} />
            </Route>
            <Route path="/revenue">
              <Route path="" element={<Revenue />} />
            </Route>
            <Route path="/reports">
              <Route path="" element={<Reports />} />
            </Route>

          </Route>
        </Routes>
      </Router>
    </>
  );
}
