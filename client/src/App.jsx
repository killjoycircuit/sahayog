import { Routes, Route } from "react-router-dom";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import Layout from "./Layout.jsx";
import { UserContextProvider } from "./context/UserContext.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import AboutUs from "./pages/AboutUs.jsx";
import EventsPage from "./pages/EventsPage.jsx";
import EventFormPage from "./pages/EventFormPage.jsx";
import MyCampaignsPage from "./pages/MyCampaignsPage.jsx";
import MyContributionsPage from "./pages/MyContributionsPage.jsx";
import ContributionPage from "./pages/ContributionPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";

// Configure Axios defaults
axios.defaults.baseURL = "http://localhost:5000";
axios.defaults.withCredentials = true;

function App() {
  return (
    <UserContextProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/create-event" element={<EventFormPage />} />
          {/* --- THIS IS THE NEW ROUTE FOR EDITING --- */}
          <Route path="/edit-event/:id" element={<EventFormPage />} />
          <Route path="/my-campaigns" element={<MyCampaignsPage />} />
          <Route path="/my-contributions" element={<MyContributionsPage />} />
          {/* --- NEW CONTRIBUTION FLOW ROUTES --- */}
          <Route path="/contribute/:eventId" element={<ContributionPage />} />
          <Route path="/checkout/:eventId" element={<CheckoutPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>

      {/* Add Toaster component for toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#333",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            borderRadius: "8px",
            padding: "16px",
          },
          success: {
            iconTheme: {
              primary: "#008080",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
    </UserContextProvider>
  );
}

export default App;
