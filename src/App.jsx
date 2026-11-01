import { Route, Routes, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";

import {
  StandardPage,
  Admissions,
  Gallery,
  Contact,
} from "./pages/InnerPages";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdmissionTracker from "./pages/AdmissionTracker";

import ParentAuth from "./pages/ParentAuth";
import ParentDashboard from "./pages/ParentDashboard";
import ForgotPassword from "./pages/ForgotPassword";

function PublicLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<StandardPage kind="About" />} />
          <Route path="/academics" element={<StandardPage kind="Academics" />} />
          <Route path="/campus" element={<StandardPage kind="Campus" />} />
          <Route path="/student-life" element={<StandardPage kind="Student Life" />} />
          <Route path="/admissions" element={<Admissions />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/parent/login" element={<ParentAuth mode="login" />} />
          <Route path="/parent/register" element={<ParentAuth mode="register" />} />
<Route path="/parent/forgot-password" element={<ForgotPassword />} />
          <Route path="/parent/dashboard" element={<ParentDashboard />} />

          <Route path="/admission-tracker" element={<AdmissionTracker />} />

          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  if (isAdminRoute) {
    return (
      <>
        <ScrollToTop />
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="*" element={<AdminLogin />} />
        </Routes>
      </>
    );
  }

  return (
    <>
      <ScrollToTop />
      <PublicLayout />
    </>
  );
}

